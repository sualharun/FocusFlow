import React, { createContext, useContext } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children, theme }) => {
  // Define available themes with background styles
  const themes = {
    default: {
      name: 'Default',
      background: 'bg-gradient-to-br from-blue-50 to-indigo-100',
      style: {}
    },
    forest: {
      name: 'Forest',
      background: 'bg-gradient-to-br from-green-100 to-emerald-200',
      style: {
        backgroundImage: 'url("https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2560&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    },
    ocean: {
      name: 'Ocean',
      background: 'bg-gradient-to-br from-blue-100 to-cyan-200',
      style: {
        backgroundImage: 'url("https://images.unsplash.com/photo-1439066615861-d1af74d74000?ixlib=rb-4.0.3&auto=format&fit=crop&w=2560&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    },
    mountain: {
      name: 'Mountain',
      background: 'bg-gradient-to-br from-gray-100 to-slate-200',
      style: {
        backgroundImage: 'url("https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2560&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    },
    sunset: {
      name: 'Sunset',
      background: 'bg-gradient-to-br from-orange-100 to-pink-200',
      style: {
        backgroundImage: 'url("https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?ixlib=rb-4.0.3&auto=format&fit=crop&w=2560&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    },
    library: {
      name: 'Library',
      background: 'bg-gradient-to-br from-amber-50 to-yellow-100',
      style: {
        backgroundImage: 'url("https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=2560&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    },
    coffee: {
      name: 'Coffee Shop',
      background: 'bg-gradient-to-br from-amber-100 to-orange-200',
      style: {
        backgroundImage: 'url("https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2560&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    },
    minimal: {
      name: 'Minimal',
      background: 'bg-gradient-to-br from-gray-50 to-white',
      style: {}
    }
  };

  const currentTheme = themes[theme] || themes.default;

  // Apply background style to body
  React.useEffect(() => {
    const body = document.body;
    
    // Reset previous styles
    body.className = body.className.replace(/bg-\S+/g, '');
    body.style.backgroundImage = '';
    body.style.backgroundSize = '';
    body.style.backgroundPosition = '';
    body.style.backgroundRepeat = '';
    body.style.backgroundAttachment = '';
    
    // Apply new theme
    if (currentTheme.style.backgroundImage) {
      Object.assign(body.style, currentTheme.style);
      body.style.backgroundAttachment = 'fixed';
    } else {
      body.className += ` ${currentTheme.background}`;
    }
    
    return () => {
      // Cleanup on unmount
      body.className = body.className.replace(/bg-\S+/g, '');
      body.style.backgroundImage = '';
      body.style.backgroundSize = '';
      body.style.backgroundPosition = '';
      body.style.backgroundRepeat = '';
      body.style.backgroundAttachment = '';
    };
  }, [theme]);

  const value = {
    currentTheme,
    themes,
    theme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
