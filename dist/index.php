<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Picture Cube -- Beta</title>
    <style>
      body {
        margin: 0;
        font-family: Arial, sans-serif;
      }

      #container {
        display: flex;
        height: 100vh;
      }

      #controls {
        width: 300px;
        padding: 20px;
        background: #f0f0f0;
        overflow-y: auto;
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
        margin: 5px;
        padding: 10px;
      }

      textarea {
        width: 100%;
        height: 100px;
        margin: 10px 0;
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
    </style>
    <script>
<?php
include_once('marked.min.js');
?>
    </script>
    <script>
      const defaultTexture = <?php echo json_encode(json_decode(file_get_contents('examples/5-pochman_supercube.json'), true)); ?>;
    </script>
  </head>

  <body>
    <div id="container">
      <div id="controls">
        <h3>Fundamentals: X, Y, U, Z</h3>
        <button onclick="moveU()">U</button>
        <button onclick="rotationX()">X</button>
        <button onclick="rotationY()">Y</button>
        <button onclick="rotationZ()">Z</button>
        <br />
        <button onclick="prime(moveU)()">U'</button>
        <button onclick="prime(rotationX)()">X'</button>
        <button onclick="prime(rotationY)()">Y'</button>
        <button onclick="prime(rotationZ)()">Z'</button>
        <br />
        <button onclick="double(moveU)()">U2</button>
        <button onclick="double(rotationX)()">X2</button>
        <button onclick="double(rotationY)()">Y2</button>
        <button onclick="double(rotationZ)()">Z2</button>

        <h3>Derived</h3>
        <button onclick="moveD()">D</button>
        <button onclick="moveR()">R</button>
        <button onclick="moveL()">L</button>
        <button onclick="moveF()">F</button>
        <button onclick="moveB()">B</button>
        <br />
        <button onclick="prime(moveD)()">D'</button>
        <button onclick="prime(moveR)()">R'</button>
        <button onclick="prime(moveL)()">L'</button>
        <button onclick="prime(moveF)()">F'</button>
        <button onclick="prime(moveB)()">B'</button>

        <h3>Slice Moves</h3>
        <button onclick="moveM()">M</button>
        <button onclick="moveE()">E</button>
        <button onclick="moveS()">S</button>
        <br />
        <button onclick="prime(moveM)()">M'</button>
        <button onclick="prime(moveE)()">E'</button>
        <button onclick="prime(moveS)()">S'</button>

        <h3>Wide Moves</h3>
        <button onclick="moveRw()">Rw</button>
        <button onclick="moveLw()">Lw</button>
        <button onclick="moveUw()">Uw</button>
        <button onclick="moveDw()">Dw</button>
        <button onclick="moveFw()">Fw</button>
        <button onclick="moveBw()">Bw</button>
        <br />
        <button onclick="prime(moveRw)()">Rw'</button>
        <button onclick="prime(moveLw)()">Lw'</button>
        <button onclick="prime(moveUw)()">Uw'</button>
        <button onclick="prime(moveDw)()">Dw'</button>
        <button onclick="prime(moveFw)()">Fw'</button>
        <button onclick="prime(moveBw)()">Bw'</button>

        <h3>Algorithm</h3>
        <textarea
          id="alg"
          placeholder="Enter algorithm (ex: R U R' U')"
          onkeydown="if(event.ctrlKey && event.key==='Enter') applyAlgorithm()"
        ></textarea>
        <button onclick="applyAlgorithm()">Execute</button>
        <small style="color: #666; font-style: italic"
          >Tip: Press Ctrl+Enter to execute</small
        >

        <h3>State</h3>
        <button onclick="solveCube()">Reset</button>
        <button onclick="printRotations()">View Rotations</button>
        <small style="color: #666; font-style: italic"
          >(Check the output at developer console)</small
        >

        <h3>Example Textures</h3>
        <select id="exampleSelect" onchange="loadExample()">
          <option value="">Select an example...</option>
          <?php
          $examplesDir = 'examples/';
          if (is_dir($examplesDir)) {
            $files = scandir($examplesDir);
            foreach ($files as $file) {
              if (pathinfo($file, PATHINFO_EXTENSION) === 'json') {
                $name = pathinfo($file, PATHINFO_FILENAME);
                $selected = ($file === '5-pochman_supercube.json') ? ' selected' : '';
                echo "<option value='$file'$selected>$name</option>";
              }
            }
          }
          ?>
        </select>

        <h3>
          Custom Textures
          <a
            href="#"
            onclick="openInstructionsModal()"
            style="font-size: 14px; margin-left: 10px"
            >[Instructions]</a
          >
        </h3>
        <textarea
          id="customConfig"
          placeholder='{"mode": "face_textures", "textures": {"U": {"background": "linear-gradient(45deg, red, yellow)"}}}'
        ></textarea>
        <button onclick="loadCustomConfig()">Apply Textures</button>

        <h3>Visualization</h3>
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

      <div id="right-panel">
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

      let currentViewMode = "cubenet";
      let cubeRotation = { x: -25, y: -45 };
      let cubeSize = 300;
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

        if (
          textureMode === "face_textures" &&
          stickerTextures[face] &&
          stickerTextures[face][index]
        ) {
          const textureInfo = stickerTextures[face][index];
          const originalFace = textureInfo.face;
          const originalIndex = textureInfo.index;

          const texture = faceTextures[originalFace];
          const centerTexture = faceTextures[originalFace + "_center"];

          if (originalIndex === 4 && centerTexture) {
            Object.assign(sticker.style, centerTexture);
          } else if (texture) {
            if (texture.backgroundImage) {
              // Standard backgroundImage handling
              const row = Math.floor(originalIndex / 3);
              const col = originalIndex % 3;
              sticker.style.backgroundImage = texture.backgroundImage;
              sticker.style.backgroundPosition = `${col * 50}% ${row * 50}%`;
              sticker.style.backgroundSize = "300% 300%";
              sticker.style.backgroundRepeat = "no-repeat";
            } else {
              Object.assign(sticker.style, texture);
            }
          }
        } else if (textureMode === "custom_indices") {
          const style = customStickers[stickerId];
          if (style) Object.assign(sticker.style, style);
        } else {
          const colorIndex = Math.floor(stickerId / 9);
          sticker.style.backgroundColor = colors[colorIndex];
        }

        // Hide indices when custom textures are active
        if (
          textureMode === "face_textures" ||
          textureMode === "custom_indices"
        ) {
          sticker.innerHTML = "";
        } else {
          sticker.innerHTML = `<u>${stickerId}</u>`;
        }

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
      }

      function update2DZoom() {
        const cubeNet = document.getElementById("cube-net");
        cubeNet.style.transform = `translate(calc(-50% + ${panOffset.x}px), calc(-50% + ${panOffset.y}px)) scale(${zoom2D})`;
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

      // SLICE MOVES
      const moveM = () => {
        prime(moveL)();
        moveR();
        prime(rotationX)();
      };
      
      const moveE = () => {
        prime(rotationZ)();
        moveM();
        rotationZ();
      };
      
      const moveS = () => {
        rotationY();
        moveM();
        prime(rotationY)();
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
          x: rotationX,
          y: rotationY,
          z: rotationZ,
          "U'": prime(moveU),
          "D'": prime(moveD),
          "R'": prime(moveR),
          "L'": prime(moveL),
          "F'": prime(moveF),
          "B'": prime(moveB),
          "M'": prime(moveM),
          "E'": prime(moveE),
          "S'": prime(moveS),
          "Rw'": prime(moveRw),
          "Lw'": prime(moveLw),
          "Uw'": prime(moveUw),
          "Dw'": prime(moveDw),
          "Fw'": prime(moveFw),
          "Bw'": prime(moveBw),
          "x'": prime(rotationX),
          "y'": prime(rotationY),
          "z'": prime(rotationZ),
          U2: double(moveU),
          D2: double(moveD),
          R2: double(moveR),
          L2: double(moveL),
          F2: double(moveF),
          B2: double(moveB),
          M2: double(moveM),
          E2: double(moveE),
          S2: double(moveS),
          Rw2: double(moveRw),
          Lw2: double(moveLw),
          Uw2: double(moveUw),
          Dw2: double(moveDw),
          Fw2: double(moveFw),
          Bw2: double(moveBw),
          x2: double(rotationX),
          y2: double(rotationY),
          z2: double(rotationZ),
        };

        if (moves[move]) moves[move]();
      }

      function applyAlgorithm() {
        const alg = document.getElementById("alg").value.trim();
        if (!alg) return;
        const moves = alg.split(/\s+/);
        moves.forEach((move) => applyMove(move));
      }

      function solveCube() {
        textureMode = "standard";
        initCube();
      }

      function loadCustomConfig() {
        try {
          const config = JSON.parse(
            document.getElementById("customConfig").value
          );

          if (config.mode === "face_textures") {
            textureMode = "face_textures";
            faceTextures = config.textures || {};
            // Reinitialize textures if needed
            if (!stickerTextures.U || stickerTextures.U.length === 0) {
              faces.forEach((face, faceIndex) => {
                stickerTextures[face] = Array(9)
                  .fill(0)
                  .map((_, i) => ({ face, index: i }));
              });
            }
          } else if (config.mode === "custom_indices") {
            textureMode = "custom_indices";
            customStickers = config.stickers || {};
          }

          updateDOM();
        } catch (error) {
          alert("JSON Error: " + error.message);
        }
      }

      function printRotations() {
        let total = 0;
        faces.forEach((face) => {
          stickerRotations[face].forEach((rot) => (total += rot));
        });
        console.log("Total rotations:", total);
        console.log(
          "Rotations per face:",
          JSON.stringify(stickerRotations, null, 2)
        );
      }

      // Event listeners
      const rightPanel = document.getElementById("right-panel");
      rightPanel.addEventListener("mousedown", handleMouseDown);
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      rightPanel.addEventListener("wheel", handleWheel, { passive: false });

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

      function loadExample() {
        const select = document.getElementById('exampleSelect');
        const filename = select.value;
        if (!filename) return;
        
        fetch(`examples/${filename}`)
          .then(response => response.json())
          .then(config => {
            document.getElementById('customConfig').value = JSON.stringify(config, null, 2);
            loadCustomConfig();
          })
          .catch(error => {
            alert('Error loading example: ' + error.message);
          });
      }

      // Close modal when clicking outside
      window.onclick = function (event) {
        const modal = document.getElementById("instructionsModal");
        if (event.target === modal) {
          closeInstructionsModal();
        }
      };



      // Inicializar
      initCube();
      
      // Load default texture
      if (defaultTexture) {
        textureMode = defaultTexture.mode;
        if (defaultTexture.mode === "face_textures") {
          faceTextures = defaultTexture.textures || {};
          faces.forEach((face, faceIndex) => {
            stickerTextures[face] = Array(9)
              .fill(0)
              .map((_, i) => ({ face, index: i }));
          });
        }
        updateDOM();
      }
      
      setViewMode("perspective");
    </script>
  </body>
</html>
