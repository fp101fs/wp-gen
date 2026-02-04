// Debug utility functions that check localStorage directly for immediate access
// This allows us to use debug logging without needing React context in all files

const isDebugEnabled = () => {
  return localStorage.getItem('kromio_debug_mode') === 'true';
};

export const debugLog = (...args) => {
  if (isDebugEnabled()) {
    console.log('[DEBUG]', ...args);
  }
};

export const debugError = (...args) => {
  if (isDebugEnabled()) {
    console.error('[DEBUG ERROR]', ...args);
  }
};

export const debugWarn = (...args) => {
  if (isDebugEnabled()) {
    console.warn('[DEBUG WARN]', ...args);
  }
};

export const debugInfo = (...args) => {
  if (isDebugEnabled()) {
    console.info('[DEBUG INFO]', ...args);
  }
};

// For backwards compatibility, export a default debug object
export default {
  log: debugLog,
  error: debugError,
  warn: debugWarn,
  info: debugInfo,
  enabled: isDebugEnabled
};