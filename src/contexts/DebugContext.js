import React, { createContext, useContext, useState, useEffect } from 'react';

const DebugContext = createContext();

export const useDebug = () => {
  const context = useContext(DebugContext);
  if (!context) {
    throw new Error('useDebug must be used within a DebugProvider');
  }
  return context;
};

export const DebugProvider = ({ children }) => {
  const [isDebugMode, setIsDebugMode] = useState(false);

  // Load debug state from localStorage on mount
  useEffect(() => {
    const savedDebugMode = localStorage.getItem('kromio_debug_mode');
    setIsDebugMode(savedDebugMode === 'true');
  }, []);

  // Save debug state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('kromio_debug_mode', isDebugMode.toString());
  }, [isDebugMode]);

  const toggleDebugMode = () => {
    setIsDebugMode(prev => !prev);
  };

  const debugLog = (...args) => {
    if (isDebugMode) {
      console.log('[DEBUG]', ...args);
    }
  };

  const debugError = (...args) => {
    if (isDebugMode) {
      console.error('[DEBUG]', ...args);
    }
  };

  const debugWarn = (...args) => {
    if (isDebugMode) {
      console.warn('[DEBUG]', ...args);
    }
  };

  const value = {
    isDebugMode,
    setIsDebugMode,
    toggleDebugMode,
    debugLog,
    debugError,
    debugWarn
  };

  return (
    <DebugContext.Provider value={value}>
      {children}
    </DebugContext.Provider>
  );
};