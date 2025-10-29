import React from 'react';

const WelcomePopup = ({ onGetStarted }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="text-center">
            <div className="text-5xl mb-4">🍅</div>
            <h1 className="text-3xl font-bold mb-2">Welcome to FocusFlow</h1>
            <p className="text-blue-100">Your Ultimate Pomodoro Timer & Productivity Companion</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* What is Pomodoro? */}
          <div className="bg-gray-50 rounded-lg p-5">
            <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
              <span className="text-2xl mr-2">⏰</span>
              What is the Pomodoro Technique?
            </h2>
            <p className="text-gray-600 leading-relaxed">
              The Pomodoro Technique is a time management method that breaks work into focused 25-minute intervals, 
              followed by 5-minute breaks. After 4 cycles, take a longer 15-30 minute break. This helps maintain 
              focus, reduce mental fatigue, and boost productivity.
            </p>
          </div>

          {/* Features */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">✨</span>
              Everything FocusFlow Offers:
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="text-green-500 text-lg mt-0.5">🎯</div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Customizable Timer Sessions</h3>
                    <p className="text-sm text-gray-600">Set your own work and break intervals</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="text-green-500 text-lg mt-0.5">🎵</div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Focus Music & Sounds</h3>
                    <p className="text-sm text-gray-600">Lofi beats, rain sounds, and more</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="text-green-500 text-lg mt-0.5">👥</div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Collaborative Sessions</h3>
                    <p className="text-sm text-gray-600">Study with friends in real-time</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="text-green-500 text-lg mt-0.5">📊</div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Progress Tracking</h3>
                    <p className="text-sm text-gray-600">Monitor your productivity and habits</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="text-green-500 text-lg mt-0.5">🤖</div>
                  <div>
                    <h3 className="font-semibold text-gray-700">AI-Powered Tips</h3>
                    <p className="text-sm text-gray-600">Get personalized productivity insights</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="text-green-500 text-lg mt-0.5">⚙️</div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Personalized Settings</h3>
                    <p className="text-sm text-gray-600">Customize themes and preferences</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-blue-50 rounded-lg p-5">
            <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
              <span className="text-2xl mr-2">🚀</span>
              Why Use FocusFlow?
            </h2>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center">
                <span className="text-blue-500 mr-2">•</span>
                Improve focus and concentration
              </li>
              <li className="flex items-center">
                <span className="text-blue-500 mr-2">•</span>
                Reduce procrastination and distractions
              </li>
              <li className="flex items-center">
                <span className="text-blue-500 mr-2">•</span>
                Track and improve your productivity habits
              </li>
              <li className="flex items-center">
                <span className="text-blue-500 mr-2">•</span>
                Join a community of focused learners
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onGetStarted}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Get Started with FocusFlow
          </button>
          
          <p className="text-center text-xs text-gray-500 mt-3">
            Ready to boost your productivity? Let's begin your journey!
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomePopup;