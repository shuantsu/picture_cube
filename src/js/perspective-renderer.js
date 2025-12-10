import { BaseRenderer } from './cube-view.js';

// Perspective Renderer - 3D perspective view
export default class PerspectiveRenderer extends BaseRenderer {
  constructor(container) {
    super(container);
    this.rotation = { x: -25, y: -45 };
    this.cubeSize = 300;
    this.initDOM();
  }

  initDOM() {
    this.wrapper = document.getElementById('cube-3d-wrapper');
    if (!this.wrapper) {
      this.wrapper = document.createElement('div');
      this.wrapper.id = 'cube-3d-wrapper';
      this.container.appendChild(this.wrapper);
    }

    this.cube3D = document.getElementById('cube-3d');
    if (!this.cube3D) {
      this.cube3D = document.createElement('div');
      this.cube3D.id = 'cube-3d';
      this.wrapper.appendChild(this.cube3D);
    }

    this.faces.forEach(face => {
      let faceElement = this.cube3D.querySelector(`.face-3d[data-face="${face}"]`);
      if (!faceElement) {
        faceElement = document.createElement('div');
        faceElement.className = `face-3d face-${face}`;
        faceElement.setAttribute('data-face', face);
        this.cube3D.appendChild(faceElement);
      }
      this.createStickers(faceElement);
    });

    this.wrapper.classList.add('perspective');
    document.body.classList.add('is-3d');
  }

  createStickers(faceElement) {
    faceElement.innerHTML = "";
    for (let i = 0; i < 9; i++) {
      const sticker = document.createElement("div");
      sticker.className = "sticker-3d";
      faceElement.appendChild(sticker);
    }
  }

  render(cubeState, stickerRotations, stickerTextures, textureConfig) {
    this.faces.forEach(face => {
      const faceElement = this.cube3D.querySelector(`.face-3d[data-face="${face}"]`);
      if (faceElement) {
        for (let i = 0; i < 9; i++) {
          const sticker = faceElement.children[i];
          const stickerId = cubeState[face][i];
          this.applyStickerStyle(sticker, face, i, stickerId, stickerRotations, textureConfig);
        }
      }
    });
  }

  setRotation(x, y) {
    this.rotation = { x, y };
    this.updateTransform();
  }

  setSize(size) {
    this.cubeSize = size;
    document.documentElement.style.setProperty('--cube-size', `${size}px`);
    const fontSize = Math.max(8, Math.min(32, (size / 300) * 16));
    document.documentElement.style.setProperty('--font-size-3d', `${fontSize}px`);
  }

  updateTransform() {
    this.cube3D.style.transform = `
      translate(-50%, -50%)
      rotateX(${this.rotation.x}deg)
      rotateY(${this.rotation.y}deg)
    `;
  }

  show() {
    this.wrapper.style.display = 'block';
    this.wrapper.classList.add('perspective');
    document.body.classList.add('is-3d');
  }

  hide() {
    this.wrapper.style.display = 'none';
  }
}


