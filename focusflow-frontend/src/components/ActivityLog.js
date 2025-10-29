import React from 'react';

const ActivityLog = ({ activities, session }) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'SESSION_STARTED':
      case 'TIMER_STARTED':
        return '▶️';
      case 'SESSION_PAUSED':
      case 'TIMER_PAUSED':
        return '⏸️';
      case 'SESSION_COMPLETED':
        return '✅';
      case 'BREAK_STARTED':
        return '☕';
      case 'CYCLE_STARTED':
      case 'CYCLE_COMPLETED':
        return '🔄';
      case 'TIMER_RESET':
        return '🔄';
      case 'TIP_REQUESTED':
        return '💡';
      case 'SESSION_UPDATE':
        return '🔄';
      default:
        return '📝';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'SESSION_STARTED':
      case 'TIMER_STARTED':
        return 'text-green-600';
      case 'SESSION_PAUSED':
      case 'TIMER_PAUSED':
        return 'text-yellow-600';
      case 'SESSION_COMPLETED':
        return 'text-green-700';
      case 'BREAK_STARTED':
        return 'text-blue-600';
      case 'CYCLE_STARTED':
      case 'CYCLE_COMPLETED':
        return 'text-purple-600';
      case 'TIP_REQUESTED':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="theme-card-transparent enhanced-shadow rounded-lg p-4 h-full overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-800">
          📝 Activity Log
        </h3>
        {session && (
          <div className="text-xs text-gray-600">
            {session.sessionCode}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {activities.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            <div className="text-2xl mb-1">📝</div>
            <p className="text-sm">No activities yet</p>
            <p className="text-xs">Start a session to see your activity log</p>
          </div>
        ) : (
          activities.slice().reverse().map((activity, index) => (
            <div 
              key={index}
              className="flex items-start space-x-2 p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
            >
              <div className="text-sm flex-shrink-0">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium ${getActivityColor(activity.type)} leading-tight`}>
                  {activity.message}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {formatTime(activity.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityLog;