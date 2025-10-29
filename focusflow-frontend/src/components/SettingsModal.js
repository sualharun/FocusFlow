import React, { createContext, useContext, useState } from 'react';
import AlarmSystem from './AlarmSystem';

// Settings Context
const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    theme: 'mountain',
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    alarmSound: 'beep',
    volume: 0.5,
    musicEnabled: true,
    musicCategory: 'lofi',
    musicVolume: 0.3,
    musicAutoplay: false
  });

  const updateSettings = (newSettings) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  };

  const syncWithSession = (session) => {
    if (session) {
      setSettings(prev => ({
        ...prev,
        workDuration: session.durationMinutes,
        shortBreakDuration: session.breakMinutes,
        longBreakDuration: session.longBreakMinutes
      }));
    }
  };

  const value = {
    settings,
    updateSettings,
    syncWithSession
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

// Settings Modal Component
const SettingsModal = ({ isOpen, onClose, onShowWelcome }) => {
  const { settings, updateSettings } = useSettings();
  const { playAlarm } = AlarmSystem();
  const [activeTab, setActiveTab] = useState('general');

  if (!isOpen) return null;

  const themes = [
    { id: 'forest', name: 'Forest', preview: 'bg-gradient-to-br from-green-100 to-emerald-200' },
    { id: 'ocean', name: 'Ocean', preview: 'bg-gradient-to-br from-blue-100 to-cyan-200' },
    { id: 'mountain', name: 'Mountain', preview: 'bg-gradient-to-br from-gray-100 to-slate-200' },
    { id: 'sunset', name: 'Sunset', preview: 'bg-gradient-to-br from-orange-100 to-pink-200' },
    { id: 'library', name: 'Library', preview: 'bg-gradient-to-br from-amber-50 to-yellow-100' },
    { id: 'coffee', name: 'Coffee Shop', preview: 'bg-gradient-to-br from-amber-100 to-orange-200' }
  ];

  const alarmSounds = [
    { id: 'beep', name: 'Beep' },
    { id: 'chime', name: 'Chime' },
    { id: 'bell', name: 'Bell' },
    { id: 'digital', name: 'Digital' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="theme-card-opaque enhanced-shadow rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'general'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('timers')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'timers'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Timers
          </button>
          <button
            onClick={() => setActiveTab('sounds')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'sounds'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sounds
          </button>
          <button
            onClick={() => setActiveTab('music')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'music'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Music
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Background Theme</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {themes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => updateSettings({ theme: theme.id })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        settings.theme === theme.id
                          ? 'border-blue-500 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-full h-16 rounded ${theme.preview} mb-2`}></div>
                      <p className="text-xs font-medium text-gray-700">{theme.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Application</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      if (onShowWelcome) {
                        onShowWelcome();
                      }
                    }}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <span className="text-lg">🍅</span>
                    <span>Show Welcome Tour Again</span>
                  </button>
                  <p className="text-xs text-gray-500 text-center">
                    Want to see the introduction and features overview again?
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timers' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Work Duration (minutes)
                </label>
                <input
                  type="number"
                  min="0.01"
                  max="60"
                  step="0.01"
                  value={settings.workDuration}
                  onChange={(e) => updateSettings({ workDuration: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 25 or 1.5 or 0.05"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Examples: 25 = 25 min, 1.5 = 1 min 30 sec, 0.05 = 3 sec
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Short Break Duration (minutes)
                </label>
                <input
                  type="number"
                  min="0.01"
                  max="30"
                  step="0.01"
                  value={settings.shortBreakDuration}
                  onChange={(e) => updateSettings({ shortBreakDuration: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 5 or 2.5 or 0.1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Examples: 5 = 5 min, 2.5 = 2 min 30 sec, 0.1 = 6 sec
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Long Break Duration (minutes)
                </label>
                <input
                  type="number"
                  min="0.01"
                  max="60"
                  step="0.01"
                  value={settings.longBreakDuration}
                  onChange={(e) => updateSettings({ longBreakDuration: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 15 or 7.25 or 0.33"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Examples: 15 = 15 min, 7.25 = 7 min 15 sec, 0.33 = 20 sec
                </p>
              </div>
            </div>
          )}

          {activeTab === 'sounds' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alarm Sound
                </label>
                <div className="flex gap-2">
                  <select
                    value={settings.alarmSound}
                    onChange={(e) => updateSettings({ alarmSound: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {alarmSounds.map((sound) => (
                      <option key={sound.id} value={sound.id}>
                        {sound.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => playAlarm(settings.alarmSound, settings.volume)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    🔊 Test
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Volume: {Math.round(settings.volume * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.volume}
                  onChange={(e) => updateSettings({ volume: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {activeTab === 'music' && (
            <div className="space-y-6">
              <div>
                <label className="flex items-center space-x-2 mb-4">
                  <input
                    type="checkbox"
                    checked={settings.musicEnabled}
                    onChange={(e) => updateSettings({ musicEnabled: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Enable Background Music</span>
                </label>
              </div>

              {settings.musicEnabled && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Music Category
                    </label>
                    <select
                      value={settings.musicCategory}
                      onChange={(e) => updateSettings({ musicCategory: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="lofi">🎧 Lo-Fi Study Music</option>
                      <option value="rain">🌧️ Rain Sounds</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Music Volume: {Math.round(settings.musicVolume * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settings.musicVolume}
                      onChange={(e) => updateSettings({ musicVolume: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={settings.musicAutoplay}
                        onChange={(e) => updateSettings({ musicAutoplay: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Autoplay music when session starts</span>
                    </label>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">🎵 Music Categories:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li><strong>Lo-Fi Study:</strong> Relaxing beats perfect for concentration</li>
                      <li><strong>Rain Sounds:</strong> Natural ambient sounds for deep focus</li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
