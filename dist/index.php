<!DOCTYPE html>
<html lang="pt-BR">
  <head>
  <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
    <title>Picture Cube -- Beta</title>
    <style>
      body {
        margin: 0;
        font-family: Arial, sans-serif;
        touch-action: none;
        overflow-x: hidden;
      }

      #container {
        display: flex;
        height: var(--real-vh, 100vh);
        position: relative;
        overflow-x: hidden;
      }

      .spacer {
        display: none;
      }

      #hamburger {
        display: none;
        position: fixed;
        top: 10px;
        left: 10px;
        z-index: 1001;
        background: #333;
        color: white;
        border: none;
        padding: 10px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 18px;
      }

      #controls {
        width: 300px;
        padding: 10px;
        background: #f0f0f0;
        overflow-y: auto;
        transition: transform 0.3s ease;
        position: relative;
        z-index: 1000;
      }

      @media (max-width: 768px) {
        #hamburger {
          display: block;
        }
        
          .spacer {
            display: block;
            height: 55px;
          }
        
        #container {
          flex-direction: column;
        }
        
        #controls {
          width: 100%;
          height: calc(var(--real-vh, 100vh) * 0.5);
          transform: translateY(-100%);
          position: absolute;
          top: 0;
          left: 0;
          z-index: 0;
        }
        
        #controls.open {
          transform: translateY(0);
        }
        
        #right-panel {
          height: var(--real-vh, 100vh);
          transition: margin-top 0.3s ease;
        }
        
        #container.controls-open #right-panel {
          margin-top: calc(var(--real-vh, 100vh) * 0.5);
          height: calc(var(--real-vh, 100vh) * 0.5);
        }
      }
      
      @media (max-width: 480px) {
        #controls {
          padding: 5px;
        }
        
        .move-grid {
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
        }
        
        button {
          padding: 4px 2px;
          font-size: 9px;
          margin: 1px;
          min-width: 0;
          overflow: hidden;
        }
        
        :root {
          --cube-size: 200px;
          --font-size-3d: 12px;
        }
      }

      :root {
        --sticker-size: 30px;
        --cube-size: 300px;
        --font-size-3d: 16px;
      }

      #right-panel {
        flex: 1;
        background: rgb(81, 105, 99);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        user-select: none;
        overflow: hidden;
        cursor: grab;
      }

      #right-panel:active {
        cursor: grabbing;
      }

      /* 2D Net View */
      #cube-net {
        display: grid;
        grid-template-columns: repeat(4, calc(var(--sticker-size) * 3));
        grid-template-rows: repeat(3, calc(var(--sticker-size) * 3));
        gap: 4px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }

      .face-2d {
        display: grid;
        grid-template-columns: repeat(3, var(--sticker-size));
        grid-template-rows: repeat(3, var(--sticker-size));
        gap: 2px;
      }

      .sticker {
        width: var(--sticker-size);
        height: var(--sticker-size);
        border: 1px solid #000;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
      }

      .face-U {
        grid-column: 2;
        grid-row: 1;
      }

      .face-L {
        grid-column: 1;
        grid-row: 2;
      }

      .face-F {
        grid-column: 2;
        grid-row: 2;
      }

      .face-R {
        grid-column: 3;
        grid-row: 2;
      }

      .face-B {
        grid-column: 4;
        grid-row: 2;
      }

      .face-D {
        grid-column: 2;
        grid-row: 3;
      }

      /* 3D View */
      #cube-3d-wrapper {
        perspective: none;
        height: 100%;
        width: 100%;
        overflow: hidden;
        display: none;
      }

      #cube-3d-wrapper.perspective {
        perspective: 1000px;
      }

      #cube-3d {
        position: relative;
        top: 50%;
        left: 50%;
        transform-style: preserve-3d;
        width: var(--cube-size);
        height: var(--cube-size);
        pointer-events: none;
      }

      .face-3d {
        position: absolute;
        width: 100%;
        height: 100%;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(3, 1fr);
        gap: 2px;
        background: #000;
        padding: 2px;
      }

      .sticker-3d {
        border: 1px solid #000;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--font-size-3d);
        font-weight: bold;
      }

      .is-3d #cube-3d .face-U {
        transform: rotateX(90deg) translateZ(calc(var(--cube-size) / 2));
      }

      .is-3d #cube-3d .face-D {
        transform: rotateX(-90deg) translateZ(calc(var(--cube-size) / 2));
      }

      .is-3d #cube-3d .face-F {
        transform: translateZ(calc(var(--cube-size) / 2));
      }

      .is-3d #cube-3d .face-B {
        transform: rotateY(180deg) translateZ(calc(var(--cube-size) / 2));
      }

      .is-3d #cube-3d .face-L {
        transform: rotateY(-90deg) translateZ(calc(var(--cube-size) / 2));
      }

      .is-3d #cube-3d .face-R {
        transform: rotateY(90deg) translateZ(calc(var(--cube-size) / 2));
      }

      button {
        margin: 2px;
        padding: 4px 8px;
        font-size: 12px;
      }

      .move-grid {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        gap: 2px;
        margin: 5px 0;
        width: 100%;
        box-sizing: border-box;
      }

      textarea {
        width: 100%;
        max-width: 100%;
        height: 100px;
        margin: 10px 0;
        box-sizing: border-box;
        resize: vertical;
      }

      #customConfig {
        background: #1e1e1e;
        color: #d4d4d4;
        tab-size: 2;
        font-family: 'Courier New', monospace;
      }
      /* Modal styles */
      .modal {
        display: none;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
      }

      .modal-content {
        background-color: #fefefe;
        margin: 5% auto;
        padding: 20px;
        border-radius: 8px;
        width: 80%;
        max-width: 800px;
        max-height: 80vh;
        overflow-y: auto;
      }

      .close {
        color: #aaa;
        float: right;
        font-size: 28px;
        font-weight: bold;
        cursor: pointer;
      }

      .close:hover {
        color: black;
      }

      /* Accordion styles */
      .accordion {
        margin-bottom: 10px;
      }

      .accordion-header {
        background: #e0e0e0;
        border: none;
        padding: 10px;
        width: calc(100% - 10px);
        text-align: left;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: bold;
        border-radius: 4px;
        margin: 0;
        box-sizing: border-box;
      }

      .accordion-header:hover {
        background: #d0d0d0;
      }

      .accordion-arrow {
        width: 12px;
        height: 12px;
        transition: transform 0.2s ease;
      }

      .accordion-content {
        padding: 15px 10px;
        display: none;
      }

      .accordion.open .accordion-content {
        display: block;
      }

      .accordion.open .accordion-arrow {
        transform: rotate(90deg);
      }

      .loading-spinner {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #333;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        z-index: 10;
        display: none;
      }

      @keyframes spin {
        0% { transform: translate(-50%, -50%) rotate(0deg); }
        100% { transform: translate(-50%, -50%) rotate(360deg); }
      }

      .tab-buttons {
        display: flex;
        border-bottom: 1px solid #ddd;
        margin-bottom: 15px;
      }

      .tab-button {
        background: none;
        border: none;
        padding: 10px 20px;
        cursor: pointer;
        border-bottom: 2px solid transparent;
      }

      .tab-button.active {
        border-bottom-color: #007cba;
        color: #007cba;
      }

      .tab-content {
        display: none;
      }

      .tab-content.active {
        display: block;
      }

      .texture-editor-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 12px 20px;
        font-size: 14px;
        font-weight: bold;
        border-radius: 6px;
        cursor: pointer;
        width: calc(100% - 10px);
        margin: 10px 0;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        transition: transform 0.2s, box-shadow 0.2s;
      }

      .texture-editor-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 12px rgba(0,0,0,0.15);
      }

      .texture-editor-btn:active {
        transform: translateY(0);
      }

      .toast {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4caf50;
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        z-index: 1001;
        opacity: 0;
        transition: opacity 0.3s;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      }

      .toast.show {
        opacity: 1;
      }
    </style>
    <script>
<?php
if (file_exists('marked.min.js')) {
    echo file_get_contents('marked.min.js');
}
?>
    </script>
    <script>
      function setRealViewportHeight() {
        const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
        document.documentElement.style.setProperty('--real-vh', `${vh}px`);
      }
      
      window.addEventListener('resize', setRealViewportHeight);
      window.addEventListener('orientationchange', setRealViewportHeight);
      setRealViewportHeight();
      
      const defaultTexture = <?php 
        function stripJsonComments($json) {
          $result = '';
          $inString = false;
          $inComment = false;
          $inBlockComment = false;
          $len = strlen($json);
          for ($i = 0; $i < $len; $i++) {
            $char = $json[$i];
            $next = ($i + 1 < $len) ? $json[$i + 1] : '';
            if ($inBlockComment) {
              if ($char === '*' && $next === '/') {
                $inBlockComment = false;
                $i++;
              }
              continue;
            }
            if ($inComment) {
              if ($char === "\n") {
                $inComment = false;
                $result .= $char;
              }
              continue;
            }
            if ($char === '"' && ($i === 0 || $json[$i - 1] !== '\\')) {
              $inString = !$inString;
              $result .= $char;
              continue;
            }
            if (!$inString) {
              if ($char === '/' && $next === '/') {
                $inComment = true;
                $i++;
                continue;
              }
              if ($char === '/' && $next === '*') {
                $inBlockComment = true;
                $i++;
                continue;
              }
            }
            $result .= $char;
          }
          return $result;
        }
        $json = file_get_contents('examples/05-pochman_supercube.json');
        $json = stripJsonComments($json);
        echo json_encode(json_decode($json, true)); 
      ?>;
    </script>
  </head>

  <body>

    <button id="hamburger" onclick="toggleSidebar()" title="Toggle sidebar">☰</button>
    <div id="container">
      <div id="controls">
        <div class="spacer"></div>
        <a href="editor/" target="_blank">
          <button class="texture-editor-btn">
            🎨 Textures Editor (experimental)
          </button>
        </a>
        <div class="accordion open">
          <button class="accordion-header" onclick="toggleAccordion(this)">
            Moveset
            <svg class="accordion-arrow" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
            </svg>
          </button>
          <div class="accordion-content">
            <div class="move-grid">
              <!-- Face Moves -->
              <button onclick="moveU()">U</button>
              <button onclick="prime(moveU)()">U'</button>
              <button onclick="double(moveU)()">U2</button>
              <button onclick="moveD()">D</button>
              <button onclick="prime(moveD)()">D'</button>
              <button onclick="double(moveD)()">D2</button>
              <button onclick="moveR()">R</button>
              <button onclick="prime(moveR)()">R'</button>
              <button onclick="double(moveR)()">R2</button>
              <button onclick="moveL()">L</button>
              <button onclick="prime(moveL)()">L'</button>
              <button onclick="double(moveL)()">L2</button>
              <button onclick="moveF()">F</button>
              <button onclick="prime(moveF)()">F'</button>
              <button onclick="double(moveF)()">F2</button>
              <button onclick="moveB()">B</button>
              <button onclick="prime(moveB)()">B'</button>
              <button onclick="double(moveB)()">B2</button>
              <!-- Slice Moves -->
              <button onclick="moveM()">M</button>
              <button onclick="moveMPrime()">M'</button>
              <button onclick="moveM2()">M2</button>
              <button onclick="moveE()">E</button>
              <button onclick="moveEPrime()">E'</button>
              <button onclick="moveE2()">E2</button>
              <button onclick="moveS()">S</button>
              <button onclick="moveSPrime()">S'</button>
              <button onclick="moveS2()">S2</button>
              <!-- Rotations -->
              <button onclick="rotationX()">X</button>
              <button onclick="prime(rotationX)()">X'</button>
              <button onclick="double(rotationX)()">X2</button>
              <button onclick="rotationY()">Y</button>
              <button onclick="prime(rotationY)()">Y'</button>
              <button onclick="double(rotationY)()">Y2</button>
              <button onclick="rotationZ()">Z</button>
              <button onclick="prime(rotationZ)()">Z'</button>
              <button onclick="double(rotationZ)()">Z2</button>
              <!-- Wide Moves -->
              <button onclick="moveRw()">Rw</button>
              <button onclick="prime(moveRw)()">Rw'</button>
              <button onclick="double(moveRw)()">Rw2</button>
              <button onclick="moveLw()">Lw</button>
              <button onclick="prime(moveLw)()">Lw'</button>
              <button onclick="double(moveLw)()">Lw2</button>
              <button onclick="moveUw()">Uw</button>
              <button onclick="prime(moveUw)()">Uw'</button>
              <button onclick="double(moveUw)()">Uw2</button>
              <button onclick="moveDw()">Dw</button>
              <button onclick="prime(moveDw)()">Dw'</button>
              <button onclick="double(moveDw)()">Dw2</button>
              <button onclick="moveFw()">Fw</button>
              <button onclick="prime(moveFw)()">Fw'</button>
              <button onclick="double(moveFw)()">Fw2</button>
              <button onclick="moveBw()">Bw</button>
              <button onclick="prime(moveBw)()">Bw'</button>
              <button onclick="double(moveBw)()">Bw2</button>
            </div>
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
            <small style="color: #666; font-style: italic"
              >Tip: Press Ctrl+Enter to execute</small
            >
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
            Example Textures
            <svg class="accordion-arrow" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
            </svg>
          </button>
          <div class="accordion-content">
            <select id="exampleSelect" onchange="loadExample()">
              <option value="">Select an example...</option>
              <?php
              $examplesDir = 'examples/';
              $examples = [];
              if (is_dir($examplesDir)) {
                $files = scandir($examplesDir);
                foreach ($files as $file) {
                  if (pathinfo($file, PATHINFO_EXTENSION) === 'json') {
                    $name = pathinfo($file, PATHINFO_FILENAME);
                    $json = file_get_contents($examplesDir . $file);
                    $json = stripJsonComments($json);
                    $content = json_decode($json, true);
                    $examples[$file] = $content;
                    $selected = ($file === '05-pochman_supercube.json') ? ' selected' : '';
                    echo "<option value='$file'$selected>$name</option>";
                  }
                }
              }
              ?>
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
            </button>
          </div>
        </div>
      </div>

      <div id="right-panel">
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
      </div>
    </div>

    <!-- Instructions Modal -->
    <div id="instructionsModal" class="modal">
      <div class="modal-content">
        <span class="close" onclick="closeInstructionsModal()">&times;</span>
        <div id="instructionsContent">Loading...</div>
        <script>
          <?php
          if (file_exists('texture-instructions.md')) {
            $markdown = file_get_contents('texture-instructions.md');
            echo 'const markdownContent = ' . json_encode($markdown) . ';';
            echo 'document.getElementById("instructionsContent").innerHTML = marked.parse(markdownContent);';
          } else {
            echo 'document.getElementById("instructionsContent").innerHTML = "<p>Instructions file not found.</p>";';
          }
          ?>
        </script>
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

    <script>
      // ==================== FUNDAMENTOS: X, Y, U + applyStickerRotation ====================

      const faces = ["U", "L", "F", "R", "B", "D"];
      const colors = [
        "#ffffff",
        "#ff5800",
        "#009b48",
        "#c41e3a",
        "#0045ad",
        "#ffd500",
      ];

      let cubeState = { U: [], L: [], F: [], R: [], B: [], D: [] };
      let stickerRotations = { U: [], L: [], F: [], R: [], B: [], D: [] };
      let stickerIds = { U: [], L: [], F: [], R: [], B: [], D: [] };
      let stickerTextures = { U: [], L: [], F: [], R: [], B: [], D: [] };

      // Sistema de texturas
      let textureMode = "standard";
      let faceTextures = {};
      let customStickers = {};
      
      // New unified system
      let textureLibrary = {};
      let cubeAssignments = {};

      let currentViewMode = "cubenet";
      let cubeRotation = { x: -25, y: -45 };
      let cubeSize = window.innerWidth <= 480 ? 230 : 350;
      let zoom2D = 1;
      let panOffset = { x: 0, y: 0 };
      let isDragging = false;
      let previousMousePosition = { x: 0, y: 0 };

      function createStickers(faceElement, is3D = false) {
        faceElement.innerHTML = "";
        for (let i = 0; i < 9; i++) {
          const sticker = document.createElement("div");
          sticker.className = is3D ? "sticker-3d" : "sticker";
          faceElement.appendChild(sticker);
        }
      }

      function initCube() {
        faces.forEach((face, faceIndex) => {
          cubeState[face] = Array(9)
            .fill(0)
            .map((_, i) => faceIndex * 9 + i);
          stickerRotations[face] = Array(9).fill(0);
          stickerIds[face] = Array(9)
            .fill(0)
            .map((_, i) => faceIndex * 9 + i);
          stickerTextures[face] = Array(9)
            .fill(0)
            .map((_, i) => ({ face, index: i }));

          // Inicializar faces 2D e 3D
          const face2D = document.querySelector(
            `.face-2d[data-face="${face}"]`
          );
          const face3D = document.querySelector(
            `.face-3d[data-face="${face}"]`
          );

          if (face2D) createStickers(face2D, false);
          if (face3D) createStickers(face3D, true);
        });
        updateDOM();
      }

      function applyStickerRotation(face, index, rotationIncrement) {
        stickerRotations[face][index] =
          (stickerRotations[face][index] + rotationIncrement + 4) % 4;
      }

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
        // Limpar estilos
        sticker.style.background = "";
        sticker.style.backgroundImage = "";
        sticker.style.backgroundSize = "";
        sticker.style.backgroundPosition = "";
        sticker.style.backgroundRepeat = "";

        if (textureMode === "layered") {
          // LAYERED MODE: Build multiple background layers
          const backgroundImages = [];
          const backgroundSizes = [];
          const backgroundPositions = [];
          const backgroundRepeats = [];
          
          // First, check for custom sticker overlay
          const customStyle = customStickers[stickerId];
          if (customStyle && customStyle.background) {
            backgroundImages.push(customStyle.background);
            backgroundSizes.push(customStyle.backgroundSize || 'auto');
            backgroundPositions.push(customStyle.backgroundPosition || 'center');
            backgroundRepeats.push(customStyle.backgroundRepeat || 'no-repeat');
          }
          
          // Then add face texture as base layer (whole face texture)
          if (stickerTextures[face] && stickerTextures[face][index]) {
            const textureInfo = stickerTextures[face][index];
            const originalFace = textureInfo.face;
            const originalIndex = textureInfo.index;

            const texture = faceTextures[originalFace];
            const centerTexture = faceTextures[originalFace + "_center"];

            if (originalIndex === 4 && centerTexture) {
              // Center-specific texture
              if (centerTexture.background) {
                // Apply center texture directly as background
                sticker.style.background = centerTexture.background;
                if (centerTexture.backgroundSize) sticker.style.backgroundSize = centerTexture.backgroundSize;
                if (centerTexture.backgroundPosition) sticker.style.backgroundPosition = centerTexture.backgroundPosition;
                if (centerTexture.backgroundRepeat) sticker.style.backgroundRepeat = centerTexture.backgroundRepeat;
              }
            } else if (texture) {
              // Handle both backgroundImage (sprite) and background (whole face)
              if (texture.backgroundImage) {
                const row = Math.floor(originalIndex / 3);
                const col = originalIndex % 3;
                backgroundImages.push(texture.backgroundImage);
                backgroundSizes.push(texture.backgroundSize || '300% 300%');
                backgroundPositions.push(`${col * 50}% ${row * 50}%`);
                backgroundRepeats.push(texture.backgroundRepeat || 'no-repeat');
              } else if (texture.background) {
                // Don't convert to backgroundImage - apply directly as background
                sticker.style.background = texture.background;
                if (texture.backgroundSize) sticker.style.backgroundSize = texture.backgroundSize;
                if (texture.backgroundPosition) sticker.style.backgroundPosition = texture.backgroundPosition;
                if (texture.backgroundRepeat) sticker.style.backgroundRepeat = texture.backgroundRepeat;
              }
            }
          }
          
          // Apply all layers
          if (backgroundImages.length > 0) {
            sticker.style.backgroundImage = backgroundImages.join(', ');
            sticker.style.backgroundSize = backgroundSizes.join(', ');
            sticker.style.backgroundPosition = backgroundPositions.join(', ');
            sticker.style.backgroundRepeat = backgroundRepeats.join(', ');
          }
        } else if (textureMode === "face_textures") {
          const texture = faceTextures[face];
          const centerTexture = faceTextures[face + "_center"];

          if (index === 4 && centerTexture) {
            Object.assign(sticker.style, centerTexture);
          } else if (texture) {
            if (texture.backgroundImage) {
              // Standard backgroundImage handling
              const row = Math.floor(index / 3);
              const col = index % 3;
              sticker.style.backgroundImage = texture.backgroundImage;
              sticker.style.backgroundPosition = `${col * 50}% ${row * 50}%`;
              sticker.style.backgroundSize = texture.backgroundSize || "300% 300%";
              sticker.style.backgroundRepeat = "no-repeat";
            } else {
              Object.assign(sticker.style, texture);
            }
          }
        } else if (textureMode === "custom_indices") {
          const style = customStickers[stickerId];
          if (style) Object.assign(sticker.style, style);
        } else if (textureMode === "unified") {
          applyUnifiedTexture(sticker, face, index);
        } else {
          sticker.style.backgroundColor = "#888888";
        }

        // Hide indices when custom textures are active or in standard mode
        sticker.innerHTML = "";

        const rotation = stickerRotations[face][index] * 90;
        sticker.style.transform = rotation ? `rotate(${rotation}deg)` : "";
      }

      function updateDOM() {
        faces.forEach((face, faceIndex) => {
          const face2D = document.querySelector(
            `.face-2d[data-face="${face}"]`
          );
          const face3D = document.querySelector(
            `.face-3d[data-face="${face}"]`
          );

          [face2D, face3D].forEach((faceElement) => {
            if (faceElement) {
              for (let i = 0; i < 9; i++) {
                const sticker = faceElement.children[i];
                const stickerId = cubeState[face][i];
                applyStickerStyle(sticker, face, i, stickerId);
              }
            }
          });
        });
      }

      function setViewMode(mode) {
        const cubeNet = document.getElementById("cube-net");
        const cube3DWrapper = document.getElementById("cube-3d-wrapper");
        const cube3D = document.getElementById("cube-3d");

        currentViewMode = mode;
        localStorage.setItem('viewMode', mode);

        // Reset button states
        document.getElementById("cubenetBtn").disabled = false;
        document.getElementById("perspectiveBtn").disabled = false;
        document.getElementById("orthographicBtn").disabled = false;

        if (mode === "cubenet") {
          cubeNet.style.display = "grid";
          cube3DWrapper.style.display = "none";
          document.body.classList.remove("is-3d");
          cube3DWrapper.classList.remove("perspective");
          document.getElementById("cubenetBtn").disabled = true;
          update2DZoom();
        } else if (mode === "perspective") {
          cubeNet.style.display = "none";
          cube3DWrapper.style.display = "block";
          document.body.classList.add("is-3d");
          cube3DWrapper.classList.add("perspective");
          document.getElementById("perspectiveBtn").disabled = true;
          document.documentElement.style.setProperty(
            "--cube-size",
            `${cubeSize}px`
          );
          updateCubeRotation();
        } else if (mode === "orthographic") {
          cubeNet.style.display = "none";
          cube3DWrapper.style.display = "block";
          document.body.classList.add("is-3d");
          cube3DWrapper.classList.remove("perspective");
          document.getElementById("orthographicBtn").disabled = true;
          document.documentElement.style.setProperty(
            "--cube-size",
            `${cubeSize}px`
          );
          updateCubeRotation();
        }
      }

      function updateCubeRotation() {
        const cube = document.getElementById("cube-3d");
        cube.style.transform = `
        translate(-50%, -50%)
        rotateX(${cubeRotation.x}deg)
        rotateY(${cubeRotation.y}deg)
      `;
        saveViewState();
      }

      function update2DZoom() {
        const cubeNet = document.getElementById("cube-net");
        cubeNet.style.transform = `translate(calc(-50% + ${panOffset.x}px), calc(-50% + ${panOffset.y}px)) scale(${zoom2D})`;
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
        if (e.target.id !== "right-panel" && !e.target.closest("#right-panel"))
          return;
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
        document.getElementById("right-panel").style.cursor = "grabbing";
        e.preventDefault();
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
        document.getElementById("right-panel").style.cursor = "grab";
      }

      function handleWheel(e) {
        if (e.target.closest("#controls")) return;
        e.preventDefault();

        const delta = Math.sign(e.deltaY);

        if (currentViewMode === "cubenet") {
          zoom2D = Math.max(0.5, Math.min(3, zoom2D * (1 - delta * 0.1)));
          update2DZoom();
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

      function rotateFaceDataCW(faceData) {
        return [
          faceData[6],
          faceData[3],
          faceData[0],
          faceData[7],
          faceData[4],
          faceData[1],
          faceData[8],
          faceData[5],
          faceData[2],
        ];
      }

      function rotateFaceDataCCW(faceData) {
        return [
          faceData[2],
          faceData[5],
          faceData[8],
          faceData[1],
          faceData[4],
          faceData[7],
          faceData[0],
          faceData[3],
          faceData[6],
        ];
      }

      function rotateFaceData180(faceData) {
        return [
          faceData[8],
          faceData[7],
          faceData[6],
          faceData[5],
          faceData[4],
          faceData[3],
          faceData[2],
          faceData[1],
          faceData[0],
        ];
      }

      // MOVIMENTO U
      function moveU() {
        cubeState.U = rotateFaceDataCW(cubeState.U);
        stickerRotations.U = rotateFaceDataCW(stickerRotations.U);
        stickerTextures.U = rotateFaceDataCW(stickerTextures.U); // Rotacionar texturas da face U
        for (let i = 0; i < 9; i++) applyStickerRotation("U", i, 1);

        const temp = [cubeState.F[0], cubeState.F[1], cubeState.F[2]];
        const tempRot = [
          stickerRotations.F[0],
          stickerRotations.F[1],
          stickerRotations.F[2],
        ];
        const tempTex = [
          stickerTextures.F[0],
          stickerTextures.F[1],
          stickerTextures.F[2],
        ];

        // F ← R (sem flip)
        cubeState.F[0] = cubeState.R[0];
        cubeState.F[1] = cubeState.R[1];
        cubeState.F[2] = cubeState.R[2];
        stickerRotations.F[0] = stickerRotations.R[0];
        stickerRotations.F[1] = stickerRotations.R[1];
        stickerRotations.F[2] = stickerRotations.R[2];
        stickerTextures.F[0] = stickerTextures.R[0];
        stickerTextures.F[1] = stickerTextures.R[1];
        stickerTextures.F[2] = stickerTextures.R[2];

        // R ← B (sem flip - B para R não precisa)
        cubeState.R[0] = cubeState.B[0];
        cubeState.R[1] = cubeState.B[1];
        cubeState.R[2] = cubeState.B[2];
        stickerRotations.R[0] = stickerRotations.B[0];
        stickerRotations.R[1] = stickerRotations.B[1];
        stickerRotations.R[2] = stickerRotations.B[2];
        stickerTextures.R[0] = stickerTextures.B[0];
        stickerTextures.R[1] = stickerTextures.B[1];
        stickerTextures.R[2] = stickerTextures.B[2];

        // B ← L (sem flip - L para B não precisa)
        cubeState.B[0] = cubeState.L[0];
        cubeState.B[1] = cubeState.L[1];
        cubeState.B[2] = cubeState.L[2];
        stickerRotations.B[0] = stickerRotations.L[0];
        stickerRotations.B[1] = stickerRotations.L[1];
        stickerRotations.B[2] = stickerRotations.L[2];
        stickerTextures.B[0] = stickerTextures.L[0];
        stickerTextures.B[1] = stickerTextures.L[1];
        stickerTextures.B[2] = stickerTextures.L[2];

        // L ← F (sem flip)
        cubeState.L[0] = temp[0];
        cubeState.L[1] = temp[1];
        cubeState.L[2] = temp[2];
        stickerRotations.L[0] = tempRot[0];
        stickerRotations.L[1] = tempRot[1];
        stickerRotations.L[2] = tempRot[2];
        stickerTextures.L[0] = tempTex[0];
        stickerTextures.L[1] = tempTex[1];
        stickerTextures.L[2] = tempTex[2];

        updateDOM();
      }

      // ROTAÇÃO X
      function rotationX() {
        const temp = cubeState.U;
        const tempRot = [...stickerRotations.U];
        const tempTex = [...stickerTextures.U];

        cubeState.U = cubeState.F;
        stickerRotations.U = [...stickerRotations.F];
        stickerTextures.U = [...stickerTextures.F];

        cubeState.F = cubeState.D;
        stickerRotations.F = [...stickerRotations.D];
        stickerTextures.F = [...stickerTextures.D];

        cubeState.D = rotateFaceData180(cubeState.B);
        stickerRotations.D = rotateFaceData180(stickerRotations.B);
        stickerTextures.D = rotateFaceData180(stickerTextures.B);
        for (let i = 0; i < 9; i++) applyStickerRotation("D", i, 2);

        cubeState.B = rotateFaceData180(temp);
        stickerRotations.B = rotateFaceData180(tempRot);
        stickerTextures.B = rotateFaceData180(tempTex);
        for (let i = 0; i < 9; i++) applyStickerRotation("B", i, 2);

        cubeState.L = rotateFaceDataCCW(cubeState.L);
        stickerRotations.L = rotateFaceDataCCW(stickerRotations.L);
        stickerTextures.L = rotateFaceDataCCW(stickerTextures.L);
        for (let i = 0; i < 9; i++) applyStickerRotation("L", i, -1);

        cubeState.R = rotateFaceDataCW(cubeState.R);
        stickerRotations.R = rotateFaceDataCW(stickerRotations.R);
        stickerTextures.R = rotateFaceDataCW(stickerTextures.R);
        for (let i = 0; i < 9; i++) applyStickerRotation("R", i, 1);

        updateDOM();
      }

      // ROTAÇÃO Y
      function rotationY() {
        const temp = cubeState.F;
        const tempRot = [...stickerRotations.F];
        const tempTex = [...stickerTextures.F];

        cubeState.F = cubeState.R;
        stickerRotations.F = [...stickerRotations.R];
        stickerTextures.F = [...stickerTextures.R];

        cubeState.R = cubeState.B;
        stickerRotations.R = [...stickerRotations.B];
        stickerTextures.R = [...stickerTextures.B];

        cubeState.B = cubeState.L;
        stickerRotations.B = [...stickerRotations.L];
        stickerTextures.B = [...stickerTextures.L];

        cubeState.L = temp;
        stickerRotations.L = tempRot;
        stickerTextures.L = tempTex;

        cubeState.U = rotateFaceDataCW(cubeState.U);
        stickerRotations.U = rotateFaceDataCW(stickerRotations.U);
        stickerTextures.U = rotateFaceDataCW(stickerTextures.U);
        for (let i = 0; i < 9; i++) applyStickerRotation("U", i, 1);

        cubeState.D = rotateFaceDataCCW(cubeState.D);
        stickerRotations.D = rotateFaceDataCCW(stickerRotations.D);
        stickerTextures.D = rotateFaceDataCCW(stickerTextures.D);
        for (let i = 0; i < 9; i++) applyStickerRotation("D", i, -1);

        updateDOM();
      }

      // CRIAR Z A PARTIR DE X E Y (invertido)
      function rotationZ() {
        repeat(rotationY, 3);
        rotationX();
        rotationY();
      }

      // CONSTRUIR TODOS OS MOVIMENTOS A PARTIR DOS FUNDAMENTOS
      const repeat = (fn, times) => {
        for (let i = 0; i < times; i++) fn();
      };
      const prime = (fn) => () => repeat(fn, 3);
      const double = (fn) => () => repeat(fn, 2);

      const moveD = () => {
        double(rotationX)();
        moveU();
        double(rotationX)();
      };
      const moveR = () => {
        prime(rotationZ)();
        moveU();
        rotationZ();
      };
      const moveL = () => {
        rotationZ();
        moveU();
        prime(rotationZ)();
      };
      const moveF = () => {
        rotationX();
        moveU();
        prime(rotationX)();
      };
      const moveB = () => {
        prime(rotationX)();
        moveU();
        rotationX();
      };

 
      function moveM() {
        // Direct M' move: reverse direction of M
        const temp = [cubeState.U[1], cubeState.U[4], cubeState.U[7]];
        const tempRot = [stickerRotations.U[1], stickerRotations.U[4], stickerRotations.U[7]];
        const tempTex = [stickerTextures.U[1], stickerTextures.U[4], stickerTextures.U[7]];

        // U ← B (with 180° flip)
        cubeState.U[1] = cubeState.B[7];
        cubeState.U[4] = cubeState.B[4];
        cubeState.U[7] = cubeState.B[1];
        stickerRotations.U[1] = (stickerRotations.B[7] + 2) % 4;
        stickerRotations.U[4] = (stickerRotations.B[4] + 2) % 4;
        stickerRotations.U[7] = (stickerRotations.B[1] + 2) % 4;
        stickerTextures.U[1] = stickerTextures.B[7];
        stickerTextures.U[4] = stickerTextures.B[4];
        stickerTextures.U[7] = stickerTextures.B[1];

        // B ← D (with 180° flip)
        cubeState.B[7] = cubeState.D[1];
        cubeState.B[4] = cubeState.D[4];
        cubeState.B[1] = cubeState.D[7];
        stickerRotations.B[7] = (stickerRotations.D[1] + 2) % 4;
        stickerRotations.B[4] = (stickerRotations.D[4] + 2) % 4;
        stickerRotations.B[1] = (stickerRotations.D[7] + 2) % 4;
        stickerTextures.B[7] = stickerTextures.D[1];
        stickerTextures.B[4] = stickerTextures.D[4];
        stickerTextures.B[1] = stickerTextures.D[7];

        // D ← F
        cubeState.D[1] = cubeState.F[1];
        cubeState.D[4] = cubeState.F[4];
        cubeState.D[7] = cubeState.F[7];
        stickerRotations.D[1] = stickerRotations.F[1];
        stickerRotations.D[4] = stickerRotations.F[4];
        stickerRotations.D[7] = stickerRotations.F[7];
        stickerTextures.D[1] = stickerTextures.F[1];
        stickerTextures.D[4] = stickerTextures.F[4];
        stickerTextures.D[7] = stickerTextures.F[7];

        // F ← U
        cubeState.F[1] = temp[0];
        cubeState.F[4] = temp[1];
        cubeState.F[7] = temp[2];
        stickerRotations.F[1] = tempRot[0];
        stickerRotations.F[4] = tempRot[1];
        stickerRotations.F[7] = tempRot[2];
        stickerTextures.F[1] = tempTex[0];
        stickerTextures.F[4] = tempTex[1];
        stickerTextures.F[7] = tempTex[2];

        updateDOM();
      }

      // SLICE MOVES
      function moveMPrime() {
        // Direct M move: rotate middle slice like L but opposite direction
        const temp = [cubeState.U[1], cubeState.U[4], cubeState.U[7]];
        const tempRot = [stickerRotations.U[1], stickerRotations.U[4], stickerRotations.U[7]];
        const tempTex = [stickerTextures.U[1], stickerTextures.U[4], stickerTextures.U[7]];

        // U ← F
        cubeState.U[1] = cubeState.F[1];
        cubeState.U[4] = cubeState.F[4];
        cubeState.U[7] = cubeState.F[7];
        stickerRotations.U[1] = stickerRotations.F[1];
        stickerRotations.U[4] = stickerRotations.F[4];
        stickerRotations.U[7] = stickerRotations.F[7];
        stickerTextures.U[1] = stickerTextures.F[1];
        stickerTextures.U[4] = stickerTextures.F[4];
        stickerTextures.U[7] = stickerTextures.F[7];

        // F ← D
        cubeState.F[1] = cubeState.D[1];
        cubeState.F[4] = cubeState.D[4];
        cubeState.F[7] = cubeState.D[7];
        stickerRotations.F[1] = stickerRotations.D[1];
        stickerRotations.F[4] = stickerRotations.D[4];
        stickerRotations.F[7] = stickerRotations.D[7];
        stickerTextures.F[1] = stickerTextures.D[1];
        stickerTextures.F[4] = stickerTextures.D[4];
        stickerTextures.F[7] = stickerTextures.D[7];

        // D ← B (with 180° flip)
        cubeState.D[1] = cubeState.B[7];
        cubeState.D[4] = cubeState.B[4];
        cubeState.D[7] = cubeState.B[1];
        stickerRotations.D[1] = (stickerRotations.B[7] + 2) % 4;
        stickerRotations.D[4] = (stickerRotations.B[4] + 2) % 4;
        stickerRotations.D[7] = (stickerRotations.B[1] + 2) % 4;
        stickerTextures.D[1] = stickerTextures.B[7];
        stickerTextures.D[4] = stickerTextures.B[4];
        stickerTextures.D[7] = stickerTextures.B[1];

        // B ← U (with 180° flip)
        cubeState.B[7] = temp[0];
        cubeState.B[4] = temp[1];
        cubeState.B[1] = temp[2];
        stickerRotations.B[7] = (tempRot[0] + 2) % 4;
        stickerRotations.B[4] = (tempRot[1] + 2) % 4;
        stickerRotations.B[1] = (tempRot[2] + 2) % 4;
        stickerTextures.B[7] = tempTex[0];
        stickerTextures.B[4] = tempTex[1];
        stickerTextures.B[1] = tempTex[2];

        updateDOM();
      }

      function moveM2() {
        // Direct M2 move: swap opposite middle slices
        const tempU = [cubeState.U[1], cubeState.U[4], cubeState.U[7]];
        const tempRotU = [stickerRotations.U[1], stickerRotations.U[4], stickerRotations.U[7]];
        const tempTexU = [stickerTextures.U[1], stickerTextures.U[4], stickerTextures.U[7]];

        // U ↔ D
        cubeState.U[1] = cubeState.D[1];
        cubeState.U[4] = cubeState.D[4];
        cubeState.U[7] = cubeState.D[7];
        stickerRotations.U[1] = stickerRotations.D[1];
        stickerRotations.U[4] = stickerRotations.D[4];
        stickerRotations.U[7] = stickerRotations.D[7];
        stickerTextures.U[1] = stickerTextures.D[1];
        stickerTextures.U[4] = stickerTextures.D[4];
        stickerTextures.U[7] = stickerTextures.D[7];

        cubeState.D[1] = tempU[0];
        cubeState.D[4] = tempU[1];
        cubeState.D[7] = tempU[2];
        stickerRotations.D[1] = tempRotU[0];
        stickerRotations.D[4] = tempRotU[1];
        stickerRotations.D[7] = tempRotU[2];
        stickerTextures.D[1] = tempTexU[0];
        stickerTextures.D[4] = tempTexU[1];
        stickerTextures.D[7] = tempTexU[2];

        // F ↔ B (with 180° flip)
        const tempF = [cubeState.F[1], cubeState.F[4], cubeState.F[7]];
        const tempRotF = [stickerRotations.F[1], stickerRotations.F[4], stickerRotations.F[7]];
        const tempTexF = [stickerTextures.F[1], stickerTextures.F[4], stickerTextures.F[7]];

        cubeState.F[1] = cubeState.B[7];
        cubeState.F[4] = cubeState.B[4];
        cubeState.F[7] = cubeState.B[1];
        stickerRotations.F[1] = (stickerRotations.B[7] + 2) % 4;
        stickerRotations.F[4] = (stickerRotations.B[4] + 2) % 4;
        stickerRotations.F[7] = (stickerRotations.B[1] + 2) % 4;
        stickerTextures.F[1] = stickerTextures.B[7];
        stickerTextures.F[4] = stickerTextures.B[4];
        stickerTextures.F[7] = stickerTextures.B[1];

        cubeState.B[7] = tempF[0];
        cubeState.B[4] = tempF[1];
        cubeState.B[1] = tempF[2];
        stickerRotations.B[7] = (tempRotF[0] + 2) % 4;
        stickerRotations.B[4] = (tempRotF[1] + 2) % 4;
        stickerRotations.B[1] = (tempRotF[2] + 2) % 4;
        stickerTextures.B[7] = tempTexF[0];
        stickerTextures.B[4] = tempTexF[1];
        stickerTextures.B[1] = tempTexF[2];

        updateDOM();
      }
      
      const moveE = () => {
        rotationZ();
        moveM();
        prime(rotationZ)();
      };
      
      const moveEPrime = () => {
        prime(rotationZ)();
        moveM();
        rotationZ();
      };
      
      const moveE2 = () => {
        prime(rotationZ)();
        moveM2();
        rotationZ();
      };
      
      const moveS = () => {
        rotationY();
        moveM();
        prime(rotationY)();
      };
      
      const moveSPrime = () => {
        prime(rotationY)();
        moveM();
        rotationY();
      };
      
      const moveS2 = () => {
        prime(rotationY)();
        moveM2();
        rotationY();
      };

      // WIDE MOVES
      const moveRw = () => {
        moveL();
        rotationX();
      };
      
      const moveLw = () => {
        moveR();
        prime(rotationX)();
      };
      
      const moveUw = () => {
        moveD();
        rotationY();
      };
      
      const moveDw = () => {
        moveU();
        prime(rotationY)();
      };
      
      const moveFw = () => {
        moveB();
        rotationZ();
      };
      
      const moveBw = () => {
        moveF();
        prime(rotationZ)();
      };

      function applyMove(move) {
        const moves = {
          U: moveU,
          D: moveD,
          R: moveR,
          L: moveL,
          F: moveF,
          B: moveB,
          M: moveM,
          E: moveE,
          S: moveS,
          Rw: moveRw,
          Lw: moveLw,
          Uw: moveUw,
          Dw: moveDw,
          Fw: moveFw,
          Bw: moveBw,
          r: moveRw,
          l: moveLw,
          u: moveUw,
          d: moveDw,
          f: moveFw,
          b: moveBw,
          x: rotationX,
          y: rotationY,
          z: rotationZ,
          "U'": prime(moveU),
          "D'": prime(moveD),
          "R'": prime(moveR),
          "L'": prime(moveL),
          "F'": prime(moveF),
          "B'": prime(moveB),
          "M'": moveMPrime,
          "E'": moveEPrime,
          "S'": moveSPrime,
          "Rw'": prime(moveRw),
          "Lw'": prime(moveLw),
          "Uw'": prime(moveUw),
          "Dw'": prime(moveDw),
          "Fw'": prime(moveFw),
          "Bw'": prime(moveBw),
          "r'": prime(moveRw),
          "l'": prime(moveLw),
          "u'": prime(moveUw),
          "d'": prime(moveDw),
          "f'": prime(moveFw),
          "b'": prime(moveBw),
          "x'": prime(rotationX),
          "y'": prime(rotationY),
          "z'": prime(rotationZ),
          U2: double(moveU),
          D2: double(moveD),
          R2: double(moveR),
          L2: double(moveL),
          F2: double(moveF),
          B2: double(moveB),
          M2: moveM2,
          E2: moveE2,
          S2: moveS2,
          Rw2: double(moveRw),
          Lw2: double(moveLw),
          Uw2: double(moveUw),
          Dw2: double(moveDw),
          Fw2: double(moveFw),
          Bw2: double(moveBw),
          r2: double(moveRw),
          l2: double(moveLw),
          u2: double(moveUw),
          d2: double(moveDw),
          f2: double(moveFw),
          b2: double(moveBw),
          x2: double(rotationX),
          y2: double(rotationY),
          z2: double(rotationZ),
        };

        if (moves[move]) moves[move]();
      }

      function applyAlgorithm() {
        let alg = document.getElementById("alg").value.trim();
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
        moves.forEach((move) => applyMove(move));
      }

      function solveCube() {
        initCube();
        if (textureMode !== "standard") {
          updateDOM();
        }
      }

      function loadCustomConfig() {
        document.getElementById('loadingSpinner').style.display = 'block';
        
        try {
          let configText = document.getElementById("customConfig").value;
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
            textureMode = "unified";
            // Process vars for unified system
            if (finalConfig.vars) {
              finalConfig = replaceVarsInConfig(finalConfig);
            }
            loadUnifiedConfig(finalConfig);
          }
          // Legacy system support
          else if (finalConfig.mode) {
            // Process variables for legacy modes
            if (finalConfig.vars) {
              finalConfig = replaceVarsInConfig(finalConfig);
            }

            if (finalConfig.mode === "face_textures") {
              textureMode = "face_textures";
              faceTextures = finalConfig.textures || {};
              if (!stickerTextures.U || stickerTextures.U.length === 0) {
                faces.forEach((face, faceIndex) => {
                  stickerTextures[face] = Array(9)
                    .fill(0)
                    .map((_, i) => ({ face, index: i }));
                });
              }
            } else if (finalConfig.mode === "custom_indices") {
              textureMode = "custom_indices";
              customStickers = finalConfig.stickers || {};
            } else if (finalConfig.mode === "layered") {
              textureMode = "layered";
              faceTextures = finalConfig.textures || {};
              customStickers = finalConfig.stickers || {};
              if (!stickerTextures.U || stickerTextures.U.length === 0) {
                faces.forEach((face, faceIndex) => {
                  stickerTextures[face] = Array(9)
                    .fill(0)
                    .map((_, i) => ({ face, index: i }));
                });
              }
            }
          }

          // Check for background images and wait for them to load
          const imagePromises = [];
          Object.values(faceTextures).forEach(texture => {
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
            document.getElementById('loadingSpinner').style.display = 'none';
          });

          // If no images, hide spinner immediately after DOM update
          if (imagePromises.length === 0) {
            updateDOM();
            document.getElementById('loadingSpinner').style.display = 'none';
          }
        } catch (error) {
          document.getElementById('loadingSpinner').style.display = 'none';
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
        
        document.getElementById('stateModal').querySelector('.modal-content').style.width = `${optimalWidth}px`;
        document.getElementById('stateModal').style.display = 'block';
      }

      function closeStateModal() {
        document.getElementById('stateModal').style.display = 'none';
      }

      function copyToClipboard() {
        const formatStateValue = (val) => val.toString().padStart(2, ' ');
        
        const stateDisplay = `                U
            ${formatStateValue(cubeState.U[0])} ${formatStateValue(cubeState.U[1])} ${formatStateValue(cubeState.U[2])}
            ${formatStateValue(cubeState.U[3])} ${formatStateValue(cubeState.U[4])} ${formatStateValue(cubeState.U[5])}
            ${formatStateValue(cubeState.U[6])} ${formatStateValue(cubeState.U[7])} ${formatStateValue(cubeState.U[8])}

    L           F          R           B
${formatStateValue(cubeState.L[0])} ${formatStateValue(cubeState.L[1])} ${formatStateValue(cubeState.L[2])}    ${formatStateValue(cubeState.F[0])} ${formatStateValue(cubeState.F[1])} ${formatStateValue(cubeState.F[2])}    ${formatStateValue(cubeState.R[0])} ${formatStateValue(cubeState.R[1])} ${formatStateValue(cubeState.R[2])}    ${formatStateValue(cubeState.B[0])} ${formatStateValue(cubeState.B[1])} ${formatStateValue(cubeState.B[2])}
${formatStateValue(cubeState.L[3])} ${formatStateValue(cubeState.L[4])} ${formatStateValue(cubeState.L[5])}    ${formatStateValue(cubeState.F[3])} ${formatStateValue(cubeState.F[4])} ${formatStateValue(cubeState.F[5])}    ${formatStateValue(cubeState.R[3])} ${formatStateValue(cubeState.R[4])} ${formatStateValue(cubeState.R[5])}    ${formatStateValue(cubeState.B[3])} ${formatStateValue(cubeState.B[4])} ${formatStateValue(cubeState.B[5])}
${formatStateValue(cubeState.L[6])} ${formatStateValue(cubeState.L[7])} ${formatStateValue(cubeState.L[8])}    ${formatStateValue(cubeState.F[6])} ${formatStateValue(cubeState.F[7])} ${formatStateValue(cubeState.F[8])}    ${formatStateValue(cubeState.R[6])} ${formatStateValue(cubeState.R[7])} ${formatStateValue(cubeState.R[8])}    ${formatStateValue(cubeState.B[6])} ${formatStateValue(cubeState.B[7])} ${formatStateValue(cubeState.B[8])}

               D
            ${formatStateValue(cubeState.D[0])} ${formatStateValue(cubeState.D[1])} ${formatStateValue(cubeState.D[2])}
            ${formatStateValue(cubeState.D[3])} ${formatStateValue(cubeState.D[4])} ${formatStateValue(cubeState.D[5])}
            ${formatStateValue(cubeState.D[6])} ${formatStateValue(cubeState.D[7])} ${formatStateValue(cubeState.D[8])}`;
        
        const rotationsDisplay = `          U
        ${stickerRotations.U[0]} ${stickerRotations.U[1]} ${stickerRotations.U[2]}
        ${stickerRotations.U[3]} ${stickerRotations.U[4]} ${stickerRotations.U[5]}
        ${stickerRotations.U[6]} ${stickerRotations.U[7]} ${stickerRotations.U[8]}

  L       F       R       B
${stickerRotations.L[0]} ${stickerRotations.L[1]} ${stickerRotations.L[2]}   ${stickerRotations.F[0]} ${stickerRotations.F[1]} ${stickerRotations.F[2]}   ${stickerRotations.R[0]} ${stickerRotations.R[1]} ${stickerRotations.R[2]}   ${stickerRotations.B[0]} ${stickerRotations.B[1]} ${stickerRotations.B[2]}
${stickerRotations.L[3]} ${stickerRotations.L[4]} ${stickerRotations.L[5]}   ${stickerRotations.F[3]} ${stickerRotations.F[4]} ${stickerRotations.F[5]}   ${stickerRotations.R[3]} ${stickerRotations.R[4]} ${stickerRotations.R[5]}   ${stickerRotations.B[3]} ${stickerRotations.B[4]} ${stickerRotations.B[5]}
${stickerRotations.L[6]} ${stickerRotations.L[7]} ${stickerRotations.L[8]}   ${stickerRotations.F[6]} ${stickerRotations.F[7]} ${stickerRotations.F[8]}   ${stickerRotations.R[6]} ${stickerRotations.R[7]} ${stickerRotations.R[8]}   ${stickerRotations.B[6]} ${stickerRotations.B[7]} ${stickerRotations.B[8]}

          D
        ${stickerRotations.D[0]} ${stickerRotations.D[1]} ${stickerRotations.D[2]}
        ${stickerRotations.D[3]} ${stickerRotations.D[4]} ${stickerRotations.D[5]}
        ${stickerRotations.D[6]} ${stickerRotations.D[7]} ${stickerRotations.D[8]}`;
        
        const combinedText = `----STICKERS----\n\n${stateDisplay}\n\n----ROTATIONS----\n\n${rotationsDisplay}`;
        
        navigator.clipboard.writeText(combinedText).then(() => {
          showToast('Copied to clipboard!');
        });
      }

      function showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
      }

      function switchTab(tab) {
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        document.querySelector(`[onclick="switchTab('${tab}')"]`).classList.add('active');
        document.getElementById(tab + 'Tab').classList.add('active');
      }

      function updateStateTab() {
        const formatStateValue = (val) => val.toString().padStart(2, ' ');
        
        const cubeStateDisplay = `                U
            ${formatStateValue(cubeState.U[0])} ${formatStateValue(cubeState.U[1])} ${formatStateValue(cubeState.U[2])}
            ${formatStateValue(cubeState.U[3])} ${formatStateValue(cubeState.U[4])} ${formatStateValue(cubeState.U[5])}
            ${formatStateValue(cubeState.U[6])} ${formatStateValue(cubeState.U[7])} ${formatStateValue(cubeState.U[8])}

    L           F          R           B
${formatStateValue(cubeState.L[0])} ${formatStateValue(cubeState.L[1])} ${formatStateValue(cubeState.L[2])}    ${formatStateValue(cubeState.F[0])} ${formatStateValue(cubeState.F[1])} ${formatStateValue(cubeState.F[2])}    ${formatStateValue(cubeState.R[0])} ${formatStateValue(cubeState.R[1])} ${formatStateValue(cubeState.R[2])}    ${formatStateValue(cubeState.B[0])} ${formatStateValue(cubeState.B[1])} ${formatStateValue(cubeState.B[2])}
${formatStateValue(cubeState.L[3])} ${formatStateValue(cubeState.L[4])} ${formatStateValue(cubeState.L[5])}    ${formatStateValue(cubeState.F[3])} ${formatStateValue(cubeState.F[4])} ${formatStateValue(cubeState.F[5])}    ${formatStateValue(cubeState.R[3])} ${formatStateValue(cubeState.R[4])} ${formatStateValue(cubeState.R[5])}    ${formatStateValue(cubeState.B[3])} ${formatStateValue(cubeState.B[4])} ${formatStateValue(cubeState.B[5])}
${formatStateValue(cubeState.L[6])} ${formatStateValue(cubeState.L[7])} ${formatStateValue(cubeState.L[8])}    ${formatStateValue(cubeState.F[6])} ${formatStateValue(cubeState.F[7])} ${formatStateValue(cubeState.F[8])}    ${formatStateValue(cubeState.R[6])} ${formatStateValue(cubeState.R[7])} ${formatStateValue(cubeState.R[8])}    ${formatStateValue(cubeState.B[6])} ${formatStateValue(cubeState.B[7])} ${formatStateValue(cubeState.B[8])}

               D
            ${formatStateValue(cubeState.D[0])} ${formatStateValue(cubeState.D[1])} ${formatStateValue(cubeState.D[2])}
            ${formatStateValue(cubeState.D[3])} ${formatStateValue(cubeState.D[4])} ${formatStateValue(cubeState.D[5])}
            ${formatStateValue(cubeState.D[6])} ${formatStateValue(cubeState.D[7])} ${formatStateValue(cubeState.D[8])}`;
        
        const statePreElement = document.createElement('pre');
        statePreElement.style.cssText = 'background: #f5f5f5; padding: 15px; border-radius: 4px; overflow-x: auto; font-family: "Courier New", monospace; font-size: 14px; line-height: 1.2; cursor: pointer;';
        statePreElement.textContent = cubeStateDisplay;
        statePreElement.onclick = () => copyToClipboard();
        
        document.getElementById('stateTab').innerHTML = '<p><strong>Sticker positions (0-53):</strong></p>';
        document.getElementById('stateTab').appendChild(statePreElement);
      }

      function updateRotationsTab() {
        let total = 0;
        faces.forEach((face) => {
          stickerRotations[face].forEach((rot) => (total += rot));
        });
        
        const cubeNetDisplay = `          U
        ${stickerRotations.U[0]} ${stickerRotations.U[1]} ${stickerRotations.U[2]}
        ${stickerRotations.U[3]} ${stickerRotations.U[4]} ${stickerRotations.U[5]}
        ${stickerRotations.U[6]} ${stickerRotations.U[7]} ${stickerRotations.U[8]}

  L       F       R       B
${stickerRotations.L[0]} ${stickerRotations.L[1]} ${stickerRotations.L[2]}   ${stickerRotations.F[0]} ${stickerRotations.F[1]} ${stickerRotations.F[2]}   ${stickerRotations.R[0]} ${stickerRotations.R[1]} ${stickerRotations.R[2]}   ${stickerRotations.B[0]} ${stickerRotations.B[1]} ${stickerRotations.B[2]}
${stickerRotations.L[3]} ${stickerRotations.L[4]} ${stickerRotations.L[5]}   ${stickerRotations.F[3]} ${stickerRotations.F[4]} ${stickerRotations.F[5]}   ${stickerRotations.R[3]} ${stickerRotations.R[4]} ${stickerRotations.R[5]}   ${stickerRotations.B[3]} ${stickerRotations.B[4]} ${stickerRotations.B[5]}
${stickerRotations.L[6]} ${stickerRotations.L[7]} ${stickerRotations.L[8]}   ${stickerRotations.F[6]} ${stickerRotations.F[7]} ${stickerRotations.F[8]}   ${stickerRotations.R[6]} ${stickerRotations.R[7]} ${stickerRotations.R[8]}   ${stickerRotations.B[6]} ${stickerRotations.B[7]} ${stickerRotations.B[8]}

          D
        ${stickerRotations.D[0]} ${stickerRotations.D[1]} ${stickerRotations.D[2]}
        ${stickerRotations.D[3]} ${stickerRotations.D[4]} ${stickerRotations.D[5]}
        ${stickerRotations.D[6]} ${stickerRotations.D[7]} ${stickerRotations.D[8]}`;
        
        const rotationsPreElement = document.createElement('pre');
        rotationsPreElement.style.cssText = 'background: #f5f5f5; padding: 15px; border-radius: 4px; overflow-x: auto; font-family: "Courier New", monospace; font-size: 14px; line-height: 1.2; cursor: pointer;';
        rotationsPreElement.textContent = cubeNetDisplay;
        rotationsPreElement.onclick = () => copyToClipboard();
        
        document.getElementById('rotationsTab').innerHTML = `<p><strong>Total rotations:</strong> ${total}</p>`;
        document.getElementById('rotationsTab').appendChild(rotationsPreElement);
      }

      // Event listeners
      const rightPanel = document.getElementById("right-panel");
      rightPanel.addEventListener("mousedown", handleMouseDown);
      rightPanel.addEventListener("touchstart", handleTouchStart, { passive: true });
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("touchmove", handleTouchMove, { passive: true });
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchend", handleTouchEnd);
      rightPanel.addEventListener("wheel", handleWheel, { passive: false });
      
      // Pinch zoom for touch devices
      let initialDistance = 0;
      let initialZoom = 1;
      
      rightPanel.addEventListener("touchstart", function(e) {
        if (e.touches.length === 2) {
          initialDistance = getTouchDistance(e.touches[0], e.touches[1]);
          initialZoom = currentViewMode === "cubenet" ? zoom2D : cubeSize / 300;
        }
      }, { passive: true });
      
      rightPanel.addEventListener("touchmove", function(e) {
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
        const controls = document.getElementById("controls");
        const container = document.getElementById("container");
        controls.classList.toggle("open");
        container.classList.toggle("controls-open");
        saveSidebarState();
      }

      function saveSidebarState() {
        const controls = document.getElementById("controls");
        localStorage.setItem('sidebarOpen', controls.classList.contains('open'));
      }

      function loadSidebarState() {
        try {
          const saved = localStorage.getItem('sidebarOpen');
          if (saved === 'true') {
            const controls = document.getElementById("controls");
            const container = document.getElementById("container");
            controls.classList.add('open');
            container.classList.add('controls-open');
          }
        } catch (e) {}
      }
      


      // Modal functions
      function openInstructionsModal() {
        document.getElementById("instructionsModal").style.display = "block";
        
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
        document.getElementById("instructionsModal").style.display = "none";
      }

      function tryExample(jsonExample) {
        closeInstructionsModal();
        document.getElementById('customConfig').value = jsonExample;
        loadCustomConfig();
      }

      const examples = <?php echo json_encode($examples); ?>;
      const examplesRaw = <?php 
        $rawExamples = [];
        foreach ($examples as $file => $content) {
          $rawExamples[$file] = file_get_contents($examplesDir . $file);
        }
        echo json_encode($rawExamples);
      ?>;

      function loadExample() {
        const select = document.getElementById('exampleSelect');
        const filename = select.value;
        if (!filename) return;
        
        const rawContent = examplesRaw[filename];
        if (rawContent) {
          document.getElementById('customConfig').value = rawContent;
          loadCustomConfig();
          saveSelectedTexture(filename);
        }
      }

      function saveSelectedTexture(filename) {
        localStorage.setItem('selectedTexture', filename);
      }

      function loadSelectedTexture() {
        try {
          const saved = localStorage.getItem('selectedTexture');
          if (saved) {
            const select = document.getElementById('exampleSelect');
            select.value = saved;
            loadExample();
          }
        } catch (e) {
          loadPochmannDefault();
        }
      }

      // Close modal when clicking outside
      window.onclick = function (event) {
        const instructionsModal = document.getElementById("instructionsModal");
        const stateModal = document.getElementById("stateModal");
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
            textureMode = "unified";
            loadUnifiedConfig(defaultTexture);
          } else if (defaultTexture.mode === "face_textures") {
            textureMode = "face_textures";
            faceTextures = defaultTexture.textures || {};
            faces.forEach((face) => {
              stickerTextures[face] = Array(9).fill(0).map((_, i) => ({ face, index: i }));
            });
          }
          updateDOM();
        }
      }

      // Inicializar
      initCube();
      loadAccordionStates();
      loadSidebarState();
      
      // Check for config in URL hash first
      if (window.location.hash) {
        try {
          const base64 = window.location.hash.slice(1);
          const json = atob(base64);
          const config = JSON.parse(json);
          document.getElementById('customConfig').value = json;
          document.getElementById('exampleSelect').selectedIndex = 0;
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
      try {
        const savedViewMode = localStorage.getItem('viewMode') || 'perspective';
        setViewMode(savedViewMode);
      } catch (e) {
        setViewMode('perspective');
      }
      
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
      
      // Unified texture system functions
      function loadUnifiedConfig(config) {
        textureLibrary = config.textures || {};
        cubeAssignments = config.cube || {};
        
        // Initialize texture arrays if needed
        if (!stickerTextures.U || stickerTextures.U.length === 0) {
          faces.forEach((face) => {
            stickerTextures[face] = Array(9).fill(0).map((_, i) => ({ face, index: i }));
          });
        }
      }
      
      function applyUnifiedTexture(sticker, face, index) {
        sticker.style.background = "";
        sticker.style.backgroundImage = "";
        sticker.style.backgroundSize = "";
        sticker.style.backgroundPosition = "";
        sticker.style.backgroundRepeat = "";
        
        const stickerId = cubeState[face][index];
        const originalFace = faces[Math.floor(stickerId / 9)];
        const originalIndex = stickerId % 9;
        const originalKey = originalFace + originalIndex;
        
        const stickerAssignment = cubeAssignments[originalKey];
        const faceAssignment = cubeAssignments[originalFace];
        
        // Array notation = inheritance (sprite-based with overlay)
        if (Array.isArray(stickerAssignment)) {
          const layers = [];
          const sizes = [];
          const positions = [];
          const repeats = [];
          
          // Determine base and overlay based on array length
          let baseTexture, overlayTexture;
          
          if (stickerAssignment.length === 1) {
            // ["overlay"] - use face assignment as base, array item as overlay
            overlayTexture = stickerAssignment[0];
            if (faceAssignment) {
              baseTexture = faceAssignment;
            }
          } else if (stickerAssignment.length >= 2) {
            // ["base", "overlay"] - first item is base (replaces face), second is overlay
            baseTexture = stickerAssignment[0];
            overlayTexture = stickerAssignment[1];
          }
          
          // Add overlay first (top layer)
          if (overlayTexture) {
            const overlay = resolveTexture(overlayTexture);
            if (overlay) {
              if (typeof overlay === 'string') {
                layers.push(overlay);
                sizes.push('auto');
                positions.push('center');
                repeats.push('no-repeat');
              } else if (overlay && typeof overlay === 'object') {
                if (overlay.background) {
                  layers.push(overlay.background);
                } else if (overlay.backgroundImage) {
                  layers.push(overlay.backgroundImage);
                }
                sizes.push(overlay.backgroundSize || 'auto');
                positions.push(overlay.backgroundPosition || 'center');
                repeats.push(overlay.backgroundRepeat || 'no-repeat');
              }
            }
          }
          
          // Add base texture (bottom layer)
          if (baseTexture) {
            const base = resolveTexture(baseTexture);
            if (base) {
              if (typeof base === 'string') {
                // Convert solid colors to linear-gradient for backgroundImage compatibility
                if (base.startsWith('#') || base.startsWith('rgb') || (!base.includes('(') && !base.includes('url'))) {
                  layers.push(`linear-gradient(${base}, ${base})`);
                } else {
                  layers.push(base);
                }
                sizes.push('auto');
                positions.push('center');
                repeats.push('no-repeat');
              } else if (base && typeof base === 'object') {
                if (base.backgroundImage) {
                  // Sprite texture
                  const row = Math.floor(originalIndex / 3);
                  const col = originalIndex % 3;
                  layers.push(base.backgroundImage);
                  sizes.push(base.backgroundSize || '300% 300%');
                  positions.push(`${col * 50}% ${row * 50}%`);
                  repeats.push('no-repeat');
                } else if (base.background) {
                  layers.push(base.background);
                  sizes.push(base.backgroundSize || 'auto');
                  positions.push(base.backgroundPosition || 'center');
                  repeats.push(base.backgroundRepeat || 'no-repeat');
                }
              }
            }
          }
          
          // Apply all layers
          if (layers.length > 0) {
            sticker.style.backgroundImage = layers.join(', ');
            sticker.style.backgroundSize = sizes.join(', ');
            sticker.style.backgroundPosition = positions.join(', ');
            sticker.style.backgroundRepeat = repeats.join(', ');
          }
        }
        // Individual sticker string = replacement (overrides face texture)
        else if (stickerAssignment) {
          const texture = resolveTexture(stickerAssignment);
          if (texture) applyTextureToElement(sticker, texture, originalFace, originalIndex, false);
        }
        // Face assignment = apply to all stickers on that face
        else if (faceAssignment) {
          const texture = resolveTexture(faceAssignment);
          // Check if face texture is a sprite (has backgroundImage)
          const isSprite = texture && typeof texture === 'object' && texture.backgroundImage;
          if (texture) applyTextureToElement(sticker, texture, originalFace, originalIndex, isSprite);
        }
      }
      
      function applyTextureAssignment(sticker, assignment, face, index) {
        if (Array.isArray(assignment)) {
          // Two-layer system: ["base", "overlay"]
          const [baseTexture, overlayTexture] = assignment;
          
          // Apply base texture
          const base = resolveTexture(baseTexture);
          if (base) applyTextureToElement(sticker, base, face, index);
          
          // Apply overlay as backgroundImage
          const overlay = resolveTexture(overlayTexture);
          if (overlay) {
            if (typeof overlay === 'string') {
              sticker.style.backgroundImage = overlay;
            } else if (overlay.background) {
              sticker.style.backgroundImage = overlay.background;
              if (overlay.backgroundSize) sticker.style.backgroundSize = overlay.backgroundSize;
              if (overlay.backgroundPosition) sticker.style.backgroundPosition = overlay.backgroundPosition;
              if (overlay.backgroundRepeat) sticker.style.backgroundRepeat = overlay.backgroundRepeat;
            }
          }
        } else {
          // Single texture
          const texture = resolveTexture(assignment);
          if (texture) applyTextureToElement(sticker, texture, face, index);
        }
      }
      
      function resolveTexture(textureName) {
        if (typeof textureName === 'string') {
          // "textures." prefix - lookup in library
          if (textureName.startsWith('textures.')) {
            const name = textureName.slice(9);
            return textureLibrary[name] || null;
          }
          // Variable reference - already resolved by replaceVarsInConfig
          if (textureName.startsWith('$')) {
            return textureName; // Should already be resolved, but pass through
          }
          // Inline values: colors, gradients, urls
          if (textureName.startsWith('#') || textureName.startsWith('rgb') || 
              textureName.includes('gradient') || textureName.includes('url(')) {
            return textureName;
          }
          // Invalid - not a valid reference format
          console.warn(`Invalid texture reference: "${textureName}". Use "textures.name", "$var", or inline value.`);
          return null;
        }
        return textureLibrary[textureName] || textureName;
      }
      
      function applyTextureToElement(sticker, texture, face, index, isSprite) {
        if (typeof texture === 'string') {
          sticker.style.background = texture;
        } else if (texture && typeof texture === 'object' && !Array.isArray(texture)) {
          if (texture.backgroundImage && isSprite) {
            const row = Math.floor(index / 3);
            const col = index % 3;
            sticker.style.backgroundImage = texture.backgroundImage;
            sticker.style.backgroundPosition = `${col * 50}% ${row * 50}%`;
            sticker.style.backgroundSize = texture.backgroundSize || "300% 300%";
            sticker.style.backgroundRepeat = "no-repeat";
          } else if (texture.backgroundImage) {
            sticker.style.backgroundImage = texture.backgroundImage;
            if (texture.backgroundSize) sticker.style.backgroundSize = texture.backgroundSize;
            if (texture.backgroundPosition) sticker.style.backgroundPosition = texture.backgroundPosition;
            if (texture.backgroundRepeat) sticker.style.backgroundRepeat = texture.backgroundRepeat;
          } else {
            // Apply each property individually to avoid array issues
            for (const [key, value] of Object.entries(texture)) {
              sticker.style[key] = value;
            }
          }
        }
      }
    </script>
  </body>
</html>
