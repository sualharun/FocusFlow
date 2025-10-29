import React from 'react';

const TipDisplay = ({ user }) => {
  return (
    <div className="theme-card enhanced-shadow rounded-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        💡 Quick Tips
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
        <div className="flex items-center space-x-3">
          <span className="text-xl">🎧</span>
          <span>Use background music or white noise</span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-xl">📱</span>
          <span>Put your phone in another room</span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-xl">💧</span>
          <span>Stay hydrated during breaks</span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-xl">🌱</span>
          <span>Take short walks during breaks</span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-xl">🧘</span>
          <span>Practice deep breathing</span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-xl">🎯</span>
          <span>Set clear, specific goals</span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-xl">⏰</span>
          <span>Time-block your tasks</span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-xl">�</span>
          <span>Work during your peak hours</span>
        </div>
      </div>
    </div>
  );
};

export default TipDisplay;