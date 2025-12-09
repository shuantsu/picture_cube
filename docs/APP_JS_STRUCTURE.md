# app.js Structure Analysis

**Total Lines:** 2217  
**Purpose:** Main application controller for Picture Cube - handles UI, cube logic, rendering, camera tracking, and Bluetooth integration

---

## 📋 Table of Contents

1. [Initialization & Setup (Lines 1-95)](#1-initialization--setup)
2. [DOM References (Lines 96-185)](#2-dom-references)
3. [Core Cube System (Lines 186-250)](#3-core-cube-system)
4. [View & Rendering System (Lines 251-380)](#4-view--rendering-system)
5. [View Mode Management (Lines 381-470)](#5-view-mode-management)
6. [Mouse/Touch Interaction (Lines 471-620)](#6-mousetouch-interaction)
7. [Cube Move Functions (Lines 621-680)](#7-cube-move-functions)
8. [Algorithm & Config System (Lines 681-850)](#8-algorithm--config-system)
9. [State Modal & Display (Lines 851-950)](#9-state-modal--display)
10. [Event Listeners (Lines 951-1050)](#10-event-listeners)
11. [UI Controls (Lines 1051-1200)](#11-ui-controls)
12. [Editor Integration (Lines 1201-1350)](#12-editor-integration)
13. [Camera Head Tracking (Lines 1351-1650)](#13-camera-head-tracking)
14. [History System (Lines 1651-1950)](#14-history-system)
15. [Bluetooth Integration (Lines 1951-2050)](#15-bluetooth-integration)
16. [Initialization & Settings Load (Lines 2051-2217)](#16-initialization--settings-load)

---

## 1. Initialization & Setup
**Lines: 1-95**

### Purpose
Mobile viewport handling and error suppression for MediaPipe

### Key Functions
- `setRealViewportHeight()` - Handles mobile viewport height issues
- Console error suppression for MediaPipe face tracking

### Dependencies
- None (pure DOM/window APIs)

### Refactoring Opportunities
- ✅ Extract to `utils/viewport.js`
- ✅ Extract to `utils/errorSuppression.js`

---

## 2. DOM References
**Lines: 96-185**

### Purpose
Cache all DOM element references for performance

### Key Variables
- `$` - Custom selector function (ID or querySelector)
- `$$` - jQuery reference
- `El*` - Cached DOM elements (35+ elements)
- `faces2D`, `faces3D` - Face element containers

### Dependencies
- DOM must be loaded

### Refactoring Opportunities
- ✅ Move to `dom/elements.js`
- ✅ Use lazy loading for rarely-used elements
- ⚠️ Consider using a DOM manager class

---

## 3. Core Cube System
**Lines: 186-250**

### Purpose
Initialize cube state and core logic

### Key Components
- `cubeCore` - CubeCore instance (main cube logic)
- `textureManager` - TextureManager instance
- `cubeState`, `stickerRotations`, `stickerTextures` - State objects
- `initCube()` - Initialize/reset cube
- `createStickers()` - Generate sticker DOM elements
- `needsFlip()` - Rotation logic for face transitions

### Dependencies
- CubeCore class
- TextureManager class

### Refactoring Opportunities
- ✅ Already well-modularized with CubeCore
- ⚠️ Consider extracting sticker creation to separate module

---

## 4. View & Rendering System
**Lines: 251-380**

### Purpose
Handle cube rendering and visual updates

### Key Functions
- `applyStickerStyle()` - Apply textures to stickers
- `updateDOM()` - Main render function with fallback
- `syncState()` - Sync state from CubeCore and trigger render
- Throttle system with `renderThrottleEnabled` and `rafScheduled`

### Dependencies
- TextureManager
- CubeView
- Renderer classes (CubeNetRenderer, PerspectiveRenderer, IsometricRenderer)

### Refactoring Opportunities
- ✅ Extract to `rendering/renderManager.js`
- ✅ Separate throttle logic into utility
- ⚠️ Consider using a render queue pattern

---

## 5. View Mode Management
**Lines: 381-470**

### Purpose
Switch between cubenet, perspective, and orthographic views

### Key Functions
- `setViewMode(mode)` - Switch rendering mode
- `updateCubeRotation()` - Update 3D rotation
- `update2DZoom()` - Update 2D zoom/pan
- `saveViewState()` / `loadViewState()` - Persist view settings

### State Variables
- `currentViewMode`, `cubeRotation`, `cubeSize`, `zoom2D`, `panOffset`

### Dependencies
- Renderer classes
- localStorage

### Refactoring Opportunities
- ✅ Extract to `view/viewManager.js`
- ✅ Create ViewState class to encapsulate state

---

## 6. Mouse/Touch Interaction
**Lines: 471-620**

### Purpose
Handle user input for rotating/panning cube

### Key Functions
- `handleMouseDown/Move/Up()` - Mouse drag handling
- `handleTouchStart/Move/End()` - Touch gesture handling
- `handleWheel()` - Zoom with mouse wheel
- `getTouchDistance()` - Pinch zoom calculation

### State Variables
- `isDragging`, `previousMousePosition`, `cameraRotationEnabled`

### Dependencies
- View system

### Refactoring Opportunities
- ✅ Extract to `input/gestureHandler.js`
- ✅ Use event delegation pattern
- ⚠️ Consider using a gesture library (Hammer.js)

---

## 7. Cube Move Functions
**Lines: 621-680**

### Purpose
Wrapper functions for cube moves

### Key Functions
- `moveU/D/R/L/F/B()` - Basic face moves
- `rotationX/Y/Z()` - Cube rotations
- `moveM/E/S()` - Middle layer moves
- `moveRw/Lw/Uw/Dw/Fw/Bw()` - Wide moves
- All delegate to `cubeCore` and call `syncState()`

### Dependencies
- CubeCore

### Refactoring Opportunities
- ✅ Already delegated to CubeCore
- ⚠️ Could remove wrappers entirely and use cubeCore directly
- ✅ Extract to `cube/moveWrappers.js` if kept

---

## 8. Algorithm & Config System
**Lines: 681-850**

### Purpose
Execute algorithms and load texture configurations

### Key Functions
- `applyMove(move, trackHistory)` - Execute single move
- `applyAlgorithm()` - Parse and execute algorithm string
- `solveCube()` - Reset cube
- `loadCustomConfig()` - Load JSON texture config
- `stripJsonComments()` - Remove comments from JSON
- `replaceVarsInConfig()` - Variable substitution in configs

### Dependencies
- CubeCore
- TextureManager
- History system

### Refactoring Opportunities
- ✅ Extract to `algorithm/algParser.js`
- ✅ Extract to `config/configLoader.js`
- ✅ JSON utilities to `utils/jsonUtils.js`

---

## 9. State Modal & Display
**Lines: 851-950**

### Purpose
Display cube state and rotations in modal

### Key Functions
- `openStateModal()` / `closeStateModal()` - Modal control
- `formatCubeDisplay()` - Format state as ASCII art
- `copyToClipboard()` - Copy state to clipboard
- `switchTab()` - Switch between state/rotations tabs
- `updateStateTab()` / `updateRotationsTab()` - Update tab content
- `showToast()` - Show notification

### Dependencies
- Cube state

### Refactoring Opportunities
- ✅ Extract to `ui/stateModal.js`
- ✅ Extract formatting to `utils/cubeFormatter.js`

---

## 10. Event Listeners
**Lines: 951-1050**

### Purpose
Attach global event listeners

### Key Listeners
- Mouse/touch events on right panel
- Pinch zoom for touch devices
- Sidebar toggle
- Fullscreen toggle
- Modal click-outside-to-close
- Accordion functionality
- ESC key for iframe

### Dependencies
- Multiple UI systems

### Refactoring Opportunities
- ✅ Extract to `events/eventManager.js`
- ✅ Use event delegation where possible
- ⚠️ Consider using a pub/sub pattern

---

## 11. UI Controls
**Lines: 1051-1200**

### Purpose
Handle UI controls and settings

### Key Functions
- `toggleSidebar()` / `saveSidebarState()` / `loadSidebarState()`
- `toggleLeftPanel()` / `toggleFullscreen()`
- `loadExample()` / `loadDefaultTexture()` / `saveSelectedTexture()`
- `toggleAccordion()` / `saveAccordionStates()` / `loadAccordionStates()`
- `toggleCrispMode()` / `toggleRenderThrottle()`
- Background selection and sizing
- Accessibility controls (UI scale, text scale, panel width)

### Dependencies
- localStorage
- DOM elements

### Refactoring Opportunities
- ✅ Extract to `ui/controls.js`
- ✅ Group related functions into classes (SidebarManager, SettingsManager)
- ✅ Extract accessibility to `ui/accessibility.js`

---

## 12. Editor Integration
**Lines: 1201-1350**

### Purpose
Integrate with texture editor iframe

### Key Functions
- `toggleEditor()` - Show/hide editor
- `postMessage` listener - Receive updates from editor
- Config import/export between main app and editor

### State Variables
- `editorOpen`

### Dependencies
- Editor iframe
- Config system

### Refactoring Opportunities
- ✅ Extract to `editor/editorBridge.js`
- ✅ Use typed message protocol

---

## 13. Camera Head Tracking
**Lines: 1351-1650**

### Purpose
Use webcam + MediaPipe for head tracking to control cube rotation

### Key Functions
- `loadCameras()` - Enumerate available cameras
- `startCamera()` - Initialize camera stream
- `loadMediaPipeScripts()` - Load MediaPipe dynamically
- `onCameraResults()` - Process face landmarks
- `toggleCamera()` - Enable/disable camera
- `calibrateCamera()` - Set neutral position
- `updateBackgroundParallax()` - Move background based on head position
- `initCameraControls()` - Setup sensitivity sliders
- `saveCameraCalibration()` / `loadCameraCalibration()` - Persist settings

### State Variables
- `cameraEnabled`, `faceMesh`, `cameraStream`, `camera`
- `calibrationCenter`, `isCalibrated`, `mediaPipeReady`, `faceDetected`
- Sensitivity and offset settings

### Dependencies
- MediaPipe Face Mesh
- Camera API

### Refactoring Opportunities
- ✅ Extract to `camera/headTracking.js`
- ✅ Extract calibration to `camera/calibration.js`
- ✅ Extract MediaPipe loading to `camera/mediaPipeLoader.js`
- ⚠️ Large section - high priority for extraction

---

## 14. History System
**Lines: 1651-1950**

### Purpose
Tree-based move history with branching support

### Key Components
- `MoveNode` class - Tree node for history
- `uuid()` - Generate unique IDs
- Canvas-based visualization with pan/zoom
- Grid view of current path

### Key Functions
- `initHistory()` - Create root node
- `addMoveToHistory()` - Add move to tree
- `selectHistoryNode()` - Navigate to specific state
- `clearHistory()` - Reset history
- `layoutTree()` - Calculate node positions
- `renderHistoryCanvas()` - Draw history graph
- `updateHistoryDisplay()` - Update both canvas and grid

### State Variables
- `historyRoot`, `currentNode`, `historyTransform`
- `historyCanvas`, `historyCtx`, `historyPositions`

### Dependencies
- Cube state
- Canvas API

### Refactoring Opportunities
- ✅ Extract to `history/historyManager.js`
- ✅ Extract MoveNode to `history/moveNode.js`
- ✅ Extract canvas rendering to `history/historyRenderer.js`
- ⚠️ Large section - high priority for extraction

---

## 15. Bluetooth Integration
**Lines: 1951-2050**

### Purpose
Connect to GiiKER Bluetooth cube

### Key Functions
- `toggleBluetooth()` - Connect/disconnect
- Event handlers for move, connect, disconnect, error

### State Variables
- `bluetoothCube`

### Dependencies
- BluetoothCube class

### Refactoring Opportunities
- ✅ Already uses BluetoothCube class
- ✅ Extract UI updates to separate handler

---

## 16. Initialization & Settings Load
**Lines: 2051-2217**

### Purpose
Initialize app and load saved settings

### Key Operations
- Initialize cube
- Load accordion/sidebar states
- Load camera calibration
- Load crisp mode, render throttle, panel state
- Load config from URL hash or localStorage
- Load view mode
- Setup background controls
- Load accessibility settings

### Dependencies
- All systems

### Refactoring Opportunities
- ✅ Extract to `init/appInitializer.js`
- ✅ Create initialization pipeline
- ⚠️ Too many interdependencies - needs careful refactoring

---

## 🎯 Refactoring Priority

### High Priority (Large, Self-Contained)
1. **Camera Head Tracking** (300 lines) → `camera/`
2. **History System** (300 lines) → `history/`
3. **UI Controls** (150 lines) → `ui/`
4. **Algorithm & Config** (170 lines) → `algorithm/`, `config/`

### Medium Priority
5. **Mouse/Touch Interaction** (150 lines) → `input/`
6. **View Management** (90 lines) → `view/`
7. **Rendering System** (130 lines) → `rendering/`
8. **Editor Integration** (150 lines) → `editor/`

### Low Priority (Already Modular or Small)
9. **DOM References** (90 lines) → `dom/`
10. **State Modal** (100 lines) → `ui/`
11. **Bluetooth** (100 lines) → `bluetooth/`
12. **Initialization** (167 lines) → `init/`

---

## 📦 Suggested Module Structure

```
js/
├── app.js (main orchestrator, ~200 lines)
├── core/
│   ├── cubeCore.js (already exists)
│   └── textureManager.js (already exists)
├── rendering/
│   ├── renderManager.js
│   ├── cubeNetRenderer.js (already exists)
│   ├── perspectiveRenderer.js (already exists)
│   └── isometricRenderer.js (already exists)
├── view/
│   ├── viewManager.js
│   └── viewState.js
├── input/
│   ├── gestureHandler.js
│   └── eventManager.js
├── camera/
│   ├── headTracking.js
│   ├── calibration.js
│   └── mediaPipeLoader.js
├── history/
│   ├── historyManager.js
│   ├── moveNode.js
│   └── historyRenderer.js
├── algorithm/
│   ├── algParser.js
│   └── algUtils.js (already exists)
├── config/
│   ├── configLoader.js
│   └── jsonUtils.js
├── ui/
│   ├── controls.js
│   ├── stateModal.js
│   ├── accessibility.js
│   └── toast.js
├── editor/
│   └── editorBridge.js
├── bluetooth/
│   └── bluetoothManager.js
├── dom/
│   └── elements.js
├── utils/
│   ├── viewport.js
│   ├── errorSuppression.js
│   └── cubeFormatter.js
└── init/
    └── appInitializer.js
```

---

## 🔧 Refactoring Strategy

### Phase 1: Extract Pure Utilities (Low Risk)
- viewport.js
- errorSuppression.js
- jsonUtils.js
- cubeFormatter.js

### Phase 2: Extract Self-Contained Systems (Medium Risk)
- camera/ (head tracking)
- history/ (history system)
- bluetooth/ (bluetooth manager)

### Phase 3: Extract UI Components (Medium Risk)
- ui/controls.js
- ui/stateModal.js
- ui/accessibility.js

### Phase 4: Extract Core Systems (High Risk)
- rendering/renderManager.js
- view/viewManager.js
- input/gestureHandler.js

### Phase 5: Refactor Main App (Highest Risk)
- Create app orchestrator
- Wire up all modules
- Remove redundant code

---

## 📊 Statistics

- **Total Functions:** ~80
- **Global Variables:** ~60
- **Event Listeners:** ~25
- **localStorage Keys:** ~15
- **External Dependencies:** CubeCore, TextureManager, MediaPipe, BluetoothCube

---

## ⚠️ Key Challenges

1. **Tight Coupling:** Many functions depend on global state
2. **Mixed Concerns:** UI, logic, and state management intertwined
3. **Large Scope:** Many functions access 10+ global variables
4. **Event Spaghetti:** Event listeners scattered throughout
5. **Initialization Order:** Complex dependencies between systems

---

## ✅ Benefits of Refactoring

1. **Testability:** Isolated modules easier to unit test
2. **Maintainability:** Clear separation of concerns
3. **Reusability:** Modules can be used independently
4. **Performance:** Lazy loading of heavy modules (MediaPipe, etc.)
5. **Collaboration:** Multiple developers can work on different modules
6. **Bundle Size:** Tree-shaking can remove unused code
