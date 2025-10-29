import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { useSettings } from './SettingsModal';
import AlarmSystem from './AlarmSystem';

const Timer = ({ session, user, onActivityUpdate, onSessionEnd, onSessionUpdate }) => {
  const { settings } = useSettings();
  const { playAlarm } = AlarmSystem();
  const [timeLeft, setTimeLeft] = useState(
    session.currentTimeLeft !== undefined && session.currentTimeLeft !== null 
      ? session.currentTimeLeft 
      : Math.round(session.durationMinutes * 60)
  );
  const [isRunning, setIsRunning] = useState(session.isRunning || false);
  const [isBreak, setIsBreak] = useState(session.isBreak || false);
  const [currentCycle, setCurrentCycle] = useState(session.currentCycle || 1);
  const [sessionStatus, setSessionStatus] = useState(session.status);
  const [showEndConfirmation, setShowEndConfirmation] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(session.status === 'COMPLETED');

  // Helper function to format decimal minutes to minutes and seconds
  const formatMinutes = (decimalMinutes) => {
    if (!decimalMinutes || isNaN(decimalMinutes)) {
      return '0 min';
    }
    
    const totalSeconds = Math.round(decimalMinutes * 60);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    if (totalSeconds < 60) {
      return `${totalSeconds} sec`;
    } else if (seconds === 0) {
      return `${minutes} min`;
    } else {
      return `${minutes} min ${seconds} sec`;
    }
  };
  
  const intervalRef = useRef(null);
  const stompClientRef = useRef(null);

  useEffect(() => {
    // Initialize WebSocket connection
    const socket = new SockJS('http://localhost:8080/ws');
    const stompClient = Stomp.over(socket);
    
    stompClient.connect({}, () => {
      console.log('Connected to WebSocket');
      
      // Subscribe to session updates
      stompClient.subscribe(`/topic/session/${session.sessionCode}`, (message) => {
        const updatedSession = JSON.parse(message.body);
        console.log('Received session update:', updatedSession);
        
        // Sync timer state with other users
        if (updatedSession.currentTimeLeft !== undefined) {
          setTimeLeft(updatedSession.currentTimeLeft);
        }
        if (updatedSession.isRunning !== undefined) {
          setIsRunning(updatedSession.isRunning);
        }
        if (updatedSession.isBreak !== undefined) {
          setIsBreak(updatedSession.isBreak);
        }
        
        setSessionStatus(updatedSession.status);
        setCurrentCycle(updatedSession.currentCycle);
        
        // Don't log automatic timer state syncs to prevent duplicate notifications
        // These happen frequently and would clutter the activity log
      });
      
      // Subscribe to user join notifications
      stompClient.subscribe(`/topic/session/${session.sessionCode}/user-joined`, (message) => {
        const joinData = JSON.parse(message.body);
        console.log('User joined session:', joinData);
        
        onActivityUpdate({
          type: 'USER_JOINED',
          message: `${joinData.user} joined the session`,
          timestamp: new Date()
        });
      });
    });
    
    stompClientRef.current = stompClient;
    
    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.disconnect();
      }
    };
  }, [session.sessionCode, onActivityUpdate]);

  const updateSessionStatus = async (status) => {
    // Don't update if already completed (unless explicitly setting to completed)
    if ((isCompleting || sessionCompleted || sessionStatus === 'COMPLETED') && status !== 'COMPLETED') {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:8080/api/sessions/${session.id}/status`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        console.error('Failed to update session status. Response:', response.status, response.statusText);
        return;
      }
      
      // Update session status locally and notify parent
      setSessionStatus(status);
      if (onSessionUpdate) {
        onSessionUpdate({ 
          ...session,
          status,
          currentCycle,
          isBreak,
          isRunning: status === 'ACTIVE' ? true : status === 'PAUSED' ? false : isRunning
        });
      }
    } catch (error) {
      console.error('Error updating session status:', error);
    }
  };

  const updateCurrentCycle = async (cycle) => {
    try {
      const response = await fetch(`http://localhost:8080/api/sessions/${session.id}/cycle`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cycle }),
      });
      
      if (!response.ok) {
        console.error('Failed to update current cycle. Response:', response.status, response.statusText);
        return;
      }
    } catch (error) {
      console.error('Error updating current cycle:', error);
    }
  };

  const updateTimerState = async (timeLeftValue, isRunningValue, isBreakValue) => {
    // Don't update timer state if session is completed
    if (isCompleting || sessionCompleted || sessionStatus === 'COMPLETED') {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:8080/api/sessions/${session.id}/timer-state`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          timeLeft: timeLeftValue,
          isRunning: isRunningValue,
          isBreak: isBreakValue
        }),
      });
      
      if (!response.ok) {
        console.error('Failed to update timer state. Response:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error updating timer state:', error);
    }
  };

  const handleTimerComplete = React.useCallback(async () => {
    setIsRunning(false);
    
    // Play alarm sound when timer completes
    playAlarm(settings.alarmSound, settings.volume);
    
    if (!isBreak) {
      // Work session completed, start break
      if (currentCycle < session.totalCycles) {
        // Regular short break between cycles
        setIsBreak(true);
        setTimeLeft(Math.round(settings.shortBreakDuration * 60));
        onActivityUpdate({
          type: 'BREAK_STARTED',
          message: `Break time! Cycle ${currentCycle} completed.`,
          timestamp: new Date()
        });
        
        // Update timer state without triggering additional logs
        await updateTimerState(Math.round(settings.shortBreakDuration * 60), false, true);
        
        // Update history with break state (without triggering WebSocket sync)
        if (onSessionUpdate) {
          onSessionUpdate({ 
            ...session,
            status: 'ACTIVE',
            currentCycle,
            isBreak: true,
            isRunning: false
          });
        }
      } else {
        // All work cycles completed - start long break
        setIsBreak(true);
        setTimeLeft(Math.round(settings.longBreakDuration * 60));
        
        // Update current cycle to reflect completion of the last work cycle
        await updateCurrentCycle(currentCycle);
        
        onActivityUpdate({
          type: 'BREAK_STARTED',
          message: `Long break time! All ${session.totalCycles} cycles completed.`,
          timestamp: new Date()
        });
        
        // Update timer state for long break
        await updateTimerState(Math.round(settings.longBreakDuration * 60), false, true);
        
        // Update history with long break state
        if (onSessionUpdate) {
          onSessionUpdate({ 
            ...session,
            status: 'ACTIVE',
            currentCycle,
            isBreak: true,
            isRunning: false
          });
        }
        
        // Log that all work cycles are done
        console.log(`🎉 All ${session.totalCycles} work cycles completed! Starting final break.`);
      }
    } else {
      // Break completed
      if (currentCycle >= session.totalCycles) {
        // Long break completed - mark session as completed
        if (!sessionCompleted) {
          setSessionCompleted(true);
          setIsCompleting(true);
          setIsRunning(false);
          setIsBreak(false);
          
          // Explicitly update session status to completed
          await updateSessionStatus('COMPLETED');
          
          // Ensure cycle is set to total cycles (completed)
          await updateCurrentCycle(session.totalCycles);
          
          onActivityUpdate({
            type: 'SESSION_COMPLETED',
            message: 'Congratulations! Focus session and long break completed.',
            timestamp: new Date()
          });
          
          // Update history with completed state - ensure all fields are correct
          if (onSessionUpdate) {
            onSessionUpdate({ 
              ...session,
              status: 'COMPLETED',
              currentCycle: session.totalCycles,
              isBreak: false,
              isRunning: false,
              currentTimeLeft: 0
            });
          }
          
          // Log completion for debugging
          console.log(`✅ Session ${session.id} marked as COMPLETED with ${session.totalCycles}/${session.totalCycles} cycles`);
        }
      } else {
        // Regular break completed, start next work session
        setIsBreak(false);
        setTimeLeft(Math.round(settings.workDuration * 60));
        const nextCycle = currentCycle + 1;
        setCurrentCycle(nextCycle);
        
        await updateCurrentCycle(nextCycle);
        
        onActivityUpdate({
          type: 'CYCLE_STARTED',
          message: `Starting cycle ${nextCycle}`,
          timestamp: new Date()
        });
        
        // Update history with new cycle state
        if (onSessionUpdate) {
          onSessionUpdate({ 
            ...session,
            status: 'ACTIVE',
            currentCycle: nextCycle,
            isBreak: false,
            isRunning: false
          });
        }
      }
    }
  }, [isBreak, currentCycle, session.totalCycles, settings, onActivityUpdate, updateSessionStatus, updateCurrentCycle, playAlarm, isCompleting, onSessionUpdate, sessionCompleted, session]);

  useEffect(() => {
    // Don't run timer if session is already completed or completing
    if (sessionStatus === 'COMPLETED' || isCompleting || sessionCompleted) {
      clearInterval(intervalRef.current);
      setIsRunning(false); // Ensure running state is false
      return;
    }
    
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          const newTimeLeft = prev - 1;
          // Broadcast timer state every 5 seconds to keep users in sync
          if (newTimeLeft % 5 === 0) {
            updateTimerState(newTimeLeft, true, isBreak);
          }
          return newTimeLeft;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
      
      if (timeLeft === 0 && !isCompleting) {
        handleTimerComplete();
      }
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft, handleTimerComplete, sessionStatus, isCompleting, isBreak]);

  // Completion check effect - ensures sessions are marked as complete when they should be
  useEffect(() => {
    const checkCompletion = async () => {
      // Skip if already completed or in the process of completing
      if (sessionCompleted || isCompleting || sessionStatus === 'COMPLETED') {
        return;
      }
      
      // Check if all work cycles are done and we're not in a break, or if we completed all cycles including the long break
      const allCyclesComplete = currentCycle >= session.totalCycles;
      const shouldBeCompleted = allCyclesComplete && (!isBreak || (isBreak && timeLeft === 0));
      
      if (shouldBeCompleted) {
        console.log(`🔍 Completion check: Marking session as complete. Cycles: ${currentCycle}/${session.totalCycles}, isBreak: ${isBreak}, timeLeft: ${timeLeft}`);
        
        setSessionCompleted(true);
        setIsCompleting(true);
        setIsRunning(false);
        setIsBreak(false);
        
        // Update session status to completed
        await updateSessionStatus('COMPLETED');
        
        // Also trigger backend completion check to ensure consistency
        try {
          await fetch(`http://localhost:8080/api/sessions/${session.id}/check-completion`, {
            method: 'POST',
            credentials: 'include'
          });
        } catch (error) {
          console.log('Completion check request failed, but continuing with frontend completion:', error);
        }
        
        onActivityUpdate({
          type: 'SESSION_COMPLETED',
          message: 'Session completed successfully!',
          timestamp: new Date()
        });
        
        // Update history with completed state
        if (onSessionUpdate) {
          onSessionUpdate({ 
            ...session,
            status: 'COMPLETED',
            currentCycle: session.totalCycles,
            isBreak: false,
            isRunning: false,
            currentTimeLeft: 0
          });
        }
      }
    };
    
    // Run check periodically to catch any missed completion scenarios
    const completionInterval = setInterval(checkCompletion, 2000);
    
    return () => clearInterval(completionInterval);
  }, [currentCycle, session.totalCycles, isBreak, timeLeft, sessionCompleted, isCompleting, sessionStatus, session, onActivityUpdate, onSessionUpdate, updateSessionStatus]);

  const toggleTimer = async () => {
    // Prevent timer operations if session is completed
    if (isCompleting || sessionStatus === 'COMPLETED' || sessionCompleted) {
      return;
    }
    
    const newRunningState = !isRunning;
    setIsRunning(newRunningState);
    
    // Broadcast timer state to other users
    await updateTimerState(timeLeft, newRunningState, isBreak);
    
    if (newRunningState) {
      await updateSessionStatus('ACTIVE');
      onActivityUpdate({
        type: 'TIMER_STARTED',
        message: isBreak ? 'Break timer started' : 'Focus timer started',
        timestamp: new Date()
      });
    } else {
      await updateSessionStatus('PAUSED');
      onActivityUpdate({
        type: 'TIMER_PAUSED',
        message: isBreak ? 'Break timer paused' : 'Focus timer paused',
        timestamp: new Date()
      });
    }
    
    // Update history with current session state
    if (onSessionUpdate) {
      onSessionUpdate({ 
        ...session,
        status: newRunningState ? 'ACTIVE' : 'PAUSED',
        currentCycle,
        isBreak,
        isRunning: newRunningState
      });
    }
  };

  const resetTimer = async () => {
    // Prevent timer operations if session is completed
    if (isCompleting || sessionStatus === 'COMPLETED' || sessionCompleted) {
      return;
    }
    
    const newTimeLeft = Math.round(session.durationMinutes * 60);
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(newTimeLeft);
    
    // Broadcast timer reset to other users
    await updateTimerState(newTimeLeft, false, false);
    
    onActivityUpdate({
      type: 'TIMER_RESET',
      message: 'Timer reset',
      timestamp: new Date()
    });
    
    // Update history with reset state
    if (onSessionUpdate) {
      onSessionUpdate({ 
        ...session,
        status: 'ACTIVE',
        currentCycle: 1,
        isBreak: false,
        isRunning: false
      });
    }
  };

  const handleEndSession = () => {
    // If session is completed, finish directly without confirmation
    if (isCompleting || sessionStatus === 'COMPLETED' || sessionCompleted) {
      onSessionEnd();
      return;
    }
    
    // For active sessions, show confirmation dialog
    setShowEndConfirmation(true);
  };

  const confirmEndSession = async () => {
    // Stop the timer if running
    setIsRunning(false);
    
    console.log('🔧 DEBUG: Ending session early, updating status to ENDED_EARLY');
    
    // Mark session as ended early in the backend
    try {
      await updateSessionStatus('ENDED_EARLY');
      console.log('🔧 DEBUG: Session status updated to ENDED_EARLY successfully');
    } catch (error) {
      console.error('🔧 ERROR: Failed to update session status to ENDED_EARLY:', error);
    }
    
    // Log the session end
    onActivityUpdate({
      type: 'SESSION_ENDED',
      message: 'Session ended early by user',
      timestamp: new Date()
    });

    // Update history with ended early state
    if (onSessionUpdate) {
      console.log('🔧 DEBUG: Updating session in history with ENDED_EARLY status');
      onSessionUpdate({ 
        ...session,
        status: 'ENDED_EARLY',
        currentCycle,
        isBreak: false,
        isRunning: false
      });
    }

    // Close confirmation dialog
    setShowEndConfirmation(false);
    
    // Call the parent handler to end the session
    onSessionEnd();
  };

  const cancelEndSession = () => {
    setShowEndConfirmation(false);
  };

  const formatTime = (seconds) => {
    const roundedSeconds = Math.round(seconds);
    const minutes = Math.floor(roundedSeconds / 60);
    const remainingSeconds = roundedSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (sessionStatus === 'COMPLETED') return 'text-green-600';
    if (isBreak) return 'text-blue-600';
    return 'text-red-600';
  };

  const getProgressPercentage = () => {
    let totalTime;
    if (isBreak) {
      // Use long break duration if we're in a long break (after all cycles completed)
      totalTime = currentCycle >= session.totalCycles 
        ? settings.longBreakDuration * 60 
        : settings.shortBreakDuration * 60;
    } else {
      totalTime = session.durationMinutes * 60;
    }
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  if (sessionStatus === 'COMPLETED') {
    return (
      <div className="theme-card-transparent enhanced-shadow rounded-lg p-8 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold text-green-600 mb-4">Session Complete!</h2>
        <p className="text-gray-600 mb-4">
          Congratulations! You've completed all {session.totalCycles} cycles.
        </p>
        <div className="bg-green-100 rounded-lg p-4">
          <p className="text-green-700">Total Focus Time: {session.totalCycles * session.durationMinutes} minutes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-card-transparent enhanced-shadow rounded-lg p-8">
      {/* Session Info */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Focus Session
        </h2>
        <div className="flex justify-center items-center space-x-6 text-sm text-gray-600">
          <span>Cycle {currentCycle} of {session.totalCycles}</span>
          <span className="bg-gray-100 px-2 py-1 rounded">
            {isBreak ? (currentCycle >= session.totalCycles ? 'Long Break' : 'Break Time') : 'Focus Time'}
          </span>
          <span className={`px-2 py-1 rounded font-semibold ${
            sessionStatus === 'ACTIVE' ? 'bg-green-100 text-green-800' :
            sessionStatus === 'PAUSED' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {sessionStatus}
          </span>
        </div>
      </div>

      {/* Timer Display */}
      <div className="text-center mb-8">
        <div className={`text-8xl font-mono font-bold mb-4 ${getTimerColor()}`}>
          {formatTime(timeLeft)}
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div 
            className={`h-3 rounded-full transition-all duration-1000 ${
              isBreak ? 'bg-blue-500' : 'bg-red-500'
            }`}
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
      </div>

      {/* Timer Controls */}
      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={toggleTimer}
          disabled={isCompleting || sessionStatus === 'COMPLETED' || sessionCompleted}
          className={`px-8 py-3 rounded-lg font-semibold text-white transition-colors ${
            (isCompleting || sessionStatus === 'COMPLETED' || sessionCompleted)
              ? 'bg-gray-400 cursor-not-allowed'
              : isRunning 
                ? 'bg-yellow-600 hover:bg-yellow-700' 
                : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {(isCompleting || sessionStatus === 'COMPLETED' || sessionCompleted) 
            ? 'Completed' 
            : (isRunning ? 'Pause' : 'Start')
          }
        </button>
        
        <button
          onClick={resetTimer}
          disabled={isCompleting || sessionStatus === 'COMPLETED' || sessionCompleted}
          className={`px-8 py-3 rounded-lg font-semibold text-white transition-colors ${
            (isCompleting || sessionStatus === 'COMPLETED' || sessionCompleted)
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gray-600 hover:bg-gray-700'
          }`}
        >
          Reset
        </button>

        <button
          onClick={handleEndSession}
          className={`px-8 py-3 rounded-lg font-semibold text-white transition-colors ${
            (isCompleting || sessionStatus === 'COMPLETED' || sessionCompleted)
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {(isCompleting || sessionStatus === 'COMPLETED' || sessionCompleted) 
            ? 'Finish' 
            : 'End Session'
          }
        </button>
      </div>

      {/* Session Details */}
      <div className="grid grid-cols-4 gap-4 text-center text-sm text-gray-600">
        <div className="bg-gray-50 p-3 rounded">
          <div className="font-semibold text-gray-800">Focus</div>
          <div>{formatMinutes(settings.workDuration)}</div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <div className="font-semibold text-gray-800">Break</div>
          <div>{formatMinutes(settings.shortBreakDuration)}</div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <div className="font-semibold text-gray-800">Long Break</div>
          <div>{formatMinutes(settings.longBreakDuration)}</div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <div className="font-semibold text-gray-800">Cycles</div>
          <div>{currentCycle}/{session.totalCycles}</div>
        </div>
      </div>

      {/* End Session Confirmation Modal */}
      {showEndConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="theme-card-opaque enhanced-shadow p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              End Session?
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to end this session? This will stop the timer and return you to the main screen.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelEndSession}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmEndSession}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                End Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timer;