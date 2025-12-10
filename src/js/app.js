import './bg-color-loader.js';
import $ from 'jquery';

window.$ = window.jQuery = $;

await import('jquery-ui-dist/jquery-ui.min.js');
await import('jquery-ui-touch-punch');
import { UIControls } from './ui-controls.js';
import { CameraTracking } from './camera-tracking.js';
import { HistoryManager } from './history-manager.js';
import { StateManager } from './state-manager.js';
import CubeCore from './cube-core.js';
import TextureManager from './texture-manager.js';
import AlgUtils from './scramble.js';
import BluetoothCube from './bluetooth.js';
import BluetoothRotation from './bluetooth-rotation.js';
import { CubeView } from './cube-view.js';
import CubeNetRenderer from './cubenet-renderer.js';
import PerspectiveRenderer from './perspective-renderer.js';
import IsometricRenderer from './isometric-renderer.js';
import './backgrounds.js';
import './texture-instructions.js';
import './window-manager.js';
import { domManager } from './dom-manager.js';
import { ViewController } from './view-controller.js';
import { InputHandler } from './input-handler.js';
import { ModalManager } from './modal-manager.js';
import { ConfigLoader } from './config-loader.js';
import { EditorBridge } from './editor-bridge.js';
import { MoveGridBuilder } from './move-grid-builder.js';

const defaultPanelWidth = 350

      function setRealViewportHeight() {
        const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
        document.documentElement.style.setProperty('--real-vh', `${vh}px`);
      }
      
      window.addEventListener('resize', setRealViewportHeight);
      window.addEventListener('orientationchange', setRealViewportHeight);
      document.addEventListener('fullscreenchange', setRealViewportHeight);
      document.addEventListener('webkitfullscreenchange', setRealViewportHeight);
      setRealViewportHeight();
      
    
      // Suppress MediaPipe console errors
      const originalError = console.error;
      console.error = function(...args) {
        const message = args.join(' ');
        if (message.includes('face_mesh') || message.includes('MediaPipe') || message.includes('buffer')) {
          return; // Suppress MediaPipe errors
        }
        originalError.apply(console, args);
      };
      
      // Suppress unhandled promise rejections from MediaPipe
      window.addEventListener('unhandledrejection', function(event) {
        if (event.reason && (event.reason.message || '').includes('MediaPipe')) {
          event.preventDefault();
        }
      });
    

// ==================== FUNDAMENTOS: X, Y, U + applyStickerRotation ====================

const $$ = (sel) => domManager.$(sel);

// Module instances
let viewController;
let inputHandler;
let modalManager;
let configLoader;
let editorBridge;
let moveGridBuilder;

const faces2D = {};
const faces3D = {};

// Initialize CubeCore
const cubeCore = new CubeCore();
const textureManager = new TextureManager();

// Make classes available globally for non-module scripts
window.CubeCore = CubeCore;
window.TextureManager = TextureManager;
window.AlgUtils = AlgUtils;
window.CubeView = CubeView;
window.CubeNetRenderer = CubeNetRenderer;
window.PerspectiveRenderer = PerspectiveRenderer;
window.IsometricRenderer = IsometricRenderer;

// Initialize UI, Camera, and History managers
const uiControls = new UIControls();
const cameraTracking = new CameraTracking();
const historyManager = new HistoryManager();
const stateManager = new StateManager();
window.historyManager = historyManager;

const faces = ["U", "L", "F", "R", "B", "D"];
const colors = [
  "#ffffff",
  "#ff5800",
  "#009b48",
  "#c41e3a",
  "#0045ad",
  "#ffd500",
];

let cubeState = cubeCore.cubeState;
let stickerRotations = cubeCore.stickerRotations;
let stickerIds = { U: [], L: [], F: [], R: [], B: [], D: [] };
let stickerTextures = cubeCore.stickerTextures;

// Throttle system
let renderThrottleEnabled = true;
let rafScheduled = false;





function createStickers(faceElement, is3D = false) {
  faceElement.innerHTML = "";
  for (let i = 0; i < 9; i++) {
    const sticker = document.createElement("div");
    sticker.className = is3D ? "sticker-3d" : "sticker";
    faceElement.appendChild(sticker);
  }
}

function initCube() {
  cubeCore.init();
  cubeState = cubeCore.cubeState;
  stickerRotations = cubeCore.stickerRotations;
  stickerTextures = cubeCore.stickerTextures;
  
  faces.forEach((face, faceIndex) => {
    stickerIds[face] = Array(9)
      .fill(0)
      .map((_, i) => faceIndex * 9 + i);

    faces2D[face] = $$(`.face-2d[data-face="${face}"]`);
    faces3D[face] = $$(`.face-3d[data-face="${face}"]`);
    const face2D = faces2D[face];
    const face3D = faces3D[face];

    if (face2D) createStickers(face2D, false);
    if (face3D) createStickers(face3D, true);
  });
  updateDOM();
}

// Removed - now in CubeCore

// Detectar se sticker precisa de rotação 180° ao mudar de face
function needsFlip(fromFace, toFace) {
  const faceB = "B";
  const facesUDF = ["U", "D", "F"];
  return (
    (fromFace === faceB && facesUDF.includes(toFace)) ||
    (facesUDF.includes(fromFace) && toFace === faceB)
  );
}

function applyStickerStyle(sticker, face, index, stickerId) {
  textureManager.applyStickerStyle(sticker, face, index, stickerId, stickerRotations, stickerTextures, cubeState, faces);
}

function updateDOM() {
  try {
    if (viewController?.cubeView && viewController?.currentRenderer && typeof viewController.cubeView.render === 'function') {
      const textureConfig = textureManager.getConfig();
      textureConfig.stickerTextures = stickerTextures;
      viewController.cubeView.render(cubeState, stickerRotations, stickerTextures, textureConfig);
      return;
    }
  } catch (e) {
    console.warn('Renderer failed, using fallback:', e);
  }
  
  // Fallback to legacy rendering
  faces.forEach((face, faceIndex) => {
    faces2D[face] = $$(`.face-2d[data-face="${face}"]`);
    faces3D[face] = $$(`.face-3d[data-face="${face}"]`);
    const face2D = faces2D[face];
    const face3D = faces3D[face];
    [face2D, face3D].forEach((faceElement) => {
      if (faceElement) {
        for (let i = 0; i < 9; i++) {
          const sticker = faceElement.children[i];
          if (sticker) {
            const stickerId = cubeState[face][i];
            applyStickerStyle(sticker, face, i, stickerId);
          }
        }
      }
    });
  });
}

function setViewMode(mode) {
  viewController.setViewMode(mode);
  updateDOM();
}





// Removed - now in CubeCore

// All move functions removed - now in CubeCore
// Keeping wrapper for compatibility
function moveU() { cubeCore.moveU(); syncState(); }
function moveD() { cubeCore.moveD(); syncState(); }
function moveR() { cubeCore.moveR(); syncState(); }
function moveL() { cubeCore.moveL(); syncState(); }
function moveF() { cubeCore.moveF(); syncState(); }
function moveB() { cubeCore.moveB(); syncState(); }
function rotationX() { cubeCore.rotationX(); syncState(); }
function rotationY() { cubeCore.rotationY(); syncState(); }
function rotationZ() { cubeCore.rotationZ(); syncState(); }
function moveM() { cubeCore.moveM(); syncState(); }
function moveMPrime() { cubeCore.moveMPrime(); syncState(); }
function moveM2() { cubeCore.moveM2(); syncState(); }
function moveE() { cubeCore.moveE(); syncState(); }
function moveEPrime() { cubeCore.moveEPrime(); syncState(); }
function moveE2() { cubeCore.moveE2(); syncState(); }
function moveS() { cubeCore.moveS(); syncState(); }
function moveSPrime() { cubeCore.moveSPrime(); syncState(); }
function moveS2() { cubeCore.moveS2(); syncState(); }
function moveRw() { cubeCore.moveRw(); syncState(); }
function moveLw() { cubeCore.moveLw(); syncState(); }
function moveUw() { cubeCore.moveUw(); syncState(); }
function moveDw() { cubeCore.moveDw(); syncState(); }
function moveFw() { cubeCore.moveFw(); syncState(); }
function moveBw() { cubeCore.moveBw(); syncState(); }

function syncState() {
  cubeState = cubeCore.cubeState;
  stickerRotations = cubeCore.stickerRotations;
  stickerTextures = cubeCore.stickerTextures;
  
  if (renderThrottleEnabled && !rafScheduled) {
    rafScheduled = true;
    requestAnimationFrame(() => {
      updateDOM();
      rafScheduled = false;
    });
  } else if (!renderThrottleEnabled) {
    updateDOM();
  }
}

const repeat = (fn, times) => { for (let i = 0; i < times; i++) fn(); };
const prime = (fn) => () => repeat(fn, 3);
const double = (fn) => () => repeat(fn, 2);

let historyEnabled = false;

function toggleHistoryTracking() {
  historyEnabled = domManager.get('historyEnabled').checked;
  const label = document.querySelector('label[for="historyEnabled"]');
  if (historyEnabled) {
    if (!historyManager.root) {
      historyManager.init(getCurrentState());
    } else {
      historyManager.addMove('TRACK: ON', getCurrentState());
    }
    if (label) label.innerHTML = '<span style="color:#4caf50;font-weight:bold">✓ Track History (ON)</span>';
  } else {
    if (label) label.innerHTML = '<span style="color:#666">Track History (OFF)</span>';
  }
}

function applyMove(move, trackHistory = true) {
  cubeCore.applyMove(move);
  syncState();
  if (trackHistory && historyEnabled) historyManager.addMove(move, getCurrentState());
}

function applyAlgorithm() {
  let alg = domManager.get('alg').value.trim();
  if (!alg) return;
  
  alg = alg.replace(/’/g, "'");
  
  // Remove single-line comments (// comment)
  alg = alg.replace(/\/\/.*$/gm, '');
  
  // Remove multi-line comments (/* comment */)
  alg = alg.replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Replace )( with space to act as separator
  alg = alg.replace(/\)\(/g, ' ');
  
  // Remove remaining parentheses
  alg = alg.replace(/[()]/g, '');
  
  // Clean up and split moves
  const moves = alg.trim().split(/\s+/).filter(move => move.length > 0);
  
  if (moves.length <= 50) {
    moves.forEach((move) => applyMove(move));
  } else {
    moves.forEach((move) => cubeCore.applyMove(move));
    syncState();
    historyManager.addMove(`ALG (${moves.length} moves)`, getCurrentState());
  }
}

function solveCube() {
  initCube();
  if (textureManager.textureMode !== "standard") {
    updateDOM();
  }
  if (historyEnabled) historyManager.addMove('RESET', getCurrentState());
}

function loadCustomConfig() {
  configLoader.loadCustomConfig();
}

function openStateModal() {
  modalManager.openStateModal();
}

function closeStateModal() {
  modalManager.closeStateModal();
}

function switchTab(tab) {
  modalManager.switchTab(tab);
}



function toggleSidebar() {
  const controls = $$("#controls");
  const container = $$("#container");
  controls.classList.toggle("open");
  container.classList.toggle("controls-open");
  saveSidebarState();
}

function saveSidebarState() {
  const controls = $$("#controls");
  localStorage.setItem('sidebarOpen', controls.classList.contains('open'));
}



function toggleLeftPanel() {
  const controls = $$("#controls");
  controls.classList.toggle("hidden");
  localStorage.setItem('panelHidden', controls.classList.contains('hidden'));
}

function toggleFullscreen() {
  const elem = document.documentElement;
  if (!document.fullscreenElement && !document.webkitFullscreenElement) {
    if (elem.requestFullscreen) {
      elem.requestFullscreen({ navigationUI: 'hide' }).then(() => {
        setTimeout(setRealViewportHeight, 100);
      });
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
      setTimeout(setRealViewportHeight, 100);
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen().then(() => {
        setTimeout(setRealViewportHeight, 100);
      });
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
      setTimeout(setRealViewportHeight, 100);
    }
  }
}


// Modal functions
function openInstructionsModal() {
  modalManager.openInstructionsModal();
}

function closeInstructionsModal() {
  modalManager.closeInstructionsModal();
}

function tryExample(jsonExample) {
  closeInstructionsModal();
  domManager.get('customConfig').value = jsonExample;
  loadCustomConfig();
}

function loadExample() {
  configLoader.loadExample();
}


// Close modal when clicking outside
window.onclick = function (event) {
  const instructionsModal = $$("#instructionsModal");
  const stateModal = $$("#stateModal");
  const keyConfigModal = $$("#keyConfigModal");
  if (event.target === instructionsModal) {
    closeInstructionsModal();
  } else if (event.target === stateModal) {
    closeStateModal();
  } else if (event.target === keyConfigModal) {
    bluetoothRotation.closeModal();
  }
};






// Send ESC to parent if in iframe
if (window.parent !== window) {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.parent.postMessage('closePreview', '*');
    }
  });
}

function loadDefaultTexture() {
  configLoader.loadDefaultTexture();
}

function toggleEditor() {
  editorBridge.toggleEditor();
}

// Camera control integration - using CameraTracking class


// Inicializar - moved to initializeApp()
// Camera controls initialized via initCameraUI();

// Load crisp mode
try {
  if (localStorage.getItem('crispMode') === 'true') {
    document.body.classList.add('crisp-mode');
    const btn = $('#crispBtn');
    btn.textContent = 'Crisp Mode: ON';
    btn.style.background = '#4caf50';
    btn.style.color = 'white';
  }
} catch (e) {}

// Load render throttle
try {
  const saved = localStorage.getItem('renderThrottle');
  if (saved !== null) {
    renderThrottleEnabled = saved === 'true';
  }
} catch (e) {}

// Load panel state
try {
  const panelHidden = localStorage.getItem('panelHidden');
  if (panelHidden === 'true') {
    $('#controls').classList.add('hidden');
  }
} catch (e) {}


// Show spinner on app start
const spinner = document.getElementById('loadingSpinner');
if (spinner) spinner.style.display = 'block';

// Guard to prevent multiple calls
if (!window.__defaultTextureLoaded) {
  window.__defaultTextureLoaded = true;
  setTimeout(() => loadDefaultTexture(), 200);
}




window.setCrispMode = () => {
  document.body.classList.add('crisp-mode');
};
window.unsetCrispMode = () => {
  document.body.classList.remove('crisp-mode');
};
window.toggleCrispMode = () => {
  document.body.classList.toggle('crisp-mode');
  const enabled = document.body.classList.contains('crisp-mode');
  const btn = domManager.get('crispBtn');
  btn.textContent = `Crisp Mode: ${enabled ? 'ON' : 'OFF'}`;
  btn.style.background = enabled ? '#4caf50' : '';
  btn.style.color = enabled ? 'white' : '';
  localStorage.setItem('crispMode', enabled);
};

function toggleRenderThrottle() {
  renderThrottleEnabled = !renderThrottleEnabled;
  const btn = domManager.get('throttleBtn');
  btn.textContent = `Render Throttle: ${renderThrottleEnabled ? 'ON' : 'OFF'}`;
  btn.style.background = renderThrottleEnabled ? '#4caf50' : '';
  btn.style.color = renderThrottleEnabled ? 'white' : '';
  localStorage.setItem('renderThrottle', renderThrottleEnabled);
}


// Save/load controls width
const controls = $('#controls');
let isLoading = true;

// Helper functions for class integration
function getCurrentState() {
  return {
    cubeState: JSON.parse(JSON.stringify(cubeState)),
    stickerRotations: JSON.parse(JSON.stringify(stickerRotations)),
    stickerTextures: JSON.parse(JSON.stringify(stickerTextures))
  };
}

function initCameraUI() {
  // Wire up camera UI controls
  const settings = cameraTracking.settings;
  
  domManager.get('sensitivityX').value = settings.sensitivityX;
  domManager.get('sensitivityXValue').textContent = settings.sensitivityX;
  domManager.get('sensitivityY').value = settings.sensitivityY;
  domManager.get('sensitivityYValue').textContent = settings.sensitivityY;
  domManager.get('offsetX').value = settings.offsetX;
  domManager.get('offsetXValue').textContent = settings.offsetX;
  domManager.get('offsetY').value = settings.offsetY;
  domManager.get('offsetYValue').textContent = settings.offsetY;
  domManager.get('bgSensitivityX').value = settings.bgSensitivityX;
  domManager.get('bgSensitivityXValue').textContent = settings.bgSensitivityX;
  domManager.get('bgSensitivityY').value = settings.bgSensitivityY;
  domManager.get('bgSensitivityYValue').textContent = settings.bgSensitivityY;
  domManager.get('sameSensitivity').checked = settings.sameSensitivity;
  domManager.get('sameBgSensitivity').checked = settings.sameBgSensitivity;
  domManager.get('invertX').checked = settings.invertX;
  domManager.get('invertY').checked = settings.invertY;
  domManager.get('invertBgX').checked = settings.invertBgX;
  domManager.get('invertBgY').checked = settings.invertBgY;
  
  // Event listeners
  domManager.get('sensitivityX').addEventListener('input', (e) => {
    settings.sensitivityX = parseInt(e.target.value);
    domManager.get('sensitivityXValue').textContent = settings.sensitivityX;
    if (settings.sameSensitivity) {
      settings.sensitivityY = settings.sensitivityX;
      domManager.get('sensitivityY').value = settings.sensitivityY;
      domManager.get('sensitivityYValue').textContent = settings.sensitivityY;
    }
    cameraTracking.save();
  });
  
  domManager.get('sensitivityY').addEventListener('input', (e) => {
    settings.sensitivityY = parseInt(e.target.value);
    domManager.get('sensitivityYValue').textContent = settings.sensitivityY;
    if (settings.sameSensitivity) {
      settings.sensitivityX = settings.sensitivityY;
      domManager.get('sensitivityX').value = settings.sensitivityX;
      domManager.get('sensitivityXValue').textContent = settings.sensitivityX;
    }
    cameraTracking.save();
  });
  
  domManager.get('offsetX').addEventListener('input', (e) => {
    settings.offsetX = parseInt(e.target.value);
    domManager.get('offsetXValue').textContent = settings.offsetX;
    cameraTracking.save();
  });
  
  domManager.get('offsetY').addEventListener('input', (e) => {
    settings.offsetY = parseInt(e.target.value);
    domManager.get('offsetYValue').textContent = settings.offsetY;
    cameraTracking.save();
  });
  
  domManager.get('bgSensitivityX').addEventListener('input', (e) => {
    settings.bgSensitivityX = parseInt(e.target.value);
    domManager.get('bgSensitivityXValue').textContent = settings.bgSensitivityX;
    if (settings.sameBgSensitivity) {
      settings.bgSensitivityY = settings.bgSensitivityX;
      domManager.get('bgSensitivityY').value = settings.bgSensitivityY;
      domManager.get('bgSensitivityYValue').textContent = settings.bgSensitivityY;
    }
    cameraTracking.save();
  });
  
  domManager.get('bgSensitivityY').addEventListener('input', (e) => {
    settings.bgSensitivityY = parseInt(e.target.value);
    domManager.get('bgSensitivityYValue').textContent = settings.bgSensitivityY;
    if (settings.sameBgSensitivity) {
      settings.bgSensitivityX = settings.bgSensitivityY;
      domManager.get('bgSensitivityX').value = settings.bgSensitivityX;
      domManager.get('bgSensitivityXValue').textContent = settings.bgSensitivityX;
    }
    cameraTracking.save();
  });
  
  ['sameSensitivity', 'sameBgSensitivity', 'invertX', 'invertY', 'invertBgX', 'invertBgY'].forEach(id => {
    domManager.get(id).addEventListener('change', (e) => {
      settings[id] = e.target.checked;
      cameraTracking.save();
    });
  });
  
  domManager.get('cameraSelect').addEventListener('change', () => {
    if (cameraTracking.enabled) cameraTracking.startCamera(domManager.get('cameraSelect').value);
  });
  
  // Set rotation callback
  cameraTracking.onRotationChange = (x, y) => {
    viewController.cubeRotation.x = x;
    viewController.cubeRotation.y = y;
    viewController.updateCubeRotation();
  };
}

// Global functions for HTML onclick handlers
function toggleCamera() {
  const btn = domManager.get('cameraBtn');
  const controls = domManager.get('cameraControls');
  const container = domManager.get('cameraContainer');
  
  cameraTracking.enabled = !cameraTracking.enabled;
  
  if (cameraTracking.enabled) {
    btn.textContent = 'Disable Camera';
    controls.style.display = 'block';
    container.style.display = 'block';
    cameraTracking.loadCameras().then(devices => {
      if (devices.length > 0) {
        const select = domManager.get('cameraSelect');
        select.innerHTML = '<option value="">Select Camera...</option>';
        devices.forEach((device, i) => {
          const option = document.createElement('option');
          option.value = device.deviceId;
          option.text = device.label || `Camera ${i + 1}`;
          select.appendChild(option);
        });
        cameraTracking.startCamera();
      }
    });
    if (viewController.currentViewMode === 'cubenet') setViewMode('perspective');
  } else {
    btn.textContent = 'Enable Camera';
    controls.style.display = 'none';
    container.style.display = 'none';
    cameraTracking.stop();
  }
}

function calibrateCamera() {
  cameraTracking.calibrate();
}

function resetAccessibility() {
  uiControls.resetAccessibility();
}

function resetBackgroundSize() {
  uiControls.resetBackgroundSize();
}

function selectBackground(filename) {
  uiControls.selectBackground(filename);
}

function applyBackgroundColor() {
  const color = domManager.get('bgColorPicker').value;
  domManager.get('right-panel').style.backgroundColor = color;
  localStorage.setItem('backgroundColor', color);
}

// Expose functions to window for HTML onclick handlers
window.toggleAccordion = (header) => uiControls.toggleAccordion(header);
window.toggleSidebar = toggleSidebar;
window.toggleLeftPanel = toggleLeftPanel;
window.toggleFullscreen = toggleFullscreen;
window.toggleEditor = toggleEditor;
window.tryExample = tryExample;
Object.defineProperty(window, 'editorOpen', {
  get: () => editorBridge?.editorOpen ?? false
});
window.applyAlgorithm = applyAlgorithm;
window.scrambleCube = scrambleCube;
window.toggleBluetooth = toggleBluetooth;
window.toggleCamera = toggleCamera;
window.calibrateCamera = calibrateCamera;
window.solveCube = solveCube;
window.openStateModal = openStateModal;
window.closeStateModal = closeStateModal;
window.clearHistory = clearHistory;
window.loadExample = loadExample;
window.loadCustomConfig = loadCustomConfig;
window.openInstructionsModal = openInstructionsModal;
window.closeInstructionsModal = closeInstructionsModal;
window.resetBackgroundSize = resetBackgroundSize;
window.selectBackground = selectBackground;
window.applyBackgroundColor = applyBackgroundColor;
window.setViewMode = setViewMode;
window.resetAccessibility = resetAccessibility;
window.switchTab = switchTab;
window.toggleRenderThrottle = toggleRenderThrottle;
window.toggleHistoryTracking = toggleHistoryTracking;
window.applyMove = applyMove;
window.configureRotationKey = configureRotationKey;
window.confirmRotationKey = confirmRotationKey;
window.closeKeyConfigModal = closeKeyConfigModal;
window.saveCurrentState = () => saveCurrentState();
window.loadSavedState = (id) => loadSavedState(id);
window.deleteSavedState = (id) => deleteSavedState(id);

// Initialize after DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

function initializeApp() {
  // Initialize DOM manager
  domManager.init();

  // Initialize modules
  viewController = new ViewController(domManager);
  inputHandler = new InputHandler(viewController, domManager);
  modalManager = new ModalManager(domManager, () => cubeState, () => stickerRotations);
  configLoader = new ConfigLoader(domManager, textureManager, updateDOM);
  editorBridge = new EditorBridge(domManager, viewController);
  moveGridBuilder = new MoveGridBuilder(domManager, applyMove);

  // Initialize input handling
  inputHandler.init();
  editorBridge.init();

  // Load saved view mode
  try {
    const savedViewMode = localStorage.getItem('viewMode') || 'perspective';
    setViewMode(savedViewMode);
  } catch (e) {
    setViewMode('perspective');
  }

  // Create move buttons
  moveGridBuilder.build();

  // Initialize UI controls
  uiControls.initAccessibility();
  uiControls.initBackground();
  uiControls.loadAccessibility();
  uiControls.loadBackground();
  uiControls.loadSelectedBackground();

  // Initialize history manager
  historyManager.onStateRestore = (state) => {
    cubeState = JSON.parse(JSON.stringify(state.cubeState));
    stickerRotations = JSON.parse(JSON.stringify(state.stickerRotations));
    stickerTextures = JSON.parse(JSON.stringify(state.stickerTextures));
    cubeCore.cubeState = cubeState;
    cubeCore.stickerRotations = stickerRotations;
    cubeCore.stickerTextures = stickerTextures;
    updateDOM();
  };
  
  // Set initial label state
  const label = document.querySelector('label[for="historyEnabled"]');
  if (label && historyEnabled) {
    label.innerHTML = '<span style="color:#4caf50;font-weight:bold">✓ Track History (ON)</span>';
  } else if (label) {
    label.innerHTML = '<span style="color:#666">Track History (OFF)</span>';
  }

  // Initialize cube and other components
  historyEnabled = domManager.get('historyEnabled')?.checked || false;
  initCube();
  uiControls.loadAccordionStates();
  uiControls.loadSidebarState();
  cameraTracking.load();
  initCameraUI();
  renderSavedStates();
  window.uiControls = uiControls;
  window.viewController = viewController;
  
  // Update throttle button UI after DOM is ready
  const throttleBtn = domManager.get('throttleBtn');
  if (throttleBtn) {
    throttleBtn.textContent = `Render Throttle: ${renderThrottleEnabled ? 'ON' : 'OFF'}`;
    throttleBtn.style.background = renderThrottleEnabled ? '#4caf50' : '';
    throttleBtn.style.color = renderThrottleEnabled ? 'white' : '';
  }
  
}

// Compatibility variables
let cameraEnabled = false;
let isCalibrated = false;
let historyRoot = null;

function saveCameraCalibration() {
  cameraTracking.save();
}

function addMoveToHistory(move) {
  historyManager.addMove(move, getCurrentState());
}

function initHistory() {
  historyManager.init(getCurrentState());
}

function clearHistory() {
  historyManager.clear();
  uiControls.showToast('History cleared');
}

function scrambleCube() {
  solveCube();
  const algUtils = new AlgUtils();
  algUtils.generateScrambleAlg(30);
  const scrambleAlg = algUtils.alg;
  domManager.get('alg').value = scrambleAlg;
  const moves = scrambleAlg.trim().split(/\s+/).filter(move => move.length > 0);
  moves.forEach((move) => cubeCore.applyMove(move));
  syncState();
  if (historyEnabled) historyManager.addMove(`SCRAMBLE (${moves.length} moves)`, getCurrentState());
}

// Bluetooth - using BluetoothCube class from bluetooth.js
let bluetoothCube = null;
const bluetoothRotation = new BluetoothRotation();
window.bluetoothRotation = bluetoothRotation;

function toggleBluetooth() {
  const btn = domManager.get('bluetoothBtn');
  const status = domManager.get('bluetoothStatus');
  const controls = domManager.$('#rotationModeControls');
  const mobileBtn = domManager.$('#rotationModeBtn');
  
  if (!bluetoothCube || !bluetoothCube.isConnected()) {
    btn.textContent = 'Connecting...';
    btn.disabled = true;
    bluetoothCube = new BluetoothCube();
    window.bluetoothCube = bluetoothCube;
    bluetoothCube.onMove((notation) => {
      const move = bluetoothRotation.processMove(notation);
      applyMove(move);
    });
    bluetoothCube.onConnect(() => {
      btn.textContent = 'Disconnect';
      btn.disabled = false;
      status.textContent = 'Connected to GiiKER cube';
      status.style.color = '#4caf50';
      if (controls) controls.classList.add('show');
      if (mobileBtn) mobileBtn.classList.add('show');
    });
    bluetoothCube.onDisconnect(() => {
      btn.textContent = 'Connect GiiKER Cube';
      btn.disabled = false;
      status.textContent = 'Disconnected';
      status.style.color = '#666';
      if (controls) controls.classList.remove('show');
      if (mobileBtn) mobileBtn.classList.remove('show');
    });
    bluetoothCube.onError((error) => {
      btn.textContent = 'Connect GiiKER Cube';
      btn.disabled = false;
      status.textContent = 'Connection failed';
      status.style.color = '#f44336';
    });
    bluetoothCube.connect();
  } else {
    bluetoothCube.disconnect();
  }
}

function configureRotationKey() {
  bluetoothRotation.configure();
}

function confirmRotationKey() {
  bluetoothRotation.confirm();
}

function closeKeyConfigModal() {
  bluetoothRotation.closeModal();
}

// State Management
function saveCurrentState() {
  const name = prompt('Enter a name for this state:');
  if (!name) return;
  stateManager.save(name, cubeState, stickerRotations, stickerTextures);
  renderSavedStates();
  uiControls.showToast('State saved!');
}

function loadSavedState(id) {
  const state = stateManager.load(id);
  if (!state) return;
  cubeState = JSON.parse(JSON.stringify(state.cubeState));
  stickerRotations = JSON.parse(JSON.stringify(state.stickerRotations));
  stickerTextures = JSON.parse(JSON.stringify(state.stickerTextures));
  cubeCore.cubeState = cubeState;
  cubeCore.stickerRotations = stickerRotations;
  cubeCore.stickerTextures = stickerTextures;
  updateDOM();
  if (historyEnabled) historyManager.addMove(`LOAD: ${state.name}`, getCurrentState());
  uiControls.showToast('State loaded!');
}

function deleteSavedState(id) {
  if (!confirm('Delete this saved state?')) return;
  stateManager.delete(id);
  renderSavedStates();
  uiControls.showToast('State deleted');
}

function renderSavedStates() {
  const grid = domManager.get('savedStatesGrid');
  if (!grid) return;
  const states = stateManager.getAll();
  grid.innerHTML = states.length === 0 ? '<div style="grid-column: 1/-1; text-align: center; color: #666; font-size: 12px; padding: 10px;">No saved states</div>' : states.map(s => `
    <div class="saved-state-item">
      <div class="state-name">${s.name}</div>
      <div class="state-date">${s.date}</div>
      <div class="state-actions">
        <button onclick="loadSavedState(${s.id})">Load</button>
        <button onclick="deleteSavedState(${s.id})" style="background: #f44336; color: white;">Delete</button>
      </div>
    </div>
  `).join('');
}


window.addEventListener('message', (e) => {
  if (e.data.type === 'toast') {
      // Only show toast if editor is actually open
      if (editorBridge?.editorOpen) {
        uiControls.showToast(e.data.message);
      }
      return;
  }
});

window.addEventListener('CLOSE_EDITOR', (e) => {
  console.log('ok')
});