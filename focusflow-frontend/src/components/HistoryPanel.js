import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

// Session status constants
const SESSION_STATUS = {
  CREATED: 'CREATED',
  ACTIVE: 'ACTIVE', 
  PAUSED: 'PAUSED',
  COMPLETED: 'COMPLETED',
  ENDED_EARLY: 'ENDED_EARLY'
};

// Display status mapping
const DISPLAY_STATUS = {
  [SESSION_STATUS.CREATED]: 'Created',
  [SESSION_STATUS.ACTIVE]: 'In Progress',
  [SESSION_STATUS.PAUSED]: 'In Progress', 
  [SESSION_STATUS.COMPLETED]: 'Finished',
  [SESSION_STATUS.ENDED_EARLY]: 'Session Ended Early'
};

const HistoryPanel = ({ isOpen, onClose, currentSession = null, refreshTrigger = 0 }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Real-time session update function
  const updateCurrentSessionInHistory = useCallback((sessionData) => {
    if (!sessionData) return;
    
    console.log('🔧 DEBUG: Updating session in history:', sessionData.id, 'Status:', sessionData.status);
    
    setSessions(prevSessions => {
      const sessionIndex = prevSessions.findIndex(s => s.id === sessionData.id);
      
      if (sessionIndex === -1) {
        // New session - add to the beginning of the list
        console.log('🔧 DEBUG: Adding new session to history');
        return [sessionData, ...prevSessions];
      } else {
        // Update existing session
        console.log('🔧 DEBUG: Updating existing session in history from status', prevSessions[sessionIndex].status, 'to', sessionData.status);
        const updatedSessions = [...prevSessions];
        updatedSessions[sessionIndex] = { ...updatedSessions[sessionIndex], ...sessionData };
        return updatedSessions;
      }
    });
  }, []);

  useEffect(() => {
    if (isOpen && user) {
      fetchSessionHistory();
    }
  }, [isOpen, user, refreshTrigger]);

  // Update current session in real-time
  useEffect(() => {
    if (currentSession) {
      updateCurrentSessionInHistory(currentSession);
    }
  }, [currentSession, updateCurrentSessionInHistory]);

  const fetchSessionHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/sessions/history', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      } else {
        console.error('Failed to fetch session history');
      }
    } catch (error) {
      console.error('Error fetching session history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Calculate completed cycles based on current session state
  const getCompletedCycles = (session) => {
    // Handle different session states properly
    if (!session.currentCycle || session.currentCycle < 1) {
      return 0;
    }

    if (session.status === SESSION_STATUS.COMPLETED) {
      return session.totalCycles;
    }

    if (session.status === SESSION_STATUS.ACTIVE || session.status === SESSION_STATUS.PAUSED) {
      // For in-progress sessions, count completed cycles
      // If in break mode after completing a work cycle, count that cycle as completed
      if (session.isBreak && session.currentCycle <= session.totalCycles) {
        return session.currentCycle;
      }
      // If in work mode, count previous completed cycles
      return Math.max(0, session.currentCycle - 1);
    }

    // For ended early sessions
    return Math.max(0, session.currentCycle - 1);
  };

  // Calculate progress percentage
  const getProgressPercentage = (session) => {
    const completed = getCompletedCycles(session);
    const percentage = (completed / session.totalCycles) * 100;
    return Math.min(100, Math.max(0, Math.round(percentage)));
  };

  // Determine display status
  const getDisplayStatus = (session) => {
    // Check if session was ended early (not completed but not active)
    if (session.status !== SESSION_STATUS.COMPLETED && 
        session.status !== SESSION_STATUS.ACTIVE && 
        session.status !== SESSION_STATUS.PAUSED &&
        session.status !== SESSION_STATUS.CREATED) {
      return DISPLAY_STATUS.ENDED_EARLY;
    }
    
    return DISPLAY_STATUS[session.status] || 'Unknown';
  };

  // Get status styling
  const getStatusStyling = (session) => {
    const displayStatus = getDisplayStatus(session);
    
    switch (displayStatus) {
      case 'Finished':
        return {
          icon: '✅',
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          progressColor: 'bg-green-500'
        };
      case 'In Progress':
        return {
          icon: '🔄',
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          progressColor: 'bg-blue-500'
        };
      case 'Session Ended Early':
        return {
          icon: '⚠️',
          color: 'text-orange-600',
          bgColor: 'bg-orange-100',
          progressColor: 'bg-orange-500'
        };
      default:
        return {
          icon: '📝',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          progressColor: 'bg-gray-500'
        };
    }
  };

  // Calculate summary statistics
  const getSummaryStats = () => {
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.status === SESSION_STATUS.COMPLETED).length;
    const endedEarlySessions = sessions.filter(s => 
      s.status !== SESSION_STATUS.COMPLETED && 
      s.status !== SESSION_STATUS.ACTIVE && 
      s.status !== SESSION_STATUS.PAUSED &&
      s.status !== SESSION_STATUS.CREATED
    ).length;

    return { totalSessions, completedSessions, endedEarlySessions };
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sliding Panel */}
      <div className={`fixed top-0 left-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } flex flex-col`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">📊</div>
            <h2 className="text-xl font-bold text-gray-800">Study History</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="p-6 pb-2">
            <div className="text-sm text-gray-600 mb-4">
              Showing {sessions.length} session{sessions.length !== 1 ? 's' : ''}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto px-6">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No History Yet</h3>
                <p className="text-gray-500 text-sm">Start your first focus session to see your study habits here!</p>
              </div>
            ) : (
              <div className="space-y-4 pb-6">
                {sessions.map((session) => {
                  const styling = getStatusStyling(session);
                  const displayStatus = getDisplayStatus(session);
                  const completedCycles = getCompletedCycles(session);
                  const progress = getProgressPercentage(session);
                  
                  return (
                    <div 
                      key={session.id} 
                      className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all duration-200 shadow-sm"
                    >
                      {/* Session Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{styling.icon}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styling.color} ${styling.bgColor}`}>
                            {displayStatus}
                          </span>
                          {/* Live indicator for active sessions */}
                          {(session.status === SESSION_STATUS.ACTIVE || session.status === SESSION_STATUS.PAUSED) && (
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-xs text-gray-500">Live</span>
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(session.createdAt)}
                        </div>
                      </div>

                      {/* Session Details */}
                      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                        <div>
                          <span className="text-gray-500">Focus Time:</span>
                          <div className="font-semibold text-gray-800">
                            {formatDuration(getCompletedCycles(session) * session.durationMinutes)}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Break Time:</span>
                          <div className="font-semibold text-gray-800">
                            {formatDuration(getCompletedCycles(session) * session.breakMinutes)}
                          </div>
                        </div>
                      </div>

                      {/* Cycles and Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">Cycles:</span>
                          <span className="font-semibold text-gray-800">
                            {completedCycles} / {session.totalCycles}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                          <span>Progress</span>
                          <span className="font-semibold">{progress}%</span>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${styling.progressColor}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Session Phase Indicator for Active Sessions */}
                      {(session.status === SESSION_STATUS.ACTIVE || session.status === SESSION_STATUS.PAUSED) && (
                        <div className="mt-2 flex items-center space-x-1 text-xs">
                          {session.isBreak ? (
                            <span className="text-blue-600">☕ Break Time - Cycle {session.currentCycle}</span>
                          ) : (
                            <span className="text-green-600">🎯 Focus Time - Cycle {session.currentCycle}</span>
                          )}
                        </div>
                      )}

                      {/* Status Message */}
                      <div className="mt-2 flex items-center space-x-1 text-xs">
                        <span className={styling.color}>
                          {displayStatus === 'Finished' && '🎉 Session completed successfully'}
                          {displayStatus === 'Session Ended Early' && '⚠️ Session was stopped early'}
                          {displayStatus === 'In Progress' && '⏱️ Session in progress'}
                          {displayStatus === 'Created' && '📝 Session created'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Stats */}
        <div className="border-t border-gray-200 p-4 bg-gradient-to-r from-gray-50 to-blue-50 flex-shrink-0">
          <div className="grid grid-cols-3 gap-3 text-center">
            {(() => {
              const stats = getSummaryStats();
              return (
                <>
                  <div className="space-y-0.5">
                    <div className="text-lg font-bold text-blue-600">
                      {stats.totalSessions}
                    </div>
                    <div className="text-xs font-medium text-gray-600">Total Sessions</div>
                    <div className="text-xs text-gray-400">Sessions Started</div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-lg font-bold text-green-600">
                      {stats.completedSessions}
                    </div>
                    <div className="text-xs font-medium text-gray-600">Completed</div>
                    <div className="text-xs text-gray-400">Finished Normally</div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-lg font-bold text-orange-600">
                      {stats.endedEarlySessions}
                    </div>
                    <div className="text-xs font-medium text-gray-600">Ended Early</div>
                    <div className="text-xs text-gray-400">Stopped Early</div>
                  </div>
                </>
              );
            })()}
          </div>
          
          {/* Success Rate */}
          {sessions.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-700">
                  Success Rate: {Math.round((getSummaryStats().completedSessions / sessions.length) * 100)}%
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                  <div 
                    className="bg-green-500 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${(getSummaryStats().completedSessions / sessions.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default HistoryPanel;