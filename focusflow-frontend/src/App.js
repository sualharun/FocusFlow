/**
 * FocusFlow - Pomodoro Timer Application
 * A productivity app using the Pomodoro technique with collaborative sessions,
 * background music, activity tracking, and personalized tips.
 */

import React, { useState, useEffect } from 'react';
import Timer from './components/Timer';
import SessionJoin from './components/SessionJoin';
import ActivityLog from './components/ActivityLog';
import TipDisplay from './components/TipDisplay';
import MusicWidget from './components/MusicWidget';
import LoginScreen from './components/LoginScreen';
import HistoryPanel from './components/HistoryPanel';
import SettingsModal, { SettingsProvider, useSettings } from './components/SettingsModal';
import WelcomePopup from './components/WelcomePopup';
import { ThemeProvider } from './components/ThemeProvider';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AlarmSystem from './components/AlarmSystem';
import './App.css';

function AppContent() {
  const [currentSession, setCurrentSession] = useState(null);
  const [activities, setActivities] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);
  const { settings } = useSettings();
  const { playAlarm } = AlarmSystem();
  const { user, authenticated, loading, logout } = useAuth();

  // Reset welcome popup when authentication status changes
  useEffect(() => {
    if (authenticated) {
      setShowWelcome(false);
    }
  }, [authenticated]);

  // Handle welcome popup
  const handleGetStarted = () => {
    setShowWelcome(false);
  };

  // Handle showing welcome from settings
  const handleShowWelcomeFromSettings = () => {
    setShowWelcome(true);
    setShowSettings(false);
  };

  // Show welcome popup for new users (before login)
  if (showWelcome && !authenticated && !loading) {
    return <WelcomePopup onGetStarted={handleGetStarted} />;
  }

  // Show login screen if not authenticated
  if (!authenticated && !loading) {
    return <LoginScreen />;
  }

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="theme-card-transparent enhanced-shadow rounded-lg p-8 text-center">
          <div className="animate-pulse">
            <div className="text-4xl mb-4">⏰</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Loading FocusFlow...</h2>
            <p className="text-gray-500">Please wait while we set up your workspace</p>
          </div>
        </div>
      </div>
    );
  }

  const handleSessionJoin = (session) => {
    setCurrentSession(session);
  };

  const handleSessionEnd = () => {
    setCurrentSession(null);
    setActivities([]);
    // Trigger history refresh to show updated session status
    setHistoryRefreshTrigger(prev => prev + 1);
  };

  const handleSessionUpdate = (updatedSession) => {
    setCurrentSession(prev => prev ? { ...prev, ...updatedSession } : updatedSession);
  };

  const handleActivityUpdate = (activity) => {
    setActivities(prev => [activity, ...prev]);
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 py-8">
        <header className="text-center mb-8 relative">
          <h1 className="text-4xl font-bold text-black mb-2">FocusFlow</h1>
          <p className="text-black text-lg">Stay focused with the Pomodoro technique</p>
          {user && (
            <div className="flex items-center justify-center space-x-4 mt-2">
              <p className="text-sm text-black opacity-70">
                Welcome, {user.firstName || user.email}!
              </p>
              <button
                onClick={logout}
                className="text-xs bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-full transition-colors"
              >
                Logout
              </button>
            </div>
          )}
          
          {/* History Button */}
          <button
            onClick={() => setShowHistory(true)}
            className="absolute top-0 left-0 p-3 text-black hover:text-gray-700 transition-colors"
            title="Study History"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>

      {/* Floating History Button - Alternative positioning */}
      <button
        onClick={() => setShowHistory(true)}
        className="fixed bottom-6 left-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-30"
        title="Study History"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </button>

          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(true)}
            className="absolute top-0 right-0 p-3 text-black hover:text-gray-700 transition-colors"
            title="Settings"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Timer Section */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              {!currentSession ? (
                <SessionJoin 
                  user={user} 
                  onSessionJoin={handleSessionJoin}
                />
              ) : (
                <Timer 
                  session={currentSession}
                  user={user}
                  onActivityUpdate={handleActivityUpdate}
                  onSessionEnd={handleSessionEnd}
                  onSessionUpdate={handleSessionUpdate}
                />
              )}
            </div>

            {/* Tips Section */}
            <div>
              <TipDisplay user={user} />
            </div>
          </div>

          {/* Activity Log Section */}
          <div className="lg:col-span-1">
            <ActivityLog 
              activities={activities}
              session={currentSession}
            />
          </div>
        </div>
      </div>

      {/* Music Widget - Fixed position */}
      <MusicWidget />

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)}
        onShowWelcome={handleShowWelcomeFromSettings}
      />

      {/* History Panel */}
      <HistoryPanel 
        isOpen={showHistory} 
        onClose={() => setShowHistory(false)}
        currentSession={currentSession}
        refreshTrigger={historyRefreshTrigger}
      />

      {/* Welcome Popup (can be shown from settings) */}
      {showWelcome && authenticated && (
        <WelcomePopup onGetStarted={handleGetStarted} />
      )}
    </div>
  );
}

// Main App component with providers
function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <AppWithTheme />
      </SettingsProvider>
    </AuthProvider>
  );
}

// App with theme provider
function AppWithTheme() {
  const { settings } = useSettings();
  
  return (
    <ThemeProvider theme={settings.theme}>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
