

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

const $ = (sel) => sel.startsWith('#') ? document.getElementById(sel.slice(1)) : document.querySelector(sel);

const ElRightPanel = $('#right-panel');
const ElControls = $('#controls');
const ElContainer = $('#container');
const ElCubeNet = $('#cube-net');
const ElCube3D = $('#cube-3d');
const ElCubenetBtn = $('#cubenetBtn');
const ElPerspectiveBtn = $('#perspectiveBtn');
const ElOrthographicBtn = $('#orthographicBtn');
const ElCrispBtn = $('#crispBtn');
const ElThrottleBtn = $('#throttleBtn');
const ElCameraBtn = $('#cameraBtn');
const ElBluetoothBtn = $('#bluetoothBtn');
const ElAlg = $('#alg');
const ElCustomConfig = $('#customConfig');
const ElExampleSelect = $('#exampleSelect');
const ElHistoryEnabled = $('#historyEnabled');
const ElStateModal = $('#stateModal');
const ElInstructionsModal = $('#instructionsModal');
const ElLoadingSpinner = $('#loadingSpinner');
const ElToast = $('#toast');
const ElBluetoothStatus = $('#bluetoothStatus');
const ElCameraStatus = $('#cameraStatus');
const ElCameraSelect = $('#cameraSelect');
const ElCameraContainer = $('#cameraContainer');
const ElCameraControls = $('#cameraControls');
const ElCameraPreview = $('#cameraPreview');
const ElHeadDot = $('#headDot');
const ElHistoryGraph = $('#historyGraph');
const ElHistoryRows = $('#historyRows');
const ElEditorIframe = $('#editor-iframe');
const ElStateTab = $('#stateTab');
const ElRotationsTab = $('#rotationsTab');
const ElBackgroundGallery = $('#backgroundGallery');
const ElSensitivityX = $('#sensitivityX');
const ElSensitivityXValue = $('#sensitivityXValue');
const ElSensitivityY = $('#sensitivityY');
const ElSensitivityYValue = $('#sensitivityYValue');
const ElOffsetX = $('#offsetX');
const ElOffsetXValue = $('#offsetXValue');
const ElOffsetY = $('#offsetY');
const ElOffsetYValue = $('#offsetYValue');
const ElBgSensitivityX = $('#bgSensitivityX');
const ElBgSensitivityXValue = $('#bgSensitivityXValue');
const ElBgSensitivityY = $('#bgSensitivityY');
const ElBgSensitivityYValue = $('#bgSensitivityYValue');
const ElSameSensitivity = $('#sameSensitivity');
const ElSameBgSensitivity = $('#sameBgSensitivity');
const ElInvertX = $('#invertX');
const ElInvertY = $('#invertY');
const ElInvertBgX = $('#invertBgX');
const ElInvertBgY = $('#invertBgY');

const faces2D = {};
const faces3D = {};

// Initialize CubeCore
const cubeCore = new CubeCore();
const textureManager = new TextureManager();

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

    faces2D[face] = $(`.face-2d[data-face="${face}"]`);
    faces3D[face] = $(`.face-3d[data-face="${face}"]`);
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
    faces2D[face] = $(`.face-2d[data-face="${face}"]`);
    faces3D[face] = $(`.face-3d[data-face="${face}"]`);
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
  if (historyEnabled && !historyRoot) initHistory();
}

function applyMove(move, trackHistory = true) {
  cubeCore.applyMove(move);
  syncState();
  if (trackHistory && historyEnabled) addMoveToHistory(move);
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
    addMoveToHistory(`ALG (${moves.length} moves)`);
  }
}

function solveCube() {
  initCube();
  if (textureManager.textureMode !== "standard") {
    updateDOM();
  }
  if (historyEnabled) addMoveToHistory('RESET');
}

function loadCustomConfig() {
  ElLoadingSpinner.style.display = 'block';
  
  try {
    let configText = ElCustomConfig.value;
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
  
  $('#stateModal').querySelector('.modal-content').style.width = `${optimalWidth}px`;
  $('#stateModal').style.display = 'block';
}

function closeStateModal() {
  $('#stateModal').style.display = 'none';
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
  navigator.clipboard.writeText(`----STICKERS----\n\n${stateDisplay}\n\n----ROTATIONS----\n\n${rotationsDisplay}`).then(() => showToast('Copied to clipboard!'));
}

function showToast(message) {
  ElToast.textContent = message;
  ElToast.classList.add('show');
  setTimeout(() => ElToast.classList.remove('show'), 2000);
}

function switchTab(tab) {
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  document.querySelector(`[onclick="switchTab('${tab}')"]`).classList.add('active');
  $(`#${tab}Tab`).classList.add('active');
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

// Event listeners
ElRightPanel.addEventListener("mousedown", handleMouseDown);
ElRightPanel.addEventListener("touchstart", handleTouchStart, { passive: true });
document.addEventListener("mousemove", handleMouseMove);
document.addEventListener("touchmove", handleTouchMove, { passive: true });
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
}, { passive: true });

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
}, { passive: true });

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
  const controls = $("#controls");
  const container = $("#container");
  controls.classList.toggle("open");
  container.classList.toggle("controls-open");
  saveSidebarState();
}

function saveSidebarState() {
  const controls = $("#controls");
  localStorage.setItem('sidebarOpen', controls.classList.contains('open'));
}

function loadSidebarState() {
  try {
    const saved = localStorage.getItem('sidebarOpen');
    if (saved === 'true') {
      const controls = $("#controls");
      const container = $("#container");
      controls.classList.add('open');
      container.classList.add('controls-open');
    }
  } catch (e) {}
}

function toggleLeftPanel() {
  const controls = $("#controls");
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
  $("#instructionsModal").style.display = "block";
  
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
  $("#instructionsModal").style.display = "none";
}

function tryExample(jsonExample) {
  closeInstructionsModal();
  $('#customConfig').value = jsonExample;
  loadCustomConfig();
}

function loadExample() {
  const select = $('#exampleSelect');
  const filename = select.value;
  if (!filename) return;
  
  const rawContent = examplesRaw[filename];
  if (rawContent) {
    $('#customConfig').value = rawContent;
    loadCustomConfig();
    saveSelectedTexture(filename);
  }
  if (editorOpen) {
    const editorIframe = $('#editor-iframe');
    editorIframe.contentWindow.triggerImportFromParent();
  }
}

function saveSelectedTexture(filename) {
  localStorage.setItem('selectedTexture', filename);
}

function loadSelectedTexture() {
  try {
    const saved = localStorage.getItem('selectedTexture');
    if (saved) {
      const select = $('#exampleSelect');
      select.value = saved;
      loadExample();
    }
  } catch (e) {
    loadPochmannDefault();
  }
}

// Close modal when clicking outside
window.onclick = function (event) {
  const instructionsModal = $("#instructionsModal");
  const stateModal = $("#stateModal");
  if (event.target === instructionsModal) {
    closeInstructionsModal();
  } else if (event.target === stateModal) {
    closeStateModal();
  }
};



// Accordion functionality
function toggleAccordion(header) {
  const accordion = header.parentElement;
  accordion.classList.toggle('open');
  saveAccordionStates();
}

function saveAccordionStates() {
  const accordions = document.querySelectorAll('.accordion');
  const states = {};
  accordions.forEach((accordion, index) => {
    states[index] = accordion.classList.contains('open');
  });
  localStorage.setItem('accordionStates', JSON.stringify(states));
}

function loadAccordionStates() {
  try {
    const saved = localStorage.getItem('accordionStates');
    if (saved) {
      const states = JSON.parse(saved);
      const accordions = document.querySelectorAll('.accordion');
      accordions.forEach((accordion, index) => {
        if (states[index]) {
          accordion.classList.add('open');
        } else {
          accordion.classList.remove('open');
        }
      });
    }
  } catch (e) {}
}

// Send ESC to parent if in iframe
if (window.parent !== window) {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.parent.postMessage('closePreview', '*');
    }
  });
}

function loadPochmannDefault() {
  if (defaultTexture) {
    if (defaultTexture.textures && defaultTexture.cube && !defaultTexture.mode) {
      textureManager.setMode("unified");
      textureManager.loadUnifiedConfig(defaultTexture);
    } else if (defaultTexture.mode === "face_textures") {
      textureManager.setMode("face_textures");
      textureManager.faceTextures = defaultTexture.textures || {};
      faces.forEach((face) => {
        stickerTextures[face] = Array(9).fill(0).map((_, i) => ({ face, index: i }));
      });
    }
    updateDOM();
  }
}

// Editor functions
let editorOpen = false;

function toggleEditor() {
  const cubeNet = $('#cube-net');
  const cube3DWrapper = $('#cube-3d-wrapper');
  const editorIframe = $('#editor-iframe');
  
  editorOpen = !editorOpen;
  
  if (editorOpen) {
    
    $("#cubenetBtn").disabled = true;
    setViewMode('perspective');

    // Show editor
    editorIframe.style.display = 'block';
    ElRightPanel.classList.add('editor-open');
    
    // Trigger auto-import after iframe is shown
    setTimeout(() => {
      try {
        editorIframe.contentWindow.triggerImportFromParent();
      } catch (e) {
        console.log('Could not trigger auto-import:', e);
      }
    }, 200);
    // Send current config to editor
    const currentConfig = $('#customConfig').value;
    if (currentConfig.trim()) {
      const sendConfig = () => {
        try {
          const config = JSON.parse(currentConfig);
          editorIframe.contentWindow.postMessage({
            type: 'IMPORT_CONFIG',
            payload: { config }
          }, '*');
        } catch (e) {
          console.log('Config not valid JSON, sending as string');
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
    $("#cubenetBtn").disabled = false;
    editorIframe.style.display = 'none';
    ElRightPanel.classList.remove('editor-open');
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
    $('#customConfig').value = JSON.stringify(config, null, 2);
    loadCustomConfig();
  }
  if (event.data && event.data.type === 'CLOSE_EDITOR') {
    toggleEditor();
  }
  if (event.data && event.data.type === 'EDITOR_READY') {
    // Editor is ready, send current config
    const currentConfig = $('#customConfig').value;
    if (currentConfig.trim()) {
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

// Camera control integration
let cameraEnabled = false;
let faceMesh = null;
let cameraStream = null;
let camera = null;
let calibrationCenter = { x: 0, y: 0 };
let isCalibrated = false;
let sensitivityX = 60;
let sensitivityY = 40;
let offsetX = 0;
let offsetY = 0;
let bgSensitivityX = 30;
let bgSensitivityY = 30;
let bgZoom = 150;
let sameSensitivity = false;
let sameBgSensitivity = false;
let invertX = false;
let invertY = false;
let invertBgX = false;
let invertBgY = false;
let lastUpdateTime = 0;
let mediaPipeReady = false;
let faceDetected = false;

async function loadCameras() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    stream.getTracks().forEach(track => track.stop());
    
    const devices = await navigator.mediaDevices.enumerateDevices();
    const select = $('#cameraSelect');
    const videoDevices = devices.filter(d => d.kind === 'videoinput');
    
    select.innerHTML = '<option value="">Select Camera...</option>';
    videoDevices.forEach((device, i) => {
      const option = document.createElement('option');
      option.value = device.deviceId;
      option.text = device.label || `Camera ${i + 1}`;
      select.appendChild(option);
    });
    
    updateCameraStatus(`Found ${videoDevices.length} cameras`);
  } catch (e) {
    updateCameraStatus('Camera permission needed');
  }
}

function updateCameraStatus(text) {
  $('#cameraStatus').textContent = text;
}

async function startCamera() {
  const selectedCamera = $('#cameraSelect').value;
  const video = $('#cameraPreview');
  
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop());
  }
  
  try {
    let constraints = { video: { width: 320, height: 240 } };
    if (selectedCamera) {
      constraints.video.deviceId = { exact: selectedCamera };
    }
    
    updateCameraStatus('Starting camera...');
    cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = cameraStream;
    
    // Load MediaPipe scripts if not already loaded
    if (!window.FaceMesh) {
      await loadMediaPipeScripts();
    }
    
    // Initialize MediaPipe Face Mesh with error handling
    try {
      faceMesh = new FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
      });
      
      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
      
      faceMesh.onResults(onCameraResults);
      
      // Mark MediaPipe as ready after successful initialization
      mediaPipeReady = true;
      updateCameraStatus('Face detection ready - position head and calibrate');
    } catch (e) {
      updateCameraStatus('Face detection failed to load - camera preview only');
    }
    
    // Wait for video to load
    await new Promise(resolve => {
      video.onloadedmetadata = resolve;
    });
    
    // Use MediaPipe Camera for automatic processing
    camera = new Camera(video, {
      onFrame: async () => {
        if (faceMesh && mediaPipeReady) {
          await faceMesh.send({ image: video });
        }
      },
      width: 320,
      height: 240
    });
    
    camera.start();
    
    const track = cameraStream.getVideoTracks()[0];
    updateCameraStatus(`Active: ${track.label} - Position head and calibrate`);
    
  } catch (error) {
    mediaPipeReady = false;
    updateCameraStatus('Camera error: ' + error.message);
  }
}

async function loadMediaPipeScripts() {
  try {
    const scripts = [
      'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
      'https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js',
      'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',
      'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js'
    ];
    
    for (const src of scripts) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.head.appendChild(script);
      });
    }
  } catch (error) {
    throw new Error('MediaPipe scripts failed to load: ' + error.message);
  }
}

function onCameraResults(results) {
  if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
    faceDetected = true;
    const landmarks = results.multiFaceLandmarks[0];
    
    // Get nose tip (landmark 1)
    const noseTip = landmarks[1];
    const x = noseTip.x * 320;
    const y = noseTip.y * 240;
    
    // Show head position with red dot
    const dot = $('#headDot');
    dot.style.display = 'block';
    dot.style.left = x + 'px';
    dot.style.top = y + 'px';
    
    if (isCalibrated) {
      // Apply offset to camera coordinates
      const adjustedX = x + offsetX;
      const adjustedY = y + offsetY;
      
      // Calculate movement from calibration center
      const deltaX = (adjustedX - calibrationCenter.x) / 160;
      const deltaY = (adjustedY - calibrationCenter.y) / 120;
      
      // Apply to cube rotation with inversions
      cubeRotation.y = 0 - (deltaX * sensitivityX * (invertX ? -1 : 1));
      cubeRotation.x = -15 + (deltaY * sensitivityY * (invertY ? -1 : 1));
      
      const now = Date.now();
      if (now - lastUpdateTime > 16) { // ~60fps throttling
        updateCubeRotation();
        updateBackgroundParallax(x, y);
        lastUpdateTime = now;
      }
    }
  } else {
    faceDetected = false;
    $('#headDot').style.display = 'none';
  }
}

function toggleCamera() {
  const btn = $('#cameraBtn');
  const controls = $('#cameraControls');
  const container = $('#cameraContainer');
  
  cameraEnabled = !cameraEnabled;
  
  if (cameraEnabled) {
    btn.textContent = 'Disable Camera';
    controls.style.display = 'block';
    container.style.display = 'block';
    loadCameras().then(() => {
      if ($('#cameraSelect').options.length > 1) {
        startCamera();
      }
    });
    // Switch to 3D mode for camera control
    if (currentViewMode === 'cubenet') {
      setViewMode('perspective');
    }
  } else {
    btn.textContent = 'Enable Camera';
    controls.style.display = 'none';
    container.style.display = 'none';
    if (camera) {
      camera.stop();
      camera = null;
    }
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      cameraStream = null;
    }
    isCalibrated = false;
    mediaPipeReady = false;
    faceDetected = false;
    updateCameraStatus('Camera disabled');
  }
}

function calibrateCamera() {
  if (!cameraEnabled) {
    updateCameraStatus('Camera not enabled');
    return;
  }
  if (!mediaPipeReady) {
    updateCameraStatus('Face detection not ready - wait a moment');
    return;
  }
  if (!faceDetected) {
    updateCameraStatus('No face detected - position yourself in camera view');
    return;
  }
  
  // Use current head position as calibration center
  calibrationCenter.x = 160; // Center of 320px width
  calibrationCenter.y = 120; // Center of 240px height
  isCalibrated = true;
  saveCameraCalibration();
  updateCameraStatus('Calibrated! Move your head to control the cube');
}

function saveCameraCalibration() {
  const calibrationData = {
    calibrationCenter,
    sensitivityX,
    sensitivityY,
    offsetX,
    offsetY,
    bgSensitivityX,
    bgSensitivityY,
    bgZoom,
    sameSensitivity,
    sameBgSensitivity,
    invertX,
    invertY,
    invertBgX,
    invertBgY,
    isCalibrated
  };
  localStorage.setItem('cameraCalibration', JSON.stringify(calibrationData));
}

function loadCameraCalibration() {
  try {
    const saved = localStorage.getItem('cameraCalibration');
    if (saved) {
      const data = JSON.parse(saved);
      calibrationCenter = data.calibrationCenter || { x: 160, y: 120 };
      sensitivityX = data.sensitivityX || 60;
      sensitivityY = data.sensitivityY || 40;
      offsetX = data.offsetX || 0;
      offsetY = data.offsetY || 0;
      bgSensitivityX = data.bgSensitivityX || 30;
      bgSensitivityY = data.bgSensitivityY || 30;
      bgZoom = data.bgZoom || 150;
      sameSensitivity = data.sameSensitivity || false;
      sameBgSensitivity = data.sameBgSensitivity || false;
      invertX = data.invertX || false;
      invertY = data.invertY || false;
      invertBgX = data.invertBgX || false;
      invertBgY = data.invertBgY || false;
      isCalibrated = data.isCalibrated || false;
      
      // Update UI elements
      $('#sensitivityX').value = sensitivityX;
      $('#sensitivityXValue').textContent = sensitivityX;
      $('#sensitivityY').value = sensitivityY;
      $('#sensitivityYValue').textContent = sensitivityY;
      $('#offsetX').value = offsetX;
      $('#offsetXValue').textContent = offsetX;
      $('#offsetY').value = offsetY;
      $('#offsetYValue').textContent = offsetY;
      $('#bgSensitivityX').value = bgSensitivityX;
      $('#bgSensitivityXValue').textContent = bgSensitivityX;
      $('#bgSensitivityY').value = bgSensitivityY;
      $('#bgSensitivityYValue').textContent = bgSensitivityY;
      $('#sameSensitivity').checked = sameSensitivity;
      $('#sameBgSensitivity').checked = sameBgSensitivity;
      $('#invertX').checked = invertX;
      $('#invertY').checked = invertY;
      $('#invertBgX').checked = invertBgX;
      $('#invertBgY').checked = invertBgY;
    }
  } catch (e) {}
}

function updateBackgroundParallax(x, y) {
  const panel = $('#right-panel');
  const adjustedX = (x + offsetX - calibrationCenter.x) / 160;
  const adjustedY = (y + offsetY - calibrationCenter.y) / 120;
  const bgOffsetX = 50 - (adjustedX * bgSensitivityX * (invertBgX ? -1 : 1));
  const bgOffsetY = 50 - (adjustedY * bgSensitivityY * (invertBgY ? -1 : 1));
  panel.style.backgroundPosition = `${bgOffsetX}% ${bgOffsetY}%`;
  panel.style.backgroundSize = `${bgZoom}%`;
}

// Camera slider event listeners
function initCameraControls() {
  $('#sameSensitivity').addEventListener('change', (e) => {
    sameSensitivity = e.target.checked;
    saveCameraCalibration();
  });
  
  $('#sameBgSensitivity').addEventListener('change', (e) => {
    sameBgSensitivity = e.target.checked;
    saveCameraCalibration();
  });
  
  $('#invertX').addEventListener('change', (e) => {
    invertX = e.target.checked;
    saveCameraCalibration();
  });
  
  $('#invertY').addEventListener('change', (e) => {
    invertY = e.target.checked;
    saveCameraCalibration();
  });
  
  $('#invertBgX').addEventListener('change', (e) => {
    invertBgX = e.target.checked;
    saveCameraCalibration();
  });
  
  $('#invertBgY').addEventListener('change', (e) => {
    invertBgY = e.target.checked;
    saveCameraCalibration();
  });
  
  $('#sensitivityX').addEventListener('input', (e) => {
    sensitivityX = parseInt(e.target.value);
    $('#sensitivityXValue').textContent = sensitivityX;
    if (sameSensitivity) {
      sensitivityY = sensitivityX;
      $('#sensitivityY').value = sensitivityY;
      $('#sensitivityYValue').textContent = sensitivityY;
    }
    saveCameraCalibration();
  });
  
  $('#sensitivityY').addEventListener('input', (e) => {
    sensitivityY = parseInt(e.target.value);
    $('#sensitivityYValue').textContent = sensitivityY;
    if (sameSensitivity) {
      sensitivityX = sensitivityY;
      $('#sensitivityX').value = sensitivityX;
      $('#sensitivityXValue').textContent = sensitivityX;
    }
    saveCameraCalibration();
  });
  
  $('#offsetX').addEventListener('input', (e) => {
    offsetX = parseInt(e.target.value);
    $('#offsetXValue').textContent = offsetX;
    saveCameraCalibration();
  });
  
  $('#offsetY').addEventListener('input', (e) => {
    offsetY = parseInt(e.target.value);
    $('#offsetYValue').textContent = offsetY;
    saveCameraCalibration();
  });
  
  $('#bgSensitivityX').addEventListener('input', (e) => {
    bgSensitivityX = parseInt(e.target.value);
    $('#bgSensitivityXValue').textContent = bgSensitivityX;
    if (sameBgSensitivity) {
      bgSensitivityY = bgSensitivityX;
      $('#bgSensitivityY').value = bgSensitivityY;
      $('#bgSensitivityYValue').textContent = bgSensitivityY;
    }
    saveCameraCalibration();
  });
  
  $('#bgSensitivityY').addEventListener('input', (e) => {
    bgSensitivityY = parseInt(e.target.value);
    $('#bgSensitivityYValue').textContent = bgSensitivityY;
    if (sameBgSensitivity) {
      bgSensitivityX = bgSensitivityY;
      $('#bgSensitivityX').value = bgSensitivityX;
      $('#bgSensitivityXValue').textContent = bgSensitivityX;
    }
    saveCameraCalibration();
  });
  
  $('#cameraSelect').addEventListener('change', () => {
    if (cameraEnabled) {
      startCamera();
    }
  });
}

// History system - Tree-based (reliable)
function uuid() {
  if (crypto && crypto.randomUUID) return crypto.randomUUID();
  return 'id-' + Math.random().toString(36).slice(2,9);
}

class MoveNode {
  constructor(move, parent = null, state = null) {
    this.id = uuid();
    this.move = move;
    this.parent = parent;
    this.children = [];
    this.state = state;
    this.timestamp = new Date().toLocaleTimeString();
  }
}

let historyRoot = null;
let currentNode = null;

function initHistory() {
  const initialState = {
    cubeState: JSON.parse(JSON.stringify(cubeState)),
    stickerRotations: JSON.parse(JSON.stringify(stickerRotations)),
    stickerTextures: JSON.parse(JSON.stringify(stickerTextures))
  };
  historyRoot = new MoveNode('START', null, initialState);
  currentNode = historyRoot;
}
let historyTransform = { x: 0, y: 0, scale: 1 };
let isHistoryPanning = false;
let lastHistoryPanPoint = { x: 0, y: 0 };

function addMoveToHistory(move) {
  const state = {
    cubeState: JSON.parse(JSON.stringify(cubeState)),
    stickerRotations: JSON.parse(JSON.stringify(stickerRotations)),
    stickerTextures: JSON.parse(JSON.stringify(stickerTextures))
  };
  
  const newNode = new MoveNode(move, currentNode, state);
  currentNode.children.push(newNode);
  currentNode = newNode;
  
  updateHistoryDisplay();
}

function getPathToNode(node) {
  const path = [];
  let cur = node;
  while (cur) {
    path.push(cur);
    cur = cur.parent;
  }
  return path.reverse();
}

function findNodeById(root, id) {
  let found = null;
  function dfs(n) {
    if (n.id === id) { found = n; return; }
    for (const c of n.children) {
      dfs(c);
      if (found) return;
    }
  }
  dfs(root);
  return found;
}

const XSTEP = 120, YSTEP = 60, NODE_W = 80, NODE_H = 32;

function layoutTree(root) {
  let branchCounter = 0;
  const positions = {};

  function dfs(node, depth, branchIndex) {
    const x = depth * XSTEP;
    const y = branchIndex * YSTEP;
    positions[node.id] = {x, y, node};
    
    for (let i = 0; i < node.children.length; i++) {
      const c = node.children[i];
      if (i === 0) {
        dfs(c, depth + 1, branchIndex);
      } else {
        branchCounter++;
        dfs(c, depth + 1, branchCounter);
      }
    }
  }

  dfs(root, 0, 0);
  return positions;
}

let historyCanvas = null;
let historyCtx = null;
let historyPositions = {};

// Polyfill for roundRect
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
    return this;
  };
}

function updateHistoryDisplay() {
  const container = $('#historyGraph');
  
  if (!historyCanvas) {
    container.innerHTML = '';
    historyCanvas = document.createElement('canvas');
    historyCanvas.id = 'historyCanvas';
    historyCanvas.style.width = '100%';
    historyCanvas.style.height = '100%';
    historyCanvas.style.cursor = 'default';
    container.appendChild(historyCanvas);
    historyCtx = historyCanvas.getContext('2d');
    
    // Mouse events
    historyCanvas.addEventListener('mousedown', (e) => {
      const rect = historyCanvas.getBoundingClientRect();
      const x = (e.clientX - rect.left - historyTransform.x) / historyTransform.scale;
      const y = (e.clientY - rect.top - historyTransform.y) / historyTransform.scale;
      
      let clicked = false;
      for (const id in historyPositions) {
        const p = historyPositions[id];
        if (x >= p.x && x <= p.x + NODE_W && y >= p.y && y <= p.y + NODE_H) {
          selectHistoryNode(p.node.id);
          clicked = true;
          break;
        }
      }
      
      if (!clicked && e.button === 0) {
        isHistoryPanning = true;
        lastHistoryPanPoint = { x: e.clientX, y: e.clientY };
        historyCanvas.style.cursor = 'grabbing';
        e.preventDefault();
      }
    });
    
    // Touch events
    let historyTouchStart = null;
    let historyInitialDistance = 0;
    let historyInitialScale = 1;
    
    historyCanvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const rect = historyCanvas.getBoundingClientRect();
        const x = (touch.clientX - rect.left - historyTransform.x) / historyTransform.scale;
        const y = (touch.clientY - rect.top - historyTransform.y) / historyTransform.scale;
        
        let clicked = false;
        for (const id in historyPositions) {
          const p = historyPositions[id];
          if (x >= p.x && x <= p.x + NODE_W && y >= p.y && y <= p.y + NODE_H) {
            selectHistoryNode(p.node.id);
            clicked = true;
            break;
          }
        }
        
        if (!clicked) {
          isHistoryPanning = true;
          historyTouchStart = { x: touch.clientX, y: touch.clientY };
          lastHistoryPanPoint = { x: touch.clientX, y: touch.clientY };
        }
      } else if (e.touches.length === 2) {
        isHistoryPanning = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        historyInitialDistance = Math.sqrt(dx * dx + dy * dy);
        historyInitialScale = historyTransform.scale;
      }
    }, { passive: true });
    
    historyCanvas.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1 && isHistoryPanning) {
        const touch = e.touches[0];
        const dx = (touch.clientX - lastHistoryPanPoint.x) * 1.2;
        const dy = (touch.clientY - lastHistoryPanPoint.y) * 1.2;
        historyTransform.x += dx;
        historyTransform.y += dy;
        lastHistoryPanPoint = { x: touch.clientX, y: touch.clientY };
        renderHistoryCanvas();
        e.preventDefault();
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const scale = (distance / historyInitialDistance) * historyInitialScale;
        historyTransform.scale = Math.max(0.1, Math.min(3, scale));
        renderHistoryCanvas();
        e.preventDefault();
      }
    }, { passive: false });
    
    historyCanvas.addEventListener('touchend', () => {
      isHistoryPanning = false;
      historyTouchStart = null;
    }, { passive: true });
    
    historyCanvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const rect = historyCanvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.max(0.1, Math.min(3, historyTransform.scale * scaleFactor));
      
      const scaleChange = newScale / historyTransform.scale;
      historyTransform.x = mouseX - (mouseX - historyTransform.x) * scaleChange;
      historyTransform.y = mouseY - (mouseY - historyTransform.y) * scaleChange;
      historyTransform.scale = newScale;
      
      renderHistoryCanvas();
    });
  }
  
  // Set canvas size
  const rect = container.getBoundingClientRect();
  historyCanvas.width = rect.width;
  historyCanvas.height = rect.height;
  
  historyPositions = layoutTree(historyRoot);
  renderHistoryCanvas();
}

function renderHistoryCanvas() {
  if (!historyCtx) return;
  
  const ctx = historyCtx;
  ctx.clearRect(0, 0, historyCanvas.width, historyCanvas.height);
  ctx.save();
  ctx.translate(historyTransform.x, historyTransform.y);
  ctx.scale(historyTransform.scale, historyTransform.scale);
  
  // Draw edges
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 3;
  for (const id in historyPositions) {
    const p = historyPositions[id];
    for (const child of p.node.children) {
      const cpos = historyPositions[child.id];
      if (!cpos) continue;
      const x1 = p.x + NODE_W, y1 = p.y + NODE_H/2;
      const x2 = cpos.x, y2 = cpos.y + NODE_H/2;
      const midX = (x1 + x2) / 2;
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.bezierCurveTo(midX, y1, midX, y2, x2, y2);
      ctx.stroke();
    }
  }
  
  // Draw nodes
  ctx.font = '12px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  for (const id in historyPositions) {
    const p = historyPositions[id];
    const isCurrent = currentNode.id === p.node.id;
    
    // Draw rect
    ctx.fillStyle = isCurrent ? '#2d5016' : '#1a1a1a';
    ctx.strokeStyle = isCurrent ? '#4caf50' : '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(p.x, p.y, NODE_W, NODE_H, 6);
    ctx.fill();
    ctx.stroke();
    
    // Draw text
    ctx.fillStyle = '#fff';
    ctx.fillText(p.node.move === 'START' ? 'START' : p.node.move, p.x + NODE_W/2, p.y + NODE_H/2);
    
    // Draw badge
    if (p.node.children.length > 1) {
      ctx.fillStyle = '#4caf50';
      ctx.font = '10px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(p.node.children.length, p.x + NODE_W - 8, p.y + 16);
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
    }
  }
  
  ctx.restore();
  
  // Update grid
  const gridContainer = $('#historyRows');
  gridContainer.innerHTML = '';
  
  const path = getPathToNode(currentNode);
  path.forEach((node, index) => {
    const row = document.createElement('div');
    row.className = 'history-row' + (node.id === currentNode.id ? ' current' : '');
    row.onclick = () => selectHistoryNode(node.id);
    
    const branchInfo = node.children.length > 1 ? ` <span style="color:#4caf50;font-weight:bold">(${node.children.length})</span>` : '';
    row.innerHTML = `
      <div class="history-cell">${node.timestamp}</div>
      <div class="history-cell">${node.move}${branchInfo}</div>
      <div class="history-cell">${index}</div>
    `;
    
    gridContainer.appendChild(row);
  });
  
  // Add next nodes if current node has children
  if (currentNode.children.length > 0) {
    const nextRow = document.createElement('div');
    nextRow.className = 'history-row history-next';
    nextRow.style.background = '#f0f8ff';
    nextRow.style.borderLeft = '3px solid #4caf50';
    
    const timeCell = document.createElement('div');
    timeCell.className = 'history-cell';
    timeCell.textContent = '→';
    
    const moveCell = document.createElement('div');
    moveCell.className = 'history-cell';
    moveCell.style.display = 'flex';
    moveCell.style.gap = '4px';
    moveCell.style.flexWrap = 'wrap';
    moveCell.style.alignItems = 'center';
    
    currentNode.children.forEach((child, idx) => {
      const pill = document.createElement('span');
      pill.textContent = child.move;
      pill.style.cssText = 'background:#4caf50;color:white;padding:2px 8px;border-radius:12px;cursor:pointer;font-size:11px;font-weight:bold;';
      pill.onclick = (e) => {
        e.stopPropagation();
        selectHistoryNode(child.id);
      };
      pill.onmouseenter = () => pill.style.background = '#45a049';
      pill.onmouseleave = () => pill.style.background = '#4caf50';
      moveCell.appendChild(pill);
    });
    
    const indexCell = document.createElement('div');
    indexCell.className = 'history-cell';
    indexCell.textContent = '+';
    
    nextRow.appendChild(timeCell);
    nextRow.appendChild(moveCell);
    nextRow.appendChild(indexCell);
    gridContainer.appendChild(nextRow);
  }
}

function selectHistoryNode(nodeId) {
  const node = findNodeById(historyRoot, nodeId);
  if (!node) return;
  if (!node.state) return;
  
  currentNode = node;
  const state = node.state;
  cubeState = JSON.parse(JSON.stringify(state.cubeState));
  stickerRotations = JSON.parse(JSON.stringify(state.stickerRotations));
  stickerTextures = JSON.parse(JSON.stringify(state.stickerTextures));
  
  cubeCore.cubeState = cubeState;
  cubeCore.stickerRotations = stickerRotations;
  cubeCore.stickerTextures = stickerTextures;
  
  updateDOM();
  updateHistoryDisplay();
}

function clearHistory() {
  initHistory();
  historyTransform = { x: 0, y: 0, scale: 1 };
  updateHistoryDisplay();
  showToast('History cleared');
}

// Global mouse events for history panning
document.addEventListener('mousemove', (e) => {
  if (isHistoryPanning) {
    const dx = (e.clientX - lastHistoryPanPoint.x) * 1.2;
    const dy = (e.clientY - lastHistoryPanPoint.y) * 1.2;
    historyTransform.x += dx;
    historyTransform.y += dy;
    lastHistoryPanPoint = { x: e.clientX, y: e.clientY };
    renderHistoryCanvas();
  }
});

document.addEventListener('mouseup', () => {
  if (isHistoryPanning) {
    isHistoryPanning = false;
    if (historyCanvas) historyCanvas.style.cursor = 'default';
  }
});

// Scramble function
function scrambleCube() {
  solveCube();
  const algUtils = new AlgUtils();
  algUtils.generateScrambleAlg(30);
  const scrambleAlg = algUtils.alg;
  
  // Put scramble in textarea
  $('#alg').value = scrambleAlg;
  
  // Execute the scramble - batch all moves for performance
  const moves = scrambleAlg.trim().split(/\s+/).filter(move => move.length > 0);
  moves.forEach((move) => cubeCore.applyMove(move));
  syncState();
  if (historyEnabled) addMoveToHistory(`SCRAMBLE (${moves.length} moves)`);
}

// Bluetooth cube integration
let bluetoothCube = null;

function toggleBluetooth() {
  const btn = $('#bluetoothBtn');
  const status = $('#bluetoothStatus');
  
  if (!bluetoothCube || !bluetoothCube.isConnected()) {
    btn.textContent = 'Connecting...';
    btn.disabled = true;
    
    bluetoothCube = new BluetoothCube();
    
    bluetoothCube.onMove((notation) => {
      applyMove(notation);
    });
    
    bluetoothCube.onConnect(() => {
      btn.textContent = 'Disconnect';
      btn.disabled = false;
      status.textContent = 'Connected to GiiKER cube';
      status.style.color = '#4caf50';
    });
    
    bluetoothCube.onDisconnect(() => {
      btn.textContent = 'Connect GiiKER Cube';
      btn.disabled = false;
      status.textContent = 'Disconnected';
      status.style.color = '#666';
    });
    
    bluetoothCube.onError((error) => {
      btn.textContent = 'Connect GiiKER Cube';
      btn.disabled = false;
      status.textContent = 'Connection failed';
      status.style.color = '#f44336';
      console.error('Bluetooth error:', error);
    });
    
    bluetoothCube.connect();
  } else {
    bluetoothCube.disconnect();
  }
}

// Inicializar

historyEnabled = ElHistoryEnabled?.checked || false;
initCube();
loadAccordionStates();
loadSidebarState();
loadCameraCalibration();
initCameraControls();

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



// Check for config in URL hash first
if (window.location.hash) {
  try {
    const base64 = window.location.hash.slice(1);
    const json = atob(base64);
    const config = JSON.parse(json);
    $('#customConfig').value = json;
    $('#exampleSelect').selectedIndex = 0;
    loadCustomConfig();
    loadViewState();
  } catch (e) {
    console.error('Failed to load config from URL:', e);
    loadPochmannDefault();
  }
}
// Load saved texture or default
else {
  try {
    const savedTexture = localStorage.getItem('selectedTexture');
    if (savedTexture) {
      setTimeout(() => loadSelectedTexture(), 100);
    } else {
      loadPochmannDefault();
    }
  } catch (e) {
    loadPochmannDefault();
  }
}

// Load saved view mode or default to perspective
window.addEventListener('load', () => {
  try {
    const savedViewMode = localStorage.getItem('viewMode') || 'perspective';
    setViewMode(savedViewMode);
  } catch (e) {
    setViewMode('perspective');
  }
});

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
  console.log('ok')
};
window.unsetCrispMode = () => {
  document.body.classList.remove('crisp-mode');
  console.log('ok')
};
window.toggleCrispMode = () => {
  document.body.classList.toggle('crisp-mode');
  const enabled = document.body.classList.contains('crisp-mode');
  const btn = $('#crispBtn');
  btn.textContent = `Crisp Mode: ${enabled ? 'ON' : 'OFF'}`;
  btn.style.background = enabled ? '#4caf50' : '';
  btn.style.color = enabled ? 'white' : '';
  localStorage.setItem('crispMode', enabled);
};

function toggleRenderThrottle() {
  renderThrottleEnabled = !renderThrottleEnabled;
  const btn = $('#throttleBtn');
  btn.textContent = `Render Throttle: ${renderThrottleEnabled ? 'ON' : 'OFF'}`;
  btn.style.background = renderThrottleEnabled ? '#4caf50' : '';
  btn.style.color = renderThrottleEnabled ? 'white' : '';
  localStorage.setItem('renderThrottle', renderThrottleEnabled);
  console.log('Render throttle:', renderThrottleEnabled ? 'ENABLED (60 FPS)' : 'DISABLED (unlimited)');
}

function selectBackground(filename) {
  const panel = $('#right-panel');
  if (filename) {
    panel.style.backgroundImage = `url('backgrounds/${filename}')`;
    localStorage.setItem('selectedBackground', filename);
  } else {
    panel.style.backgroundImage = '';
    localStorage.removeItem('selectedBackground');
  }
  
  document.querySelectorAll('.bg-thumb').forEach(t => t.style.border = '2px solid transparent');
  document.querySelector(`[data-bg="${filename}"]`).style.border = '2px solid #4caf50';
}

function loadSelectedBackground() {
  try {
    const saved = localStorage.getItem('selectedBackground');
    if (saved) {
      selectBackground(saved);
    }
  } catch (e) {}
}

// Load background on init
loadSelectedBackground();