import $ from 'jquery';
import 'jquery-ui-dist/jquery-ui.min.css';

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

const $$ = (sel) => {
  if (sel.startsWith('#')) {
    return document.getElementById(sel.slice(1));
  }
  return document.querySelector(sel);
};

let ElRightPanel, ElControls, ElContainer, ElCubeNet, ElCube3D, ElCubenetBtn, ElPerspectiveBtn, ElOrthographicBtn;
let ElCrispBtn, ElThrottleBtn, ElCameraBtn, ElBluetoothBtn, ElAlg, ElCustomConfig, ElExampleSelect, ElHistoryEnabled;
let ElStateModal, ElInstructionsModal, ElLoadingSpinner, ElToast, ElBluetoothStatus, ElCameraStatus, ElCameraSelect;
let ElCameraContainer, ElCameraControls, ElCameraPreview, ElHeadDot, ElHistoryGraph, ElHistoryRows, ElEditorIframe;
let ElStateTab, ElRotationsTab, ElBackgroundGallery, ElSensitivityX, ElSensitivityXValue, ElSensitivityY, ElSensitivityYValue;
let ElOffsetX, ElOffsetXValue, ElOffsetY, ElOffsetYValue, ElBgSensitivityX, ElBgSensitivityXValue, ElBgSensitivityY;
let ElBgSensitivityYValue, ElSameSensitivity, ElSameBgSensitivity, ElInvertX, ElInvertY, ElInvertBgX, ElInvertBgY;

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
let renderThrottleEnabled = false;
let rafScheduled = false;

let currentViewMode = "cubenet";
let cubeRotation = { x: -25, y: -45 };
let cubeSize = window.innerWidth <= 480 ? 230 : 350;
let zoom2D = 1;
let panOffset = { x: 0, y: 0 };
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let cameraRotationEnabled = true;
window.cameraRotationEnabled = cameraRotationEnabled;

// View system
let cubeView = null;
let currentRenderer = null;

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
    if (cubeView && currentRenderer && typeof cubeView.render === 'function') {
      const textureConfig = textureManager.getConfig();
      textureConfig.stickerTextures = stickerTextures;
      cubeView.render(cubeState, stickerRotations, stickerTextures, textureConfig);
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
  currentViewMode = mode;
  localStorage.setItem('viewMode', mode);

  try {
    // Hide all renderers
    if (currentRenderer && currentRenderer.hide) currentRenderer.hide();

    // Create and show new renderer
    if (!ElRightPanel) {
      console.warn('Container not found, deferring setViewMode');
      setTimeout(() => setViewMode(mode), 100);
      return;
    }

    if (mode === "cubenet") {
      currentRenderer = new CubeNetRenderer(ElRightPanel);
      currentRenderer.setZoom(zoom2D);
      currentRenderer.setPan(panOffset.x, panOffset.y);
      ElCubenetBtn.disabled = true;
      ElPerspectiveBtn.disabled = false;
      ElOrthographicBtn.disabled = false;
    } else if (mode === "perspective") {
      currentRenderer = new PerspectiveRenderer(ElRightPanel);
      currentRenderer.setRotation(cubeRotation.x, cubeRotation.y);
      currentRenderer.setSize(cubeSize);
      ElCubenetBtn.disabled = false;
      ElPerspectiveBtn.disabled = true;
      ElOrthographicBtn.disabled = false;
    } else if (mode === "orthographic") {
      currentRenderer = new IsometricRenderer(ElRightPanel);
      currentRenderer.setRotation(cubeRotation.x, cubeRotation.y);
      currentRenderer.setSize(cubeSize);
      ElCubenetBtn.disabled = false;
      ElPerspectiveBtn.disabled = false;
      ElOrthographicBtn.disabled = true;
    }

    currentRenderer.show();
    cubeView = new CubeView(ElRightPanel, currentRenderer);
    updateDOM();

    if (editorOpen) {
      ElCubenetBtn.disabled = true;
    }
  } catch (e) {
    console.error('setViewMode failed:', e);
    // Force fallback rendering
    currentRenderer = null;
    cubeView = null;
    updateDOM();
  }
}

function updateCubeRotation() {
  if (cubeView && currentRenderer && currentRenderer.setRotation) {
    cubeView.setRotation(cubeRotation.x, cubeRotation.y);
  } else if (ElCube3D) {
    ElCube3D.style.transform = `
      translate(-50%, -50%)
      rotateX(${cubeRotation.x}deg)
      rotateY(${cubeRotation.y}deg)
    `;
  }
  saveViewState();
}

function update2DZoom() {
  if (cubeView && currentRenderer && currentRenderer.setZoom) {
    cubeView.setZoom(zoom2D);
    cubeView.setPan(panOffset.x, panOffset.y);
  } else if (ElCubeNet) {
    ElCubeNet.style.transform = `translate(calc(-50% + ${panOffset.x}px), calc(-50% + ${panOffset.y}px)) scale(${zoom2D})`;
  }
  saveViewState();
}

function saveViewState() {
  localStorage.setItem('cubeViewState', JSON.stringify({
    cubeRotation,
    zoom2D,
    panOffset,
    cubeSize
  }));
}

function loadViewState() {
  try {
    const saved = localStorage.getItem('cubeViewState');
    if (saved) {
      const state = JSON.parse(saved);
      cubeRotation = state.cubeRotation || cubeRotation;
      zoom2D = state.zoom2D || zoom2D;
      panOffset = state.panOffset || panOffset;
      cubeSize = state.cubeSize || cubeSize;
      
      if (currentViewMode === 'cubenet') {
        update2DZoom();
      } else {
        document.documentElement.style.setProperty('--cube-size', `${cubeSize}px`);
        const fontSize = Math.max(8, Math.min(32, (cubeSize / 300) * 16));
        document.documentElement.style.setProperty('--font-size-3d', `${fontSize}px`);
        updateCubeRotation();
      }
    }
  } catch (e) {}
}

function handleMouseDown(e) {
  if (e.target.id === "right-panel" || e.target.closest("#right-panel")) {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
    ElRightPanel.style.cursor = "grabbing";
    e.preventDefault();
  }
}

function handleMouseMove(e) {
  if (!isDragging) return;

  const deltaMove = {
    x: e.clientX - previousMousePosition.x,
    y: e.clientY - previousMousePosition.y,
  };

  if (currentViewMode === "cubenet") {
    panOffset.x += deltaMove.x;
    panOffset.y += deltaMove.y;
    update2DZoom();
  } else {
    if (!window.cameraRotationEnabled) return;
    cubeRotation.x -= deltaMove.y * 0.5;
    cubeRotation.y += deltaMove.x * 0.5;
    cubeRotation.x = Math.max(-90, Math.min(90, cubeRotation.x));
    updateCubeRotation();
  }

  previousMousePosition = { x: e.clientX, y: e.clientY };
}

function handleMouseUp() {
  isDragging = false;
  ElRightPanel.style.cursor = "grab";
}

function handleWheel(e) {
  if (e.target.closest("#controls")) return;
  e.preventDefault();

  const delta = Math.sign(e.deltaY);

  if (currentViewMode === "cubenet") {
    zoom2D = Math.max(0.5, Math.min(3, zoom2D * (1 - delta * 0.1)));
    update2DZoom();
  } else {
    // Zoom background if camera is enabled
    if (cameraEnabled && isCalibrated) {
      bgZoom += delta > 0 ? -5 : 5;
      bgZoom = Math.max(50, Math.min(300, bgZoom));
      saveCameraCalibration();
    } else {
      cubeSize = Math.max(200, Math.min(800, cubeSize * (1 - delta * 0.1)));
      const fontSize = Math.max(8, Math.min(32, (cubeSize / 300) * 16));
      document.documentElement.style.setProperty(
        "--cube-size",
        `${cubeSize}px`
      );
      document.documentElement.style.setProperty(
        "--font-size-3d",
        `${fontSize}px`
      );
      saveViewState();
    }
  }
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
  historyEnabled = ElHistoryEnabled.checked;
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
  let alg = ElAlg.value.trim();
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
  ElLoadingSpinner.style.display = 'block';
  
  try {
    let configText = ElCustomConfig.value;
    if (!configText || !configText.trim()) {
      ElLoadingSpinner.style.display = 'none';
      return;
    }
    // Strip comments from JSON
    function stripJsonComments(json) {
      let result = '';
      let inString = false;
      let inComment = false;
      let inBlockComment = false;
      for (let i = 0; i < json.length; i++) {
        const char = json[i];
        const next = json[i + 1] || '';
        if (inBlockComment) {
          if (char === '*' && next === '/') {
            inBlockComment = false;
            i++;
          }
          continue;
        }
        if (inComment) {
          if (char === '\n') {
            inComment = false;
            result += char;
          }
          continue;
        }
        if (char === '"' && (i === 0 || json[i - 1] !== '\\')) {
          inString = !inString;
          result += char;
          continue;
        }
        if (!inString) {
          if (char === '/' && next === '/') {
            inComment = true;
            i++;
            continue;
          }
          if (char === '/' && next === '*') {
            inBlockComment = true;
            i++;
            continue;
          }
        }
        result += char;
      }
      return result;
    }
    configText = stripJsonComments(configText);
    let finalConfig = JSON.parse(configText);
    
    // Handle new unified system
    if (finalConfig.textures && finalConfig.cube && !finalConfig.mode) {
      textureManager.setMode("unified");
      if (finalConfig.vars) {
        finalConfig = replaceVarsInConfig(finalConfig);
      }
      textureManager.loadUnifiedConfig(finalConfig);
    }
    // Legacy system support
    else if (finalConfig.mode) {
      if (finalConfig.vars) {
        finalConfig = replaceVarsInConfig(finalConfig);
      }
      textureManager.loadLegacyConfig(finalConfig);
      
      if (!stickerTextures.U || stickerTextures.U.length === 0) {
        faces.forEach((face, faceIndex) => {
          stickerTextures[face] = Array(9)
            .fill(0)
            .map((_, i) => ({ face, index: i }));
        });
      }
    }

    // Check for background images and wait for them to load
    const imagePromises = [];
    Object.values(textureManager.faceTextures).forEach(texture => {
      if (texture && texture.backgroundImage) {
        const match = texture.backgroundImage.match(/url\(["']?([^"')]+)["']?\)/);
        if (match) {
          const img = new Image();
          const promise = new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = resolve; // Continue even if image fails
          });
          img.src = match[1];
          imagePromises.push(promise);
        }
      }
    });

    Promise.all(imagePromises).then(() => {
      updateDOM();
      ElLoadingSpinner.style.display = 'none';
    });

    // If no images, hide spinner immediately after DOM update
    if (imagePromises.length === 0) {
      updateDOM();
      ElLoadingSpinner.style.display = 'none';
    }
  } catch (error) {
    ElLoadingSpinner.style.display = 'none';
    alert("JSON Error: " + error.message);
  }
}

function openStateModal() {
  updateStateTab();
  updateRotationsTab();
  
  // Calculate optimal width based on longest line (middle row with L F R B)
  const longestLineChars = 41; // Adjusted for 2-digit numbers with proper spacing
  const charWidth = 8.4;
  const padding = 60;
  const optimalWidth = Math.min(longestLineChars * charWidth + padding, window.innerWidth * 0.9);
  
  $$('#stateModal').querySelector('.modal-content').style.width = `${optimalWidth}px`;
  $$('#stateModal').style.display = 'block';
}

function closeStateModal() {
  $$('#stateModal').style.display = 'none';
}

function formatCubeDisplay(data, formatter = v => v, extraLabelSpacing=0) {
  const f = formatter;
  const vals = Object.values(data).flat().map(f);
  const w = Math.max(...vals.map(v => v.toString().length));
  const pad = v => f(v).toString().padStart(w, ' ');
  const row = (face, start) => `${pad(data[face][start])} ${pad(data[face][start+1])} ${pad(data[face][start+2])}`;
  const faceWidth = w * 3 + 2;
  const midCol = w + 1;
  const indent = ' '.repeat(faceWidth + 3);
  const labelIndent = ' '.repeat(faceWidth + 3 + midCol);
  const labelGap = ' '.repeat(faceWidth + 2);
  const extraSpace = ' '.repeat(extraLabelSpacing);
  return `${extraSpace}${labelIndent}U
${indent}${row('U',0)}
${indent}${row('U',3)}
${indent}${row('U',6)}

${' '.repeat(midCol)}${extraSpace}L${labelGap}F${labelGap}R${labelGap}B
${row('L',0)}   ${row('F',0)}   ${row('R',0)}   ${row('B',0)}
${row('L',3)}   ${row('F',3)}   ${row('R',3)}   ${row('B',3)}
${row('L',6)}   ${row('F',6)}   ${row('R',6)}   ${row('B',6)}

${extraSpace}${labelIndent}D
${indent}${row('D',0)}
${indent}${row('D',3)}
${indent}${row('D',6)}`;
}

function copyToClipboard() {
  const stateDisplay = formatCubeDisplay(cubeState, v => v.toString().padStart(2, ' '), 1);
  const rotationsDisplay = formatCubeDisplay(stickerRotations);
  navigator.clipboard.writeText(`----STICKERS----\n\n${stateDisplay}\n\n----ROTATIONS----\n\n${rotationsDisplay}`).then(() => uiControls.showToast('Copied to clipboard!'));
}



function switchTab(tab) {
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  document.querySelector(`[onclick="switchTab('${tab}')"]`).classList.add('active');
  $$(`#${tab}Tab`).classList.add('active');
}

function updateStateTab() {
  const pre = document.createElement('pre');
  pre.style.cssText = 'background: #f5f5f5; padding: 15px; border-radius: 4px; overflow-x: auto; font-family: "Courier New", monospace; font-size: 14px; line-height: 1.2; cursor: pointer;';
  pre.textContent = formatCubeDisplay(cubeState, v => v.toString().padStart(2, ' '), 1);
  pre.onclick = copyToClipboard;
  ElStateTab.innerHTML = '<p><strong>Sticker positions (0-53):</strong></p>';
  ElStateTab.appendChild(pre);
}

function updateRotationsTab() {
  const total = faces.reduce((sum, face) => sum + stickerRotations[face].reduce((a, b) => a + b, 0), 0);
  const pre = document.createElement('pre');
  pre.style.cssText = 'background: #f5f5f5; padding: 15px; border-radius: 4px; overflow-x: auto; font-family: "Courier New", monospace; font-size: 14px; line-height: 1.2; cursor: pointer;';
  pre.textContent = formatCubeDisplay(stickerRotations);
  pre.onclick = copyToClipboard;
  ElRotationsTab.innerHTML = `<p><strong>Total rotations:</strong> ${total}</p>`;
  ElRotationsTab.appendChild(pre);
}

function initEventListeners() {
  ElRightPanel.addEventListener("mousedown", handleMouseDown);
ElRightPanel.addEventListener("touchstart", handleTouchStart, { passive: false });
document.addEventListener("mousemove", handleMouseMove);
document.addEventListener("touchmove", handleTouchMove, { passive: false });
document.addEventListener("mouseup", handleMouseUp);
document.addEventListener("touchend", handleTouchEnd);
ElRightPanel.addEventListener("wheel", handleWheel, { passive: false });

// Pinch zoom for touch devices
let initialDistance = 0;
let initialZoom = 1;

ElRightPanel.addEventListener("touchstart", function(e) {
  if (e.touches.length === 2) {
    initialDistance = getTouchDistance(e.touches[0], e.touches[1]);
    initialZoom = currentViewMode === "cubenet" ? zoom2D : cubeSize / 300;
  }
}, { passive: false });

ElRightPanel.addEventListener("touchmove", function(e) {
  if (e.touches.length === 2) {
    const currentDistance = getTouchDistance(e.touches[0], e.touches[1]);
    const scale = currentDistance / initialDistance;
    
    if (currentViewMode === "cubenet") {
      zoom2D = Math.max(0.5, Math.min(3, initialZoom * scale));
      update2DZoom();
    } else {
      cubeSize = Math.max(200, Math.min(800, initialZoom * scale * 300));
      const fontSize = Math.max(8, Math.min(32, (cubeSize / 300) * 16));
      document.documentElement.style.setProperty("--cube-size", `${cubeSize}px`);
      document.documentElement.style.setProperty("--font-size-3d", `${fontSize}px`);
    }
  }
}, { passive: false });
}

function getTouchDistance(touch1, touch2) {
  const dx = touch1.clientX - touch2.clientX;
  const dy = touch1.clientY - touch2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

function handleTouchStart(e) {
  if (e.touches.length === 1) {
    isDragging = true;
    const touch = e.touches[0];
    previousMousePosition = { x: touch.clientX, y: touch.clientY };
    e.preventDefault();
  }
}

function handleTouchMove(e) {
  if (!isDragging || e.touches.length !== 1) return;
  
  const touch = e.touches[0];
  const deltaMove = {
    x: touch.clientX - previousMousePosition.x,
    y: touch.clientY - previousMousePosition.y,
  };
  
  if (currentViewMode === "cubenet") {
    panOffset.x += deltaMove.x;
    panOffset.y += deltaMove.y;
    update2DZoom();
  } else {
    cubeRotation.x -= deltaMove.y * 0.5;
    cubeRotation.y += deltaMove.x * 0.5;
    cubeRotation.x = Math.max(-90, Math.min(90, cubeRotation.x));
    updateCubeRotation();
  }
  
  previousMousePosition = { x: touch.clientX, y: touch.clientY };
  e.preventDefault();
}

function handleTouchEnd(e) {
  isDragging = false;
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
  $$("#instructionsModal").style.display = "block";
  
  // Add event listeners to try-example links
  document.querySelectorAll('a[href="#try-example"]').forEach(link => {
    link.onclick = function() {
      let nextElement = this.parentElement.nextElementSibling;
      while (nextElement && nextElement.tagName !== 'PRE') {
        nextElement = nextElement.nextElementSibling;
      }
      if (nextElement) {
        const codeBlock = nextElement.querySelector('code');
        if (codeBlock) {
          tryExample(codeBlock.textContent);
        }
      }
      return false;
    };
  });
}

function closeInstructionsModal() {
  $$("#instructionsModal").style.display = "none";
}

function tryExample(jsonExample) {
  closeInstructionsModal();
  $$('#customConfig').value = jsonExample;
  loadCustomConfig();
}

function loadExample() {
  const select = $$('#exampleSelect');
  const filename = select.value;
  if (!filename) return;
  
  const rawContent = examplesRaw[filename];
  if (rawContent) {
    $$('#customConfig').value = rawContent;
    loadCustomConfig();
    saveSelectedTexture(filename);
  }
  if (editorOpen) {
    const editorIframe = $$('#editor-iframe');
    editorIframe.contentWindow.triggerImportFromParent();
  }
}

function saveSelectedTexture(filename) {
  localStorage.setItem('selectedTexture', filename);
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
  const savedTexture = localStorage.getItem('selectedTexture');
  const select = $$('#exampleSelect');
  
  if (savedTexture && examplesRaw[savedTexture]) {
    select.value = savedTexture;
    loadExample();
  } else {
    const firstOption = select.options[1];
    if (firstOption) {
      select.value = firstOption.value;
      loadExample();
    }
  }
}

// Editor functions
let editorOpen = false;

function toggleEditor() {
  const cubeNet = $$('#cube-net');
  const cube3DWrapper = $$('#cube-3d-wrapper');
  const editorIframe = $$('#editor-iframe');
  
  editorOpen = !editorOpen;
  
  if (editorOpen) {
    
    $$("#cubenetBtn").disabled = true;
    setViewMode('perspective');
    if (window.toggleEditorWindow) window.toggleEditorWindow(true);

    // Show editor
    editorIframe.style.display = 'block';
    ElRightPanel.classList.add('editor-open');
    
    // Trigger auto-import after iframe is shown
    setTimeout(() => {
      try {
        editorIframe.contentWindow.triggerImportFromParent();
      } catch (e) {}
    }, 200);
    // Send current config to editor
    const currentConfig = $$('#customConfig').value;
    if (currentConfig && currentConfig.trim()) {
      const sendConfig = () => {
        try {
          const config = JSON.parse(currentConfig);
          editorIframe.contentWindow.postMessage({
            type: 'IMPORT_CONFIG',
            payload: { config }
          }, '*');
        } catch (e) {
          editorIframe.contentWindow.postMessage({
            type: 'IMPORT_CONFIG',
            payload: { config: currentConfig }
          }, '*');
        }
      };
      // Try immediately if already loaded, otherwise wait
      setTimeout(sendConfig, 500);
      editorIframe.onload = sendConfig;
    }
    // Keep cube elements visible based on current view mode
    if (currentViewMode === 'cubenet') {
      cubeNet.style.display = 'grid';
      cube3DWrapper.style.display = 'none';
    } else {
      cubeNet.style.display = 'none';
      cube3DWrapper.style.display = 'block';
    }
  } else {
    // Hide editor
    $$("#cubenetBtn").disabled = false;
    editorIframe.style.display = 'none';
    ElRightPanel.classList.remove('editor-open');
    if (window.toggleEditorWindow) window.toggleEditorWindow(false);
    // Keep cube elements visible based on current view mode
    if (currentViewMode === 'cubenet') {
      cubeNet.style.display = 'grid';
      cube3DWrapper.style.display = 'none';
    } else {
      cubeNet.style.display = 'none';
      cube3DWrapper.style.display = 'block';
    }
  }
}


// Listen for editor updates
window.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'UPDATE_CONFIG' && event.data.payload.config) {
    const config = event.data.payload.config;
    $$('#customConfig').value = JSON.stringify(config, null, 2);
    loadCustomConfig();
  }
  if (event.data && event.data.type === 'CLOSE_EDITOR') {
    toggleEditor();
  }
  if (event.data && event.data.type === 'EDITOR_READY') {
    // Editor is ready, send current config
    const currentConfig = $$('#customConfig').value;
    if (currentConfig && currentConfig.trim()) {
      try {
        const config = JSON.parse(currentConfig);
        event.source.postMessage({
          type: 'IMPORT_CONFIG',
          payload: { config }
        }, '*');
      } catch (e) {
        event.source.postMessage({
          type: 'IMPORT_CONFIG',
          payload: { config: currentConfig }
        }, '*');
      }
    }
  }
});

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
  if (saved === 'true') {
    renderThrottleEnabled = true;
    const btn = $('#throttleBtn');
    btn.textContent = 'Render Throttle: ON';
    btn.style.background = '#4caf50';
    btn.style.color = 'white';
  }
} catch (e) {}

// Load panel state
try {
  const panelHidden = localStorage.getItem('panelHidden');
  if (panelHidden === 'true') {
    $('#controls').classList.add('hidden');
  }
} catch (e) {}


setTimeout(() => loadDefaultTexture(), 200);

// Variable replacement function (shared between unified and legacy)
function replaceVarsInConfig(config) {
  const replaceVars = (obj) => {
    if (typeof obj === 'string') {
      // Replace variables embedded in strings (e.g., "url('$url/image.png')")
      return obj.replace(/\$([a-zA-Z_][a-zA-Z0-9_]*)/g, (match, varName) => {
        return config.vars[varName] !== undefined ? config.vars[varName] : match;
      });
    } else if (Array.isArray(obj)) {
      return obj.map(replaceVars);
    } else if (obj && typeof obj === 'object') {
      const result = {};
      for (const [key, value] of Object.entries(obj)) {
        if (key !== 'vars') {
          result[key] = replaceVars(value);
        }
      }
      return result;
    }
    return obj;
  };
  return replaceVars(config);
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
  const btn = $$('#crispBtn');
  btn.textContent = `Crisp Mode: ${enabled ? 'ON' : 'OFF'}`;
  btn.style.background = enabled ? '#4caf50' : '';
  btn.style.color = enabled ? 'white' : '';
  localStorage.setItem('crispMode', enabled);
};

function toggleRenderThrottle() {
  renderThrottleEnabled = !renderThrottleEnabled;
  const btn = $$('#throttleBtn');
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
  
  $$('#sensitivityX').value = settings.sensitivityX;
  $$('#sensitivityXValue').textContent = settings.sensitivityX;
  $$('#sensitivityY').value = settings.sensitivityY;
  $$('#sensitivityYValue').textContent = settings.sensitivityY;
  $$('#offsetX').value = settings.offsetX;
  $$('#offsetXValue').textContent = settings.offsetX;
  $$('#offsetY').value = settings.offsetY;
  $$('#offsetYValue').textContent = settings.offsetY;
  $$('#bgSensitivityX').value = settings.bgSensitivityX;
  $$('#bgSensitivityXValue').textContent = settings.bgSensitivityX;
  $$('#bgSensitivityY').value = settings.bgSensitivityY;
  $$('#bgSensitivityYValue').textContent = settings.bgSensitivityY;
  $$('#sameSensitivity').checked = settings.sameSensitivity;
  $$('#sameBgSensitivity').checked = settings.sameBgSensitivity;
  $$('#invertX').checked = settings.invertX;
  $$('#invertY').checked = settings.invertY;
  $$('#invertBgX').checked = settings.invertBgX;
  $$('#invertBgY').checked = settings.invertBgY;
  
  // Event listeners
  $$('#sensitivityX').addEventListener('input', (e) => {
    settings.sensitivityX = parseInt(e.target.value);
    $$('#sensitivityXValue').textContent = settings.sensitivityX;
    if (settings.sameSensitivity) {
      settings.sensitivityY = settings.sensitivityX;
      $$('#sensitivityY').value = settings.sensitivityY;
      $$('#sensitivityYValue').textContent = settings.sensitivityY;
    }
    cameraTracking.save();
  });
  
  $$('#sensitivityY').addEventListener('input', (e) => {
    settings.sensitivityY = parseInt(e.target.value);
    $$('#sensitivityYValue').textContent = settings.sensitivityY;
    if (settings.sameSensitivity) {
      settings.sensitivityX = settings.sensitivityY;
      $$('#sensitivityX').value = settings.sensitivityX;
      $$('#sensitivityXValue').textContent = settings.sensitivityX;
    }
    cameraTracking.save();
  });
  
  $$('#offsetX').addEventListener('input', (e) => {
    settings.offsetX = parseInt(e.target.value);
    $$('#offsetXValue').textContent = settings.offsetX;
    cameraTracking.save();
  });
  
  $$('#offsetY').addEventListener('input', (e) => {
    settings.offsetY = parseInt(e.target.value);
    $$('#offsetYValue').textContent = settings.offsetY;
    cameraTracking.save();
  });
  
  $$('#bgSensitivityX').addEventListener('input', (e) => {
    settings.bgSensitivityX = parseInt(e.target.value);
    $$('#bgSensitivityXValue').textContent = settings.bgSensitivityX;
    if (settings.sameBgSensitivity) {
      settings.bgSensitivityY = settings.bgSensitivityX;
      $$('#bgSensitivityY').value = settings.bgSensitivityY;
      $$('#bgSensitivityYValue').textContent = settings.bgSensitivityY;
    }
    cameraTracking.save();
  });
  
  $$('#bgSensitivityY').addEventListener('input', (e) => {
    settings.bgSensitivityY = parseInt(e.target.value);
    $$('#bgSensitivityYValue').textContent = settings.bgSensitivityY;
    if (settings.sameBgSensitivity) {
      settings.bgSensitivityX = settings.bgSensitivityY;
      $$('#bgSensitivityX').value = settings.bgSensitivityX;
      $$('#bgSensitivityXValue').textContent = settings.bgSensitivityX;
    }
    cameraTracking.save();
  });
  
  ['sameSensitivity', 'sameBgSensitivity', 'invertX', 'invertY', 'invertBgX', 'invertBgY'].forEach(id => {
    $$('#' + id).addEventListener('change', (e) => {
      settings[id] = e.target.checked;
      cameraTracking.save();
    });
  });
  
  $$('#cameraSelect').addEventListener('change', () => {
    if (cameraTracking.enabled) cameraTracking.startCamera($$('#cameraSelect').value);
  });
  
  // Set rotation callback
  cameraTracking.onRotationChange = (x, y) => {
    cubeRotation.x = x;
    cubeRotation.y = y;
    updateCubeRotation();
  };
}

// Global functions for HTML onclick handlers
function toggleCamera() {
  const btn = $$('#cameraBtn');
  const controls = $$('#cameraControls');
  const container = $$('#cameraContainer');
  
  cameraTracking.enabled = !cameraTracking.enabled;
  
  if (cameraTracking.enabled) {
    btn.textContent = 'Disable Camera';
    controls.style.display = 'block';
    container.style.display = 'block';
    cameraTracking.loadCameras().then(devices => {
      if (devices.length > 0) {
        const select = $$('#cameraSelect');
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
    if (currentViewMode === 'cubenet') setViewMode('perspective');
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
  const color = $$('#bgColorPicker').value;
  $$('#right-panel').style.backgroundColor = color;
  localStorage.setItem('bgColor', color);
}

// Expose functions to window for HTML onclick handlers
window.toggleAccordion = (header) => uiControls.toggleAccordion(header);
window.toggleSidebar = toggleSidebar;
window.toggleLeftPanel = toggleLeftPanel;
window.toggleFullscreen = toggleFullscreen;
window.toggleEditor = toggleEditor;
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
  ElRightPanel = $$('#right-panel');
  ElControls = $$('#controls');
  ElContainer = $$('#container');
  ElCubeNet = $$('#cube-net');
  ElCube3D = $$('#cube-3d');
  ElCubenetBtn = $$('#cubenetBtn');
  ElPerspectiveBtn = $$('#perspectiveBtn');
  ElOrthographicBtn = $$('#orthographicBtn');
  ElCrispBtn = $$('#crispBtn');
  ElThrottleBtn = $$('#throttleBtn');
  ElCameraBtn = $$('#cameraBtn');
  ElBluetoothBtn = $$('#bluetoothBtn');
  ElAlg = $$('#alg');
  ElCustomConfig = $$('#customConfig');
  ElExampleSelect = $$('#exampleSelect');
  ElHistoryEnabled = $$('#historyEnabled');
  ElStateModal = $$('#stateModal');
  ElInstructionsModal = $$('#instructionsModal');
  ElLoadingSpinner = $$('#loadingSpinner');
  ElToast = $$('#toast');
  ElBluetoothStatus = $$('#bluetoothStatus');
  ElCameraStatus = $$('#cameraStatus');
  ElCameraSelect = $$('#cameraSelect');
  ElCameraContainer = $$('#cameraContainer');
  ElCameraControls = $$('#cameraControls');
  ElCameraPreview = $$('#cameraPreview');
  ElHeadDot = $$('#headDot');
  ElHistoryGraph = $$('#historyGraph');
  ElHistoryRows = $$('#historyRows');
  ElEditorIframe = $$('#editor-iframe');
  ElStateTab = $$('#stateTab');
  ElRotationsTab = $$('#rotationsTab');
  ElBackgroundGallery = $$('#backgroundGallery');
  ElSensitivityX = $$('#sensitivityX');
  ElSensitivityXValue = $$('#sensitivityXValue');
  ElSensitivityY = $$('#sensitivityY');
  ElSensitivityYValue = $$('#sensitivityYValue');
  ElOffsetX = $$('#offsetX');
  ElOffsetXValue = $$('#offsetXValue');
  ElOffsetY = $$('#offsetY');
  ElOffsetYValue = $$('#offsetYValue');
  ElBgSensitivityX = $$('#bgSensitivityX');
  ElBgSensitivityXValue = $$('#bgSensitivityXValue');
  ElBgSensitivityY = $$('#bgSensitivityY');
  ElBgSensitivityYValue = $$('#bgSensitivityYValue');
  ElSameSensitivity = $$('#sameSensitivity');
  ElSameBgSensitivity = $$('#sameBgSensitivity');
  ElInvertX = $$('#invertX');
  ElInvertY = $$('#invertY');
  ElInvertBgX = $$('#invertBgX');
  ElInvertBgY = $$('#invertBgY');

  initEventListeners();

  // Load saved view mode or default to perspective

  try {
    const savedViewMode = localStorage.getItem('viewMode') || 'perspective';
    setViewMode(savedViewMode);
  } catch (e) {
    setViewMode('perspective');
  }


  // Create move buttons
  const moves = ['U','D','R','L','F','B','M','E','S','x','y','z','Rw','Lw','Uw','Dw','Fw','Bw'];
  const grid = document.getElementById('moveGrid');
  moves.forEach(m => {
    ['', "'", '2'].forEach(mod => {
      const move = m + mod;
      const btn = document.createElement('button');
      btn.onclick = () => applyMove(move);
      btn.textContent = move.replace("'", "'");
      grid.appendChild(btn);
    });
  });

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
  historyEnabled = ElHistoryEnabled?.checked || false;
  initCube();
  uiControls.loadAccordionStates();
  uiControls.loadSidebarState();
  cameraTracking.load();
  initCameraUI();
  renderSavedStates();
  window.uiControls = uiControls;
  
}

// Compatibility variables
let cameraEnabled = false;
let isCalibrated = false;
let bgZoom = 150;
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
  $$('#alg').value = scrambleAlg;
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
  const btn = $$('#bluetoothBtn');
  const status = $$('#bluetoothStatus');
  const controls = $$('#rotationModeControls');
  const mobileBtn = $$('#rotationModeBtn');
  
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
  const grid = $$('#savedStatesGrid');
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


