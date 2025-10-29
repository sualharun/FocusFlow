import React, { useState, useRef, useEffect } from 'react';
import { useSettings } from './SettingsModal';

const MusicWidget = () => {
  const { settings, updateSettings } = useSettings();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [playerInitialized, setPlayerInitialized] = useState(false);
  const playerRef = useRef(null);
  const playerInstanceRef = useRef(null);
  const hiddenPlayerRef = useRef(null);

  // Music categories with curated YouTube video IDs
  const musicCategories = {
    lofi: {
      name: 'Lo-Fi Study',
      icon: '🎧',
      tracks: [
        {
          id: 'jfKfPfyJRdk',
          title: 'Lofi Hip Hop Radio - Beats to Relax/Study to',
          duration: 'Live Stream'
        },
        // other curated lofi mixes can be added here
      ]
    },
    rain: {
      name: 'Rain Sounds',
      icon: '🌧️',
      tracks: [
        {
          id: 'mPZkdNFkNps',
          title: 'Heavy Rain & Thunder Sounds',
          duration: '10:00:00'
        }
      ]
    },

  };

  const [apiReady, setApiReady] = useState(false);

  // Load YouTube IFrame API
  useEffect(() => {
    // Check if API is already loaded
    if (window.YT && window.YT.Player) {
      setApiReady(true);
      return;
    }

    // Load the API if not already loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      // Global callback for YouTube API
      window.onYouTubeIframeAPIReady = () => {
        console.log('YouTube API Ready');
        setApiReady(true);
      };
    }

    return () => {
      // Cleanup
      if (playerInstanceRef.current) {
        try {
          playerInstanceRef.current.destroy();
        } catch (error) {
          console.log('Error destroying player:', error);
        }
      }
    };
  }, []);

  // Initialize YouTube player once when API is ready
  useEffect(() => {
    if (apiReady && window.YT && !playerInstanceRef.current && settings.musicEnabled) {
      const category = musicCategories[settings.musicCategory] || musicCategories.lofi;
      const defaultTrack = category.tracks[0];
      setCurrentTrack(defaultTrack);
      
      // Create a hidden div for the player that persists
      if (!hiddenPlayerRef.current) {
        hiddenPlayerRef.current = document.createElement('div');
        hiddenPlayerRef.current.id = 'hidden-youtube-player';
        hiddenPlayerRef.current.style.position = 'absolute';
        hiddenPlayerRef.current.style.left = '-9999px';
        hiddenPlayerRef.current.style.width = '200px';
        hiddenPlayerRef.current.style.height = '200px';
        document.body.appendChild(hiddenPlayerRef.current);
      }
      
      try {
        playerInstanceRef.current = new window.YT.Player(hiddenPlayerRef.current, {
          height: '200',
          width: '200',
          videoId: defaultTrack.id,
          playerVars: {
            autoplay: settings.musicAutoplay ? 1 : 0,
            controls: 0,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            origin: window.location.origin
          },
          events: {
            onReady: (event) => {
              console.log('YouTube player ready');
              setPlayerReady(true);
              setPlayerInitialized(true);
              event.target.setVolume(settings.musicVolume * 100);
              if (settings.musicAutoplay) {
                event.target.playVideo();
              }
            },
            onStateChange: (event) => {
              console.log('Player state changed:', event.data);
              setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
            },
            onError: (event) => {
              console.error('YouTube player error:', event.data);
            }
          }
        });
      } catch (error) {
        console.error('Error creating YouTube player:', error);
      }
    }
    
    // Cleanup function
    return () => {
      if (hiddenPlayerRef.current && document.body.contains(hiddenPlayerRef.current)) {
        document.body.removeChild(hiddenPlayerRef.current);
      }
    };
  }, [apiReady, settings.musicEnabled]);

  // Update volume when changed
  useEffect(() => {
    if (playerInstanceRef.current && playerInstanceRef.current.setVolume) {
      playerInstanceRef.current.setVolume(settings.musicVolume * 100);
    }
  }, [settings.musicVolume]);

  const togglePlay = () => {
    console.log('Toggle play clicked', { 
      playerExists: !!playerInstanceRef.current, 
      isPlaying,
      apiReady 
    });
    
    if (playerInstanceRef.current && typeof playerInstanceRef.current.playVideo === 'function') {
      try {
        if (isPlaying) {
          playerInstanceRef.current.pauseVideo();
        } else {
          playerInstanceRef.current.playVideo();
        }
      } catch (error) {
        console.error('Error toggling playback:', error);
      }
    } else {
      console.error('Player not ready or methods not available');
    }
  };

  const selectTrack = (track) => {
    if (playerInstanceRef.current && typeof playerInstanceRef.current.loadVideoById === 'function') {
      try {
        playerInstanceRef.current.loadVideoById(track.id);
        setCurrentTrack(track);
        setPlayerReady(true);
      } catch (error) {
        console.error('Error loading track:', error);
      }
    }
  };

  const reinitializePlayer = () => {
    if (playerInstanceRef.current) {
      try {
        playerInstanceRef.current.destroy();
      } catch (error) {
        console.log('Error destroying old player:', error);
      }
    }
    playerInstanceRef.current = null;
    setPlayerReady(false);
    setPlayerInitialized(false);
    
    // Remove hidden player div
    if (hiddenPlayerRef.current && document.body.contains(hiddenPlayerRef.current)) {
      document.body.removeChild(hiddenPlayerRef.current);
      hiddenPlayerRef.current = null;
    }
    
    // Trigger re-initialization
    setTimeout(() => {
      const category = musicCategories[settings.musicCategory] || musicCategories.lofi;
      const defaultTrack = category.tracks[0];
      setCurrentTrack(defaultTrack);
    }, 100);
  };

  const switchCategory = (category) => {
    updateSettings({ musicCategory: category });
    const firstTrack = musicCategories[category].tracks[0];
    selectTrack(firstTrack);
  };

  // Handle category changes
  useEffect(() => {
    if (playerInstanceRef.current && playerInitialized) {
      const category = musicCategories[settings.musicCategory] || musicCategories.lofi;
      const defaultTrack = category.tracks[0];
      if (currentTrack?.id !== defaultTrack.id) {
        selectTrack(defaultTrack);
      }
    }
  }, [settings.musicCategory, playerInitialized]);

  // Don't render if music is disabled
  if (!settings.musicEnabled) {
    return null;
  }

  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setIsExpanded(true)}
          className="theme-card enhanced-shadow rounded-lg p-3 hover:shadow-lg transition-all duration-200 group relative"
        >
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-lg">🎵</span>
            <span className="text-gray-700 group-hover:text-gray-900">
              Music {isPlaying && playerReady && '🔊'}
            </span>
          </div>
          {isPlaying && playerReady && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="theme-card enhanced-shadow rounded-lg p-4 w-80">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 flex items-center space-x-2">
            <span>{(musicCategories[settings.musicCategory] || musicCategories.lofi).icon}</span>
            <span>{(musicCategories[settings.musicCategory] || musicCategories.lofi).name}</span>
          </h3>
          <button
            onClick={() => setIsExpanded(false)}
            className="text-gray-500 hover:text-gray-700 text-lg"
          >
            ✕
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex space-x-1 mb-4 bg-gray-100 rounded-lg p-1">
          {Object.entries(musicCategories).map(([key, category]) => (
            <button
              key={key}
              onClick={() => switchCategory(key)}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                settings.musicCategory === key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <span className="mr-1">{category.icon}</span>
              <span className="hidden sm:inline">{category.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Video Display Area */}
        <div className="mb-4 rounded-lg overflow-hidden bg-black relative h-48 flex items-center justify-center">
          {!playerReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                <div className="text-sm">Loading player...</div>
              </div>
            </div>
          )}
          {playerReady && (
            <div className="text-center text-white p-6">
              <div className="text-4xl mb-4">
                {(musicCategories[settings.musicCategory] || musicCategories.lofi).icon}
              </div>
              <div className="text-lg font-medium mb-2">
                {currentTrack?.title || 'No track selected'}
              </div>
              <div className="text-sm text-gray-300">
                {isPlaying ? '🔊 Now Playing' : '⏸️ Paused'}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-2">
            <button
              onClick={togglePlay}
              disabled={!playerReady}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                !playerReady
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : isPlaying
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {!playerReady ? '⏳ Loading...' : isPlaying ? '⏸️ Pause' : '▶️ Play'}
            </button>
            
            {!playerReady && apiReady && (
              <button
                onClick={reinitializePlayer}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
              >
                🔄 Retry
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2 flex-1 ml-4">
            <span className="text-xs text-gray-500">🔊</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.musicVolume}
              onChange={(e) => updateSettings({ musicVolume: parseFloat(e.target.value) })}
              className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs text-gray-500 w-8">{Math.round(settings.musicVolume * 100)}%</span>
          </div>
        </div>

        {/* Current Track Info */}
        {currentTrack && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-800 truncate">
              {currentTrack.title}
            </div>
            <div className="text-xs text-gray-500">
              Duration: {currentTrack.duration}
            </div>
          </div>
        )}

        {/* Track List */}
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {(musicCategories[settings.musicCategory] || musicCategories.lofi).tracks.map((track, index) => (
            <button
              key={track.id}
              onClick={() => selectTrack(track)}
              className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${
                currentTrack?.id === track.id
                  ? 'bg-blue-100 border border-blue-300'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="font-medium text-gray-800 truncate">
                {track.title}
              </div>
              <div className="text-xs text-gray-500">
                {track.duration}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MusicWidget;