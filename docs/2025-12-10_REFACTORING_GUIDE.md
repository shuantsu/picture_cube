# App.js Refactoring Guide

## Overview
This guide outlines the refactoring strategy to reduce app.js from ~1400 lines to a more maintainable structure by extracting functionality into focused modules.

## Created Modules

### 1. **dom-manager.js** (✅ Created)
**Purpose:** Centralize DOM element access and selection
- Replaces 60+ individual `El*` variables
- Provides `$(selector)` helper
- Single initialization point for all DOM references

**Usage:**
```javascript
import { domManager } from './dom-manager.js';
domManager.init();
const panel = domManager.get('right-panel');
```

### 2. **view-controller.js** (✅ Created)
**Purpose:** Manage view modes and rendering state
- Handles cubenet/perspective/orthographic modes
- Manages cube rotation, zoom, pan
- View state persistence
- ~150 lines extracted

**Responsibilities:**
- `setViewMode()` - Switch between view modes
- `handleDrag()` - Process drag interactions
- `handleZoom()` - Process zoom interactions
- `saveViewState()` / `loadViewState()` - Persistence

### 3. **input-handler.js** (✅ Created)
**Purpose:** Handle all user input (mouse, touch, wheel)
- Mouse drag/click handling
- Touch gestures (drag, pinch-zoom)
- Wheel zoom
- ~120 lines extracted

**Features:**
- Unified drag handling for mouse and touch
- Pinch-to-zoom support
- Delegates to ViewController for actions

### 4. **modal-manager.js** (✅ Created)
**Purpose:** Manage all modal dialogs
- State modal (cube state display)
- Instructions modal
- Tab switching
- Clipboard operations
- ~150 lines extracted

**Responsibilities:**
- `openStateModal()` / `closeStateModal()`
- `openInstructionsModal()` / `closeInstructionsModal()`
- `formatCubeDisplay()` - Format cube state for display
- `copyToClipboard()` - Copy state to clipboard

### 5. **config-loader.js** (✅ Created)
**Purpose:** Handle texture configuration loading
- JSON parsing with comment support
- Variable replacement
- Image preloading
- Example loading
- ~180 lines extracted

**Features:**
- `loadCustomConfig()` - Parse and apply config
- `loadExample()` - Load predefined examples
- `stripJsonComments()` - Remove comments from JSON
- `replaceVarsInConfig()` - Variable substitution

### 6. **editor-bridge.js** (✅ Created)
**Purpose:** Manage editor integration
- Editor window communication
- Config synchronization
- Message handling
- ~100 lines extracted

**Responsibilities:**
- `toggleEditor()` - Show/hide editor
- `handleMessage()` - Process postMessage events
- `sendConfigToEditor()` - Sync config to editor

### 7. **move-grid-builder.js** (✅ Created)
**Purpose:** Generate move button grid
- Creates all move buttons dynamically
- ~20 lines extracted

## Modules to Create Next

### 8. **camera-controller.js** (Recommended)
**Purpose:** Wrap camera tracking functionality
- Camera initialization
- UI control wiring
- Settings management
- ~150 lines to extract

**Current location:** Scattered in app.js (initCameraUI, toggleCamera, etc.)

### 9. **bluetooth-controller.js** (Recommended)
**Purpose:** Wrap Bluetooth functionality
- Connection management
- Move processing
- Rotation key configuration
- ~100 lines to extract

**Current location:** toggleBluetooth, configureRotationKey, etc.

### 10. **algorithm-controller.js** (Recommended)
**Purpose:** Handle algorithm operations
- Algorithm parsing and execution
- Scramble generation
- Move history tracking
- ~80 lines to extract

**Current location:** applyAlgorithm, scrambleCube, applyMove

### 11. **feature-toggles.js** (Recommended)
**Purpose:** Manage feature toggles
- Crisp mode
- Render throttle
- History tracking
- Sidebar/panel visibility
- ~60 lines to extract

## Migration Strategy

### Phase 1: Integration (Current)
1. Import new modules into app.js
2. Initialize modules in `initializeApp()`
3. Replace inline code with module calls
4. Keep window.* exports for HTML onclick handlers

### Phase 2: Cleanup
1. Remove extracted code from app.js
2. Update function calls to use module methods
3. Test all functionality

### Phase 3: Further Refactoring
1. Create remaining modules (camera, bluetooth, etc.)
2. Reduce global state
3. Improve dependency injection

## Example Integration

### Before (app.js):
```javascript
function handleMouseDown(e) {
  if (e.target.id === "right-panel" || e.target.closest("#right-panel")) {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
    ElRightPanel.style.cursor = "grabbing";
    e.preventDefault();
  }
}
// ... 100+ more lines of input handling
```

### After (app.js):
```javascript
import { InputHandler } from './input-handler.js';
const inputHandler = new InputHandler(viewController, domManager);
inputHandler.init();
```

## Benefits

### Code Size Reduction
- **Before:** ~1400 lines in app.js
- **After:** ~600-700 lines in app.js (50% reduction)
- **Total:** Same functionality, better organized

### Improved Maintainability
- Single Responsibility Principle
- Easier to test individual modules
- Clear dependencies
- Better code navigation

### Better Separation of Concerns
- **DOM Access:** dom-manager.js
- **View Logic:** view-controller.js
- **Input:** input-handler.js
- **UI Dialogs:** modal-manager.js
- **Config:** config-loader.js
- **Editor:** editor-bridge.js

### Easier Testing
Each module can be tested independently with mocked dependencies.

## Implementation Checklist

- [x] Create dom-manager.js
- [x] Create view-controller.js
- [x] Create input-handler.js
- [x] Create modal-manager.js
- [x] Create config-loader.js
- [x] Create editor-bridge.js
- [x] Create move-grid-builder.js
- [ ] Integrate modules into app.js
- [ ] Remove extracted code from app.js
- [ ] Test all functionality
- [ ] Create camera-controller.js
- [ ] Create bluetooth-controller.js
- [ ] Create algorithm-controller.js
- [ ] Create feature-toggles.js

## Next Steps

1. **Review created modules** - Ensure they match your needs
2. **Integrate into app.js** - Import and initialize modules
3. **Test thoroughly** - Verify all features work
4. **Create remaining modules** - Continue extraction
5. **Remove legacy code** - Clean up app.js

## Notes

- All modules use ES6 classes for consistency
- Dependencies are injected via constructor
- Modules expose minimal public API
- Window exports maintained for HTML onclick compatibility
- LocalStorage operations kept in respective modules
