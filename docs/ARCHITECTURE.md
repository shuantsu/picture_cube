# Picture Cube - Architecture Documentation

**Last Updated:** Post-Refactoring (v2)  
**Total Lines Reduced:** ~772 lines removed from app.js  
**File Size Reduced:** ~25KB (from 70KB to 45KB)

---

## Current Module Structure

```
dist/js/
├── app.js                    # Main application controller (1268 lines)
├── cube-core.js              # Core cube logic and move algorithms
├── cube-view.js              # View abstraction layer
├── texture-manager.js        # Texture configuration and application
├── ui-controls.js            # UI controls (accessibility, background, sidebar)
├── camera-tracking.js        # Head tracking with MediaPipe
├── history-manager.js        # Move history with tree visualization
├── bluetooth.js              # Bluetooth cube integration (GiiKER)
├── algorithm-parser.js       # Algorithm parsing utilities
├── scramble.js               # Scramble generation
├── backgrounds.js            # Background gallery data
├── texture-instructions.js   # Texture system documentation
├── cubenet-renderer.js       # 2D cube net renderer
├── perspective-renderer.js   # 3D perspective renderer
└── isometric-renderer.js     # 3D orthographic renderer
```

---

## Architecture Overview

### Core Components

#### 1. **app.js** - Application Controller
**Responsibilities:**
- Initialize all modules and managers
- Coordinate between modules
- Handle global event listeners
- Provide wrapper functions for HTML onclick handlers
- Manage application state synchronization

**Key Instances:**
```javascript
const cubeCore = new CubeCore();           // Cube logic
const textureManager = new TextureManager(); // Textures
const uiControls = new UIControls();       // UI management
const cameraTracking = new CameraTracking(); // Head tracking
const historyManager = new HistoryManager(); // History tree
```

**Integration Points:**
- Syncs cube state between CubeCore and renderers
- Delegates UI operations to UIControls
- Forwards moves to HistoryManager when enabled
- Connects camera rotation to cube rotation
- Handles Bluetooth move callbacks

---

#### 2. **cube-core.js** - Cube Logic Engine
**Responsibilities:**
- Cube state management (54 stickers)
- Sticker rotation tracking
- All move algorithms (basic, slice, wide, rotations)
- Move parsing and execution

**Exports:**
```javascript
class CubeCore {
  cubeState         // Face positions
  stickerRotations  // Rotation angles
  stickerTextures   // Texture assignments
  
  init()            // Reset cube
  applyMove(move)   // Execute move notation
  moveU/D/R/L/F/B() // Basic moves
  moveM/E/S()       // Slice moves
  rotationX/Y/Z()   // Cube rotations
}
```

---

#### 3. **ui-controls.js** - UI Management
**Responsibilities:**
- Accessibility controls (UI scale, text scale, panel width)
- Background selection and sizing
- Sidebar state management
- Accordion state persistence
- Toast notifications

**Exports:**
```javascript
class UIControls {
  initAccessibility()
  applyAccessibility()
  resetAccessibility()
  
  initBackground()
  selectBackground(filename)
  resetBackgroundSize()
  
  toggleSidebar()
  toggleAccordion(header)
  showToast(message)
}
```

---

#### 4. **camera-tracking.js** - Head Tracking
**Responsibilities:**
- Camera enumeration and initialization
- MediaPipe Face Mesh integration
- Face landmark detection
- Calibration system
- Rotation and parallax calculation

**Exports:**
```javascript
class CameraTracking {
  settings          // Sensitivity, offsets, inversions
  enabled           // Camera state
  isCalibrated      // Calibration state
  
  loadCameras()     // List available cameras
  startCamera(id)   // Start camera stream
  calibrate()       // Set neutral position
  stop()            // Stop camera
  
  onRotationChange  // Callback for rotation updates
  onStatusChange    // Callback for status messages
}
```

---

#### 5. **history-manager.js** - Move History
**Responsibilities:**
- Tree-based move history
- Canvas visualization with pan/zoom
- Branch navigation
- State restoration

**Exports:**
```javascript
class HistoryManager {
  root              // History tree root
  currentNode       // Current position
  
  init(state)       // Initialize with state
  addMove(move, state) // Add move to history
  selectNode(id)    // Navigate to node
  clear()           // Clear history
  
  onStateRestore    // Callback for state restoration
}
```

---

#### 6. **Renderer System**
**Architecture:**
```
CubeView (abstraction)
    ├── CubeNetRenderer (2D)
    ├── PerspectiveRenderer (3D)
    └── IsometricRenderer (3D orthographic)
```

**Responsibilities:**
- Render cube state to DOM
- Handle view-specific transformations
- Apply textures via TextureManager
- Support zoom, pan, rotation

---

## Data Flow

### Move Execution Flow
```
User Input (button/algorithm/bluetooth)
    ↓
applyMove(move)
    ↓
cubeCore.applyMove(move)
    ↓
syncState() → updateDOM()
    ↓
Renderer.render(state, rotations, textures)
    ↓
historyManager.addMove(move, state) [if enabled]
```

### Camera Tracking Flow
```
Camera Frame
    ↓
MediaPipe Face Mesh
    ↓
cameraTracking.onCameraResults()
    ↓
Calculate rotation from landmarks
    ↓
cameraTracking.onRotationChange(x, y)
    ↓
cubeRotation.x/y = x/y
    ↓
updateCubeRotation()
```

### Configuration Loading Flow
```
User Input (JSON config)
    ↓
loadCustomConfig()
    ↓
stripJsonComments() → JSON.parse()
    ↓
replaceVarsInConfig() [if vars present]
    ↓
textureManager.loadUnifiedConfig(config)
    ↓
updateDOM()
```

---

## Refactoring Achievements

### Completed
1. **Removed 772 lines** of duplicated code from app.js
2. **Reduced file size by ~25KB** (35% reduction)
3. **Extracted UI controls** to UIControls class
4. **Extracted camera tracking** to CameraTracking class
5. **Extracted history system** to HistoryManager class
6. **Simplified Bluetooth integration** (uses existing BluetoothCube class)

### Before vs After
| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Lines | 2040 | 1268 | -772 (-38%) |
| Size | 70KB | 45KB | -25KB (-36%) |
| Modules | 11 | 14 | +3 |
| Duplication | High | Low | Eliminated |

---

## Areas Needing Refactoring

### 1. **Algorithm & Config System** (Lines 440-620)
**Issues:**
- `applyAlgorithm()` has complex parsing logic
- `loadCustomConfig()` is 170+ lines
- `stripJsonComments()` should be in utils
- Variable replacement logic is mixed in

**Recommended:**
```javascript
// Extract to modules
import { AlgorithmParser } from './algorithm/parser.js';
import { ConfigLoader } from './config/loader.js';
import { stripComments, replaceVars } from './utils/json.js';
```

**Estimated Reduction:** ~200 lines

---

### 2. **State Modal & Display** (Lines 620-720)
**Issues:**
- Modal logic mixed with formatting logic
- `formatCubeDisplay()` is complex ASCII art generator
- Tab switching is manual DOM manipulation

**Recommended:**
```javascript
// Extract to modules
import { StateModal } from './ui/stateModal.js';
import { CubeFormatter } from './utils/cubeFormatter.js';

const stateModal = new StateModal();
stateModal.open(cubeState, stickerRotations);
```

**Estimated Reduction:** ~100 lines

---

### 3. **Event Listeners** (Lines 720-850)
**Issues:**
- Event listeners scattered throughout file
- No centralized event management
- Difficult to track what's listening to what

**Recommended:**
```javascript
// Extract to event manager
import { EventManager } from './events/manager.js';

const events = new EventManager();
events.registerCubeInteraction(ElRightPanel);
events.registerModalHandlers();
events.registerAccordionHandlers();
```

**Estimated Reduction:** ~80 lines

---

### 4. **Touch/Mouse Interaction** (Lines 350-440)
**Issues:**
- Duplicate logic for mouse and touch
- Pinch zoom logic is complex
- No gesture abstraction

**Recommended:**
```javascript
// Extract to gesture handler
import { GestureHandler } from './input/gestures.js';

const gestures = new GestureHandler(ElRightPanel);
gestures.onDrag((dx, dy) => handleDrag(dx, dy));
gestures.onPinch((scale) => handleZoom(scale));
gestures.onWheel((delta) => handleWheel(delta));
```

**Estimated Reduction:** ~90 lines

---

### 5. **Editor Integration** (Lines 850-950)
**Issues:**
- postMessage handling is verbose
- Config sync logic is duplicated
- No typed message protocol

**Recommended:**
```javascript
// Extract to editor bridge
import { EditorBridge } from './editor/bridge.js';

const editor = new EditorBridge(ElEditorIframe);
editor.onConfigUpdate((config) => loadCustomConfig(config));
editor.onClose(() => toggleEditor());
```

**Estimated Reduction:** ~60 lines

---

### 6. **Initialization Code** (Lines 1050-1268)
**Issues:**
- Initialization scattered at end of file
- Settings loading is repetitive
- No clear initialization sequence

**Recommended:**
```javascript
// Extract to initialization module
import { AppInitializer } from './init/initializer.js';

const app = new AppInitializer({
  cubeCore,
  textureManager,
  uiControls,
  cameraTracking,
  historyManager
});

app.initialize();
```

**Estimated Reduction:** ~100 lines

---

## Total Potential Reduction

| Refactoring | Lines Saved |
|-------------|-------------|
| Algorithm & Config | ~200 |
| State Modal | ~100 |
| Event Management | ~80 |
| Gesture Handling | ~90 |
| Editor Bridge | ~60 |
| Initialization | ~100 |
| **TOTAL** | **~630 lines** |

**Projected app.js size:** ~640 lines (50% reduction from current)

---

## Modern Build System Recommendation

### Why Use Vite/Webpack?

#### Current Issues:
1. **Manual script loading** - 14+ script tags in index.php
2. **No dependency management** - Global namespace pollution
3. **No minification** - Larger file sizes
4. **No tree shaking** - Unused code included
5. **No module bundling** - Multiple HTTP requests
6. **No hot reload** - Manual refresh during development

#### Benefits of Vite:

```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'cube-core': ['./src/cube/core.js'],
          'rendering': ['./src/rendering/*.js'],
          'ui': ['./src/ui/*.js'],
          'camera': ['./src/camera/*.js']
        }
      }
    }
  }
}
```

**Results:**
- Single bundled JS file (or smart chunks)
- Automatic minification (~40% size reduction)
- Tree shaking (remove unused code)
- ES6 modules with proper imports/exports
- Hot module replacement (instant updates)
- TypeScript support (optional)
- Source maps for debugging

#### Migration Path:

**Step 1:** Convert to ES6 modules
```javascript
// Before (global)
window.CubeCore = class CubeCore { ... }

// After (module)
export class CubeCore { ... }
```

**Step 2:** Use imports
```javascript
// app.js
import { CubeCore } from './cube/core.js';
import { UIControls } from './ui/controls.js';
import { CameraTracking } from './camera/tracking.js';
```

**Step 3:** Build with Vite
```bash
npm install -D vite
npx vite build
```

**Result:**
```
dist/
├── index.html
└── assets/
    ├── app-[hash].js      # Main bundle (~80KB minified)
    ├── cube-[hash].js     # Cube logic chunk
    └── camera-[hash].js   # Camera chunk (lazy loaded)
```

---

## Recommended Next Steps

### Phase 1: Extract Utilities (1-2 hours)
- [ ] Create `utils/json.js` for JSON utilities
- [ ] Create `utils/cubeFormatter.js` for state formatting
- [ ] Create `utils/viewport.js` for mobile viewport handling

### Phase 2: Extract UI Components (2-3 hours)
- [ ] Create `ui/stateModal.js` for state modal
- [ ] Create `ui/accessibility.js` for accessibility controls
- [ ] Enhance `ui/controls.js` with remaining UI logic

### Phase 3: Extract Input Handling (2-3 hours)
- [ ] Create `input/gestures.js` for gesture handling
- [ ] Create `events/manager.js` for event coordination

### Phase 4: Extract Business Logic (3-4 hours)
- [ ] Create `algorithm/parser.js` for algorithm parsing
- [ ] Create `config/loader.js` for config loading
- [ ] Create `editor/bridge.js` for editor integration

### Phase 5: Setup Build System (2-3 hours)
- [ ] Install Vite
- [ ] Convert to ES6 modules
- [ ] Configure build pipeline
- [ ] Test production build

**Total Estimated Time:** 10-15 hours  
**Expected Result:** ~640 line app.js, modern build system, 50%+ size reduction

---

## Conclusion

The refactoring has successfully reduced code duplication and improved modularity. The next phase should focus on:

1. **Further extraction** of remaining monolithic functions
2. **Modern build tooling** for better developer experience
3. **Type safety** with JSDoc or TypeScript
4. **Testing infrastructure** for critical modules

The architecture is now well-positioned for these improvements, with clear module boundaries and minimal coupling between components.
