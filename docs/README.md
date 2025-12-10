# Picture Cube - Technical Documentation

**English** | **[Ler em Português](README-PT_BR.md)**

**Last updated:** Dec 10, 2025  
**Version:** 1.0.0 (Post-refactoring Phase 1)

---

## Overview

Picture Cube is a 3D Rubik's cube simulator with support for custom textures, webcam head tracking, and Bluetooth cube integration (GiiKER).

**Main Features:**
- 3 visualization modes (2D net, 3D orthographic, 3D perspective)
- Unified texture system with visual editor
- Head tracking with MediaPipe Face Mesh
- Move history with branching tree
- GiiKER Bluetooth cube support
- 12 pre-configured textures

---

## Project Structure

```
__PICTURE_CUBE/
├── src/                       # Source code (dev)
│   ├── index.html            # Main HTML
│   ├── css/style.css         # Styles
│   ├── js/                   # JavaScript modules
│   ├── backgrounds/          # Background gallery
│   ├── examples/             # Example textures
│   └── editor/               # Texture editor (iframe)
├── build/                     # Production build (Vite)
├── scripts/                   # Build scripts
│   ├── prebuild.js           # Generates index files and thumbnails
│   └── generate-scramble.js  # Scramble generator
├── package.json              # npm dependencies and scripts
├── vite.config.js            # Vite configuration
└── index.php                 # File browser (dev)
```

---

## Module Architecture

### JavaScript Modules (`src/js/`)

#### **app.js** (1268 lines) - Main Orchestrator
- Initializes all modules
- Coordinates communication between components
- Manages global application state
- Wrapper functions for HTML onclick handlers

#### **cube-core.js** - Cube Engine
- Rubik's cube logic (54 stickers)
- Move algorithms (R, U, F, L, B, D + variations)
- Slice moves (M, E, S)
- Wide moves (Rw, Lw, Uw, etc)
- Cube rotations (x, y, z)
- Sticker rotation tracking (0-3 = 0°-270°)

#### **texture-manager.js** - Texture System
- Loads and applies texture configurations
- Unified system: `textures` + `cube`
- Support for inline CSS, URLs, gradients
- Layering (multiple textures per sticker)
- Wildcard selector (`"*"`)
- Automatic inheritance

#### **cube-view.js** - Rendering Abstraction Layer
- Common interface for all renderers
- Manages transitions between visualization modes

#### **cubenet-renderer.js** - 2D Renderer
- Renders cube as flattened 2D net
- Zoom and pan support

#### **perspective-renderer.js** - 3D Perspective Renderer
- 3D rendering with perspective
- Free cube rotation

#### **isometric-renderer.js** - 3D Orthographic Renderer
- 3D rendering without perspective (isometric)
- Free cube rotation

#### **ui-controls.js** - Interface Controls
- Accessibility controls (UI scale, text, panel width)
- Background selection and sizing
- Sidebar and accordion management
- Toast notifications
- State persistence in localStorage

#### **camera-tracking.js** - Head Tracking
- Available camera enumeration
- MediaPipe Face Mesh integration
- Calibration system
- Rotation calculation based on facial landmarks
- Background parallax effect
- Settings persistence

#### **history-manager.js** - Move History
- Tree structure for history
- Branching support (explore alternative solutions)
- Canvas visualization with pan/zoom
- Grid view of current path
- State restoration

#### **algorithm-parser.js** - Algorithm Parser
- Parse cube notation (R, U', F2, etc)
- Comment removal
- Batch execution
- History integration

#### **bluetooth.js** - Bluetooth Integration
- GiiKER cube connection
- Real-time move detection
- Event callbacks (connect, disconnect, move, error)

#### **scramble.js** - Scramble Generator
- Pre-generated scrambles (optimization)
- Random selection

#### **backgrounds.js** - Background Gallery
- Index of available backgrounds
- Thumbnails and metadata

#### **texture-instructions.js** - Texture System Documentation
- Embedded instructions
- Usage examples

#### **window-manager.js** - Window Manager
- Manages floating 3D preview window
- Drag and drop, resize

#### **marked.min.js** - Markdown Parser
- Renders instructions in markdown

---

## index.html - Structure

### Main Layout
```html
<body>
  <button id="hamburger">        <!-- Toggle sidebar -->
  <button id="togglePanel">      <!-- Toggle left panel -->
  <button id="fullscreenBtn">    <!-- Fullscreen -->
  
  <div id="container">
    <div id="controls">          <!-- Left panel (sidebar) -->
      <!-- Accordions with controls -->
    </div>
    
    <div id="right-panel">       <!-- Visualization area -->
      <iframe id="editor-iframe"> <!-- Texture editor -->
      <div id="cube-net">        <!-- 2D cube -->
      <div id="cube-3d-wrapper"> <!-- 3D cube -->
      <div id="cube-3d-window">  <!-- Floating 3D preview -->
    </div>
  </div>
  
  <!-- Modals -->
  <div id="instructionsModal">   <!-- Texture instructions -->
  <div id="stateModal">          <!-- State analysis -->
  <div id="toast">               <!-- Notifications -->
</body>
```

### Accordions (Control Panel)
1. **Moveset** - Basic move buttons
2. **Algorithm** - Algorithm input + scramble
3. **Bluetooth Cube** - Physical cube connection
4. **Camera Control** - Head tracking + calibration
5. **State** - Reset and state visualization
6. **History** - History with branching tree
7. **Example Textures** - Pre-configured textures
8. **Custom Textures** - JSON texture editor
9. **Background** - Gallery and background controls
10. **Visualization** - Visualization modes + crisp mode
11. **Accessibility** - Accessibility controls

---

## Build System (Vite)

### npm Scripts
```bash
pnpm dev        # Development server (port 8000)
pnpm build      # Production build (src/ → build/)
pnpm preview    # Build preview
```

### Build Flow
1. **prebuild.js** runs before build:
   - Generates backgrounds/index.json
   - Generates examples/index.json
   - Generates thumbnails for background images
   
2. **Vite** processes:
   - JS module bundling
   - Minification
   - Asset hashing
   - Output: `build/` folder

3. **vite-plugin-static-copy** copies:
   - `backgrounds/` (images)
   - `examples/` (texture JSONs)
   - `editor/` (editor iframe)
   - `texture.png` and `texture-instructions.md`

### Configuration (vite.config.js)
- **Root:** `src/` (source code)
- **Output:** `build/` (production)
- **Base:** `./` (relative paths)
- **Server:** port 8000, auto-open

---

## Data Flow

### Move Execution
```
User Input (button/algorithm/bluetooth)
    ↓
app.js: applyMove(move)
    ↓
cube-core.js: applyMove(move)
    ↓
app.js: syncState() → updateDOM()
    ↓
Renderer: render(state, rotations, textures)
    ↓
history-manager.js: addMove(move, state) [if enabled]
```

### Camera Tracking
```
Camera Frame
    ↓
MediaPipe Face Mesh
    ↓
camera-tracking.js: onCameraResults()
    ↓
Calculate rotation from landmarks
    ↓
camera-tracking.js: onRotationChange(x, y)
    ↓
app.js: cubeRotation.x/y = x/y
    ↓
updateCubeRotation()
```

### Texture Loading
```
User Input (JSON config)
    ↓
app.js: loadCustomConfig()
    ↓
stripJsonComments() → JSON.parse()
    ↓
replaceVarsInConfig() [if vars present]
    ↓
texture-manager.js: loadUnifiedConfig(config)
    ↓
app.js: updateDOM()
```

---

## Texture System

### Unified Format
```json
{
  "textures": {
    "red": "#c41e3a",
    "star": {
      "background": "url('star.svg')",
      "backgroundSize": "80%"
    }
  },
  "cube": {
    "U": "red",
    "U1": ["red", "star"],
    "*": "red"
  }
}
```

### Sticker Selectors
- **Entire face:** `"U"`, `"F"`, `"R"`, etc
- **Individual sticker:** `"U0"` to `"U8"` (0-8 per face)
- **Wildcard:** `"*"` (all stickers)

### Features
- Inline CSS (color, background, border, etc)
- Image URLs
- CSS gradients
- Layering: `["base", "overlay"]`
- Automatic inheritance

---

## Current State (Post-Refactoring)

### Phase 1 Complete (Dec 09, 2025)
- 800 lines extracted from app.js (36% reduction)
- 4 modules created:
  - history-manager.js (~300 lines)
  - camera-tracking.js (~300 lines)
  - ui-controls.js (~150 lines)
  - algorithm-parser.js (~50 lines)

### Metrics
| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| app.js lines | 2040 | 1268 | -772 (-38%) |
| app.js size | 70KB | 45KB | -25KB (-36%) |
| Modules | 11 | 15 | +4 |

### Next Phases (Planned)
- Phase 2: Extract view-manager, input-handler, state-modal
- Phase 3: Extract config-loader, editor-bridge
- Phase 4: Automated testing setup

---

## Known Issues

- 2D CSS rotation may conflict with 3D transforms (investigate)
- MediaPipe generates console warnings (suppressed)
- Mobile viewport height requires manual adjustment

---

## Development

### Local Setup
```bash
git clone <repo>
cd __PICTURE_CUBE
pnpm install
pnpm dev
```

### Development Structure
- **Source code:** `src/`
- **Build:** `pnpm build` → `build/`
- **Deploy:** `deploy.bat` (FTP)

### Conventions
- ES6 modules (`type: "module"` in package.json)
- Classes for main modules
- Callbacks for inter-module communication
- localStorage for state persistence
- Accordion state, sidebar state, camera calibration, etc

---

## Additional Resources

- **Live Demo:** https://filipeteixeira.com.br/new/picturecube/
- **Video:** https://www.youtube.com/watch?v=OOUIykqF7zs
- **Texture Instructions:** `src/texture-instructions.md`
- **Examples:** `src/examples/*.json`

---

**Questions?** Check documentation files in `docs/archive/` for historical context.
