import React, { useRef, useCallback } from 'react';

const AlarmSystem = () => {
  const audioContextRef = useRef(null);

  // Initialize audio context
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playAlarm = useCallback(async (soundType = 'beep', volume = 0.5) => {
    try {
      const audioContext = getAudioContext();
      
      // Resume audio context if it's suspended (browser policy)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      // Different alarm sounds with enhanced quality
      switch (soundType.toLowerCase()) {
        case 'beep':
          playBeepSequence(audioContext, volume);
          break;
        case 'chime':
          playChimeSequence(audioContext, volume);
          break;
        case 'bell':
          playBellSound(audioContext, volume);
          break;
        case 'digital':
          playDigitalSound(audioContext, volume);
          break;
        default:
          playBeepSequence(audioContext, volume);
      }

    } catch (error) {
      console.error('Error playing alarm sound:', error);
      // Fallback to basic beep
      playFallbackBeep();
    }
  }, [getAudioContext]);

  // Enhanced beep sequence
  const playBeepSequence = (audioContext, volume) => {
    const times = [0, 0.15, 0.3];
    times.forEach((startTime) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + startTime);
      gainNode.gain.setValueAtTime(0, audioContext.currentTime + startTime);
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + startTime + 0.1);
      
      oscillator.start(audioContext.currentTime + startTime);
      oscillator.stop(audioContext.currentTime + startTime + 0.1);
    });
  };

  // Musical chime sequence
  const playChimeSequence = (audioContext, volume) => {
    const notes = [
      { freq: 523.25, start: 0 },    // C5
      { freq: 659.25, start: 0.2 },  // E5
      { freq: 783.99, start: 0.4 }   // G5
    ];
    
    notes.forEach(({ freq, start }) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + start);
      gainNode.gain.setValueAtTime(0, audioContext.currentTime + start);
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + start + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + start + 0.4);
      
      oscillator.start(audioContext.currentTime + start);
      oscillator.stop(audioContext.currentTime + start + 0.4);
    });
  };

  // Bell sound with realistic decay
  const playBellSound = (audioContext, volume) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 1);
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1);
  };

  // Digital alarm sound
  const playDigitalSound = (audioContext, volume) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.15);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.25);
    gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.3);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.4);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.4);
  };

  // Fallback beep for when Web Audio API fails
  const playFallbackBeep = () => {
    console.log('🔊 Timer completed!');
  };

  return { playAlarm };
};

export default AlarmSystem;
