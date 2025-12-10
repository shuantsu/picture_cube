import { BaseRenderer } from './cube-view.js';

// CubeNet Renderer - 2D flat net view
export default class CubeNetRenderer extends BaseRenderer {
  constructor(container) {
    super(container);
    this.zoom = 1;
    this.panOffset = { x: 0, y: 0 };
    this.initDOM();
  }

  initDOM() {
    this.cubeNet = document.getElementById('cube-net');
    if (!this.cubeNet) {
      this.cubeNet = document.createElement('div');
      this.cubeNet.id = 'cube-net';
      this.container.appendChild(this.cubeNet);
    }

    this.faces.forEach(face => {
      let faceElement = this.cubeNet.querySelector(`.face-2d[data-face="${face}"]`);
      if (!faceElement) {
        faceElement = document.createElement('div');
        faceElement.className = `face-2d face-${face}`;
        faceElement.setAttribute('data-face', face);
        this.cubeNet.appendChild(faceElement);
      }
      this.createStickers(faceElement);
    });
  }

  createStickers(faceElement) {
    faceElement.innerHTML = "";
    for (let i = 0; i < 9; i++) {
      const sticker = document.createElement("div");
      sticker.className = "sticker";
      faceElement.appendChild(sticker);
    }
  }

  render(cubeState, stickerRotations, stickerTextures, textureConfig) {
    this.faces.forEach(face => {
      const faceElement = this.cubeNet.querySelector(`.face-2d[data-face="${face}"]`);
      if (faceElement) {
        for (let i = 0; i < 9; i++) {
          const sticker = faceElement.children[i];
          const stickerId = cubeState[face][i];
          this.applyStickerStyle(sticker, face, i, stickerId, stickerRotations, textureConfig);
        }
      }
    });
  }

  setZoom(zoom) {
    this.zoom = zoom;
    this.updateTransform();
  }

  setPan(x, y) {
    this.panOffset = { x, y };
    this.updateTransform();
  }

  updateTransform() {
    this.cubeNet.style.transform = `translate(calc(-50% + ${this.panOffset.x}px), calc(-50% + ${this.panOffset.y}px)) scale(${this.zoom})`;
  }

  show() {
    this.cubeNet.style.display = 'grid';
  }

  hide() {
    this.cubeNet.style.display = 'none';
  }
}


