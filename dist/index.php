<!DOCTYPE html>
<html lang="pt-BR">
  <head>
  <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <title>Picture Cube -- Beta</title>
      <link rel="stylesheet" href="https://code.jquery.com/ui/1.13.2/themes/base/jquery-ui.min.css">
      <link rel="stylesheet" href="css/style.css">
      <style>
        #cube-3d-window {
          position: absolute;
          width: 400px;
          height: 400px;
          background: #c0c0c0;
          border: 2px solid;
          border-color: #dfdfdf #808080 #808080 #dfdfdf;
          box-shadow: 2px 2px 0 rgba(0,0,0,0.2);
          z-index: 1002;
          display: none;
          will-change: transform;
        }
        body.editor-active #cube-3d-window { display: block; }
        .ui-resizable-handle { background: transparent !important; border: none !important; }
        .ui-resizable-se, .ui-resizable-sw, .ui-resizable-ne, .ui-resizable-nw { width: 10px !important; height: 10px !important; }
        .ui-resizable-n, .ui-resizable-s { height: 5px !important; }
        .ui-resizable-e, .ui-resizable-w { width: 5px !important; }
        #cube-3d-titlebar {
          background: linear-gradient(to right, #000080, #1084d0);
          color: white;
          padding: 3px 5px;
          font-size: 12px;
          font-weight: bold;
          cursor: move;
          user-select: none;
          display: flex;
          align-items: center;
          gap: 5px;
          touch-action: none;
        }
        #cube-3d-titlebar span { flex: 1; }
        #cube-3d-content {
          position: relative;
          width: 100%;
          height: calc(100% - 24px);
          background: #000;
          overflow: hidden;
          pointer-events: auto;
        }
        #cube-3d-window.dragging #cube-3d-content,
        #cube-3d-window.resizing #cube-3d-content {
          pointer-events: none;
        }
        body.editor-active #cube-3d-wrapper {
          position: absolute !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
        }
      </style>
  </head>

  <body>

    <button id="hamburger" onclick="toggleSidebar()" title="Toggle sidebar">☰</button>
    <button id="togglePanel" onclick="toggleLeftPanel()" title="Toggle panel">☰</button>
    <button id="fullscreenBtn" onclick="toggleFullscreen()" title="Fullscreen">⛶</button>
    <div id="container">
      <div id="controls">
        <div class="spacer"></div>
        <button class="texture-editor-btn" onclick="toggleEditor()">
          🎨 Textures Editor (experimental)
        </button>
        <div class="accordion open">
          <button class="accordion-header" onclick="toggleAccordion(this)">
            Moveset
            <svg class="accordion-arrow" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
            </svg>
          </button>
          <div class="accordion-content">
            <div class="move-grid" id="moveGrid"></div>
            <script>
              (function(){
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
              })();
            </script>
          </div>
        </div>

        <div class="accordion">
          <button class="accordion-header" onclick="toggleAccordion(this)">
            Algorithm
            <svg class="accordion-arrow" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
            </svg>
          </button>
          <div class="accordion-content">
            <textarea
              id="alg"
              placeholder="Enter algorithm (ex: R U R&#39; U&#39;)"
              onkeydown="if(event.ctrlKey && event.key==='Enter') applyAlgorithm()"
            ></textarea>
            <button onclick="applyAlgorithm()">Execute</button>
            <button onclick="scrambleCube()">Scramble Cube</button>
            <small style="color: #666; font-style: italic"
              >Tip: Press Ctrl+Enter to execute</small
            >
          </div>
        </div>

        <div class="accordion">
          <button class="accordion-header" onclick="toggleAccordion(this)">
            Bluetooth Cube
            <svg class="accordion-arrow" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
            </svg>
          </button>
          <div class="accordion-content">
            <button id="bluetoothBtn" onclick="toggleBluetooth()">Connect GiiKER Cube</button>
            <div id="bluetoothStatus" style="margin-top: 10px; font-size: 12px; color: #666;"></div>
          </div>
        </div>

        <div class="accordion">
          <button class="accordion-header" onclick="toggleAccordion(this)">
            Camera Control
            <svg class="accordion-arrow" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
            </svg>
          </button>
          <div class="accordion-content">
            <button id="cameraBtn" onclick="toggleCamera()">Enable Camera</button>
            <div id="cameraContainer" style="position: relative; display: none;">
              <video id="cameraPreview" autoplay muted style="width: 100%; max-width: 280px; border: 2px solid #555; border-radius: 8px;"></video>
              <div id="headDot" style="position: absolute; width: 10px; height: 10px; background: red; border-radius: 50%; display: none;"></div>
            </div>
            <div id="cameraControls" style="display: none; margin-top: 10px;">
              <select id="cameraSelect" style="width: 100%; margin: 5px 0; padding: 5px;">
                <option value="">Select Camera...</option>
              </select>
              <button onclick="calibrateCamera()">Calibrate</button>
              <div style="margin: 10px 0;">
                <label><input type="checkbox" id="sameSensitivity"> Same Value</label>
                <label><input type="checkbox" id="invertX"> Invert X</label>
                <label><input type="checkbox" id="invertY"> Invert Y</label>
              </div>
              <div style="margin: 10px 0;">
                <label>Sensitivity X: <span id="sensitivityXValue">60</span></label>
                <input type="range" id="sensitivityX" min="10" max="120" value="60" style="width: 100%;">
              </div>
              <div style="margin: 10px 0;">
                <label>Sensitivity Y: <span id="sensitivityYValue">40</span></label>
                <input type="range" id="sensitivityY" min="10" max="120" value="40" style="width: 100%;">
              </div>
              <div style="margin: 10px 0;">
                <label>Offset X: <span id="offsetXValue">0</span></label>
                <input type="range" id="offsetX" min="-160" max="160" value="0" style="width: 100%;">
              </div>
              <div style="margin: 10px 0;">
                <label>Offset Y: <span id="offsetYValue">0</span></label>
                <input type="range" id="offsetY" min="-120" max="120" value="0" style="width: 100%;">
              </div>
              <div style="margin: 10px 0;">
                <label><input type="checkbox" id="sameBgSensitivity"> Same Value BG</label>
                <label><input type="checkbox" id="invertBgX"> Invert BG X</label>
                <label><input type="checkbox" id="invertBgY"> Invert BG Y</label>
              </div>
              <div style="margin: 10px 0;">
                <label>BG Sensitivity X: <span id="bgSensitivityXValue">30</span></label>
                <input type="range" id="bgSensitivityX" min="0" max="100" value="30" style="width: 100%;">
              </div>
              <div style="margin: 10px 0;">
                <label>BG Sensitivity Y: <span id="bgSensitivityYValue">30</span></label>
                <input type="range" id="bgSensitivityY" min="0" max="100" value="30" style="width: 100%;">
              </div>
            </div>
            <div id="cameraStatus" style="margin-top: 10px; font-size: 12px; color: #666;">Camera disabled</div>
          </div>
        </div>

        <div class="accordion">
          <button class="accordion-header" onclick="toggleAccordion(this)">
            State
            <svg class="accordion-arrow" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
            </svg>
          </button>
          <div class="accordion-content">
            <button onclick="solveCube()">Reset</button>
            <button onclick="openStateModal()">View State</button>
          </div>
        </div>

        <div class="accordion">
          <button class="accordion-header" onclick="toggleAccordion(this)">
            History
            <svg class="accordion-arrow" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
            </svg>
          </button>
          <div class="accordion-content">
            <div class="history-controls">
              <label><input type="checkbox" id="historyEnabled" onchange="toggleHistoryTracking()"> Track History</label>
              <button onclick="clearHistory()">Clear</button>
            </div>
            <div class="history-graph" id="historyGraph"></div>
            <div class="history-grid">
              <div class="history-header">
                <div class="history-cell">Time</div>
                <div class="history-cell">Move</div>
                <div class="history-cell">#</div>
              </div>
              <div id="historyRows"></div>
            </div>
          </div>
        </div>

        <div class="accordion">
          <button class="accordion-header" onclick="toggleAccordion(this)">
            Example Textures
            <svg class="accordion-arrow" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
            </svg>
          </button>
          <div class="accordion-content">
            <select id="exampleSelect" onchange="loadExample()">
              <option value="">Select an example...</option>
            </select>
          </div>
        </div>

        <div class="accordion">
          <button class="accordion-header" onclick="toggleAccordion(this)">
            Custom Textures
            <svg class="accordion-arrow" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
            </svg>
          </button>
          <div class="accordion-content">
            <a
              href="#"
              onclick="openInstructionsModal()"
              style="font-size: 14px; margin-bottom: 10px; display: inline-block"
              >[Instructions]</a
            >
            <textarea
              id="customConfig"
              placeholder='{"textures": {"red": "#c41e3a", "star": {"background": "url(\"star.svg\")", "backgroundSize": "80%"}}, "cube": {"U": "red", "U1": ["red", "star"]}}'
            ></textarea>
            <button onclick="loadCustomConfig()">Apply Textures</button>
          </div>
        </div>

        <div class="accordion">
          <button class="accordion-header" onclick="toggleAccordion(this)">
            Background
            <svg class="accordion-arrow" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
            </svg>
          </button>
          <div class="accordion-content" style="margin: 0;">
            <div style="margin: 10px 0;">
              <label>BG Width: <span id="bgWidthValue">100</span>%</label>
              <input type="range" id="bgWidth" min="50" max="200" value="100" style="width: 100%;">
            </div>
            <div style="margin: 10px 0;">
              <label>BG Height: <span id="bgHeightValue">100</span>%</label>
              <input type="range" id="bgHeight" min="50" max="200" value="100" style="width: 100%;">
            </div>
            <button onclick="resetBackgroundSize()">Reset Size</button>
            <div id="backgroundGallery" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; max-height: 50vh; overflow-y: auto; overflow-x: hidden; margin: 10px 0 0 0;">
              <div class='bg-thumb none' data-bg='' onclick='selectBackground("")'></div>
            </div>
          </div>
        </div>

        <div class="accordion">
          <button class="accordion-header" onclick="toggleAccordion(this)">
            Visualization
            <svg class="accordion-arrow" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
            </svg>
          </button>
          <div class="accordion-content">
            <button id="cubenetBtn" onclick="setViewMode('cubenet')" disabled>
              Cube Net
            </button>
            <button id="orthographicBtn" onclick="setViewMode('orthographic')">
              3D Orthographic
            </button>
            <button id="perspectiveBtn" onclick="setViewMode('perspective')">
              3D Perspective
            </button><br /><br />
            <button id="crispBtn" onclick="window.toggleCrispMode()">
              Crisp Mode: OFF
            </button><br /><br />
            <button id="throttleBtn" onclick="toggleRenderThrottle()">
              Render Throttle: OFF
            </button>
            <em style="display: block; margin-top: 5px; font-size: 11px; color: #666;">
              Limits rendering to 60 FPS for smoother performance during fast solves (bluetooth cube)
            </em>
          </div>
        </div>

          <div class="accordion">
          <button class="accordion-header" onclick="toggleAccordion(this)">
            Accessibility
            <svg class="accordion-arrow" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
            </svg>
          </button>
          <div class="accordion-content">
            <div style="margin: 10px 0;">
              <label>UI Scale: <span id="uiScaleValue">100</span>%</label>
              <input type="range" id="uiScale" min="50" max="200" value="100" style="width: 100%;">
            </div>
            <div style="margin: 10px 0;">
              <label>Text Scale: <span id="textScaleValue">100</span>%</label>
              <input type="range" id="textScale" min="50" max="200" value="100" style="width: 100%;">
            </div>
            <div style="margin: 10px 0;">
              <label>Panel Width: <span id="panelWidthValue">333</span>px</label>
              <input type="range" id="panelWidth" min="200" max="600" value="333" style="width: 100%;">
            </div>
            <button onclick="resetAccessibility()">Reset</button>
          </div>
        </div>
      </div>

      <div id="right-panel">
        <iframe id="editor-iframe" src="editor/"></iframe>
        <div class="loading-spinner" id="loadingSpinner"></div>
        <div id="cube-net">
          <div class="face-2d face-U" data-face="U"></div>
          <div class="face-2d face-L" data-face="L"></div>
          <div class="face-2d face-F" data-face="F"></div>
          <div class="face-2d face-R" data-face="R"></div>
          <div class="face-2d face-B" data-face="B"></div>
          <div class="face-2d face-D" data-face="D"></div>
        </div>

        <div id="cube-3d-wrapper">
          <div id="cube-3d">
            <div class="face-3d face-U" data-face="U"></div>
            <div class="face-3d face-D" data-face="D"></div>
            <div class="face-3d face-F" data-face="F"></div>
            <div class="face-3d face-B" data-face="B"></div>
            <div class="face-3d face-L" data-face="L"></div>
            <div class="face-3d face-R" data-face="R"></div>
          </div>
        </div>
        
        <div id="cube-3d-window">
          <div id="cube-3d-titlebar">
            <span>🎲 3D Preview</span>
          </div>
          <div id="cube-3d-content"></div>
        </div>
      </div>
    </div>

    <!-- Instructions Modal -->
    <div id="instructionsModal" class="modal">
      <div class="modal-content">
        <span class="close" onclick="closeInstructionsModal()">&times;</span>
        <div id="instructionsContent">Loading...</div>
      </div>
    </div>

    <!-- State Modal -->
    <div id="stateModal" class="modal">
      <div class="modal-content">
        <span class="close" onclick="closeStateModal()">&times;</span>
        <h3>Cube Analysis</h3>
        <div class="tab-container">
          <div class="tab-buttons">
            <button class="tab-button active" onclick="switchTab('state')">State</button>
            <button class="tab-button" onclick="switchTab('rotations')">Rotations</button>
          </div>
          <div id="stateTab" class="tab-content active"></div>
          <div id="rotationsTab" class="tab-content"></div>
        </div>
      </div>
    </div>

    <div id="toast" class="toast"></div>


    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://code.jquery.com/ui/1.13.2/jquery-ui.min.js"></script>
    <script src="js/marked.min.js"></script>
    <script src="js/bluetooth.js"></script>
    <script src="js/cube-core.js"></script>
    <script src="js/cube-view.js"></script>
    <script src="js/cubenet-renderer.js"></script>
    <script src="js/perspective-renderer.js"></script>
    <script src="js/isometric-renderer.js"></script>
    <script src="js/scramble.js"></script>
    <script src="js/texture-instructions.js"></script>
    <script src="js/backgrounds.js"></script>
    <script src="js/texture-manager.js"></script>
    <script src="js/app.js"></script>
    <script src="js/window-manager.js"></script>
  </body>
</html>
