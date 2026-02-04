# Debug System

## Overview
The debug system allows admins to control console logging visibility for all users.

## Components

### DebugContext (`src/contexts/DebugContext.js`)
- Provides global debug state management
- Persists debug mode setting in localStorage
- Offers debug-aware logging functions

### Debug Utils (`src/utils/debugUtils.js`)
- Utility functions that can be imported anywhere
- Checks localStorage directly for immediate access
- Functions: `debugLog()`, `debugError()`, `debugWarn()`, `debugInfo()`

### Admin Control
- Debug toggle switch in Admin Panel
- Only visible to admin users
- Controls global debug mode for all users

## Usage

### Replace console.log statements:
```javascript
// Before
console.log('Debug message');

// After
import { debugLog } from '../utils/debugUtils';
debugLog('Debug message');
```

### Available functions:
- `debugLog()` - Standard debug messages
- `debugError()` - Error messages  
- `debugWarn()` - Warning messages
- `debugInfo()` - Info messages

## Implementation Notes
- Debug mode OFF by default
- Settings persist across browser sessions
- Only admins can control debug visibility
- No console output when debug mode is disabled