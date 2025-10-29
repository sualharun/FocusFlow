import React, { useState, useEffect } from 'react';
import { useSettings } from './SettingsModal';

const SessionJoin = ({ user, onSessionJoin }) => {
  const { settings, syncWithSession } = useSettings();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  // Session creation form state - sync with settings
  const [durationMinutes, setDurationMinutes] = useState(settings.workDuration);
  const [breakMinutes, setBreakMinutes] = useState(settings.shortBreakDuration);
  const [longBreakMinutes, setLongBreakMinutes] = useState(settings.longBreakDuration);
  const [totalCycles, setTotalCycles] = useState(4);
  const [validationErrors, setValidationErrors] = useState({});

  // Sync form values with settings when settings change
  useEffect(() => {
    setDurationMinutes(settings.workDuration);
    setBreakMinutes(settings.shortBreakDuration);
    setLongBreakMinutes(settings.longBreakDuration);
  }, [settings.workDuration, settings.shortBreakDuration, settings.longBreakDuration]);

  const validateInputs = () => {
    const errors = {};
    
    if (!durationMinutes || durationMinutes <= 0 || durationMinutes < 0.01) {
      errors.durationMinutes = 'Focus duration must be at least 0.01 minutes (0.6 seconds)';
    }
    
    if (!breakMinutes || breakMinutes <= 0 || breakMinutes < 0.01) {
      errors.breakMinutes = 'Break duration must be at least 0.01 minutes (0.6 seconds)';
    }
    
    if (!longBreakMinutes || longBreakMinutes <= 0 || longBreakMinutes < 0.01) {
      errors.longBreakMinutes = 'Long break duration must be at least 0.01 minutes (0.6 seconds)';
    }
    
    if (!totalCycles || totalCycles <= 0 || !Number.isInteger(totalCycles)) {
      errors.totalCycles = 'Total cycles must be a positive whole number';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const createSession = async () => {
    if (!validateInputs()) {
      setError('Please fix the validation errors before creating a session.');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8080/api/sessions', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          durationMinutes,
          breakMinutes,
          longBreakMinutes,
          totalCycles,
        }),
      });

      if (response.ok) {
        const session = await response.json();
        console.log('Created session:', session.sessionCode);
        // Sync settings with the created session
        syncWithSession(session);
        onSessionJoin(session);
      } else {
        setError('Failed to create session. Please try again.');
      }
    } catch (error) {
      console.error('Error creating session:', error);
      setError('Error creating session. Please check your connection.');
    } finally {
      setIsCreating(false);
    }
  };



  return (
    <div className="theme-card-transparent enhanced-shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Start Your Focus Session
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-8">
        {/* Create New Session */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Create New Session</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Focus Duration (minutes)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="60"
                value={durationMinutes}
                onChange={(e) => {
                  const value = e.target.value === '' ? '' : parseFloat(e.target.value);
                  setDurationMinutes(value);
                  // Sync to settings in real-time
                  if (value && !isNaN(value)) {
                    syncWithSession({ durationMinutes: value, breakMinutes, longBreakMinutes, totalCycles });
                  }
                  if (validationErrors.durationMinutes) {
                    setValidationErrors(prev => ({ ...prev, durationMinutes: '' }));
                  }
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.durationMinutes ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., 25 or 1.5"
              />
              {validationErrors.durationMinutes && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.durationMinutes}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Break Duration (minutes)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="30"
                value={breakMinutes}
                onChange={(e) => {
                  const value = e.target.value === '' ? '' : parseFloat(e.target.value);
                  setBreakMinutes(value);
                  // Sync to settings in real-time
                  if (value && !isNaN(value)) {
                    syncWithSession({ durationMinutes, breakMinutes: value, longBreakMinutes, totalCycles });
                  }
                  if (validationErrors.breakMinutes) {
                    setValidationErrors(prev => ({ ...prev, breakMinutes: '' }));
                  }
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.breakMinutes ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., 5 or 2.5"
              />
              {validationErrors.breakMinutes && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.breakMinutes}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Long Break (minutes)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="60"
                value={longBreakMinutes}
                onChange={(e) => {
                  const value = e.target.value === '' ? '' : parseFloat(e.target.value);
                  setLongBreakMinutes(value);
                  // Sync to settings in real-time
                  if (value && !isNaN(value)) {
                    syncWithSession({ durationMinutes, breakMinutes, longBreakMinutes: value, totalCycles });
                  }
                  if (validationErrors.longBreakMinutes) {
                    setValidationErrors(prev => ({ ...prev, longBreakMinutes: '' }));
                  }
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.longBreakMinutes ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., 15 or 7.25"
              />
              {validationErrors.longBreakMinutes && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.longBreakMinutes}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Total Cycles
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={totalCycles}
                onChange={(e) => {
                  const value = e.target.value === '' ? '' : parseInt(e.target.value);
                  setTotalCycles(value);
                  if (validationErrors.totalCycles) {
                    setValidationErrors(prev => ({ ...prev, totalCycles: '' }));
                  }
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.totalCycles ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {validationErrors.totalCycles && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.totalCycles}</p>
              )}
            </div>
          </div>
          
          <button
            onClick={createSession}
            disabled={isCreating}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-md transition-colors"
          >
            {isCreating ? 'Creating Session...' : 'Create New Session'}
          </button>
        </div>


      </div>
    </div>
  );
};

export default SessionJoin;