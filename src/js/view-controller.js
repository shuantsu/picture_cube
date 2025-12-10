// View Controller - Manages view modes and rendering
import CubeNetRenderer from './cubenet-renderer.js';
import PerspectiveRenderer from './perspective-renderer.js';
import IsometricRenderer from './isometric-renderer.js';
import { CubeView } from './cube-view.js';
import { EditorBridge } from './editor-bridge.js';


export class ViewController {
  constructor(domManager) {
    this.dom = domManager;
    this.currentViewMode = 'cubenet';
    this.cubeRotation = { x: -25, y: -45 };
    this.cubeSize = window.innerWidth <= 480 ? 230 : 350;
    this.zoom2D = 1;
    this.panOffset = { x: 0, y: 0 };
    this.cubeView = null;
    this.currentRenderer = null;
    this.cameraRotationEnabled = true;
  }

  setViewMode(mode) {
    this.currentViewMode = mode;
    localStorage.setItem('viewMode', mode);

    try {
      if (this.currentRenderer?.hide) this.currentRenderer.hide();

      const panel = this.dom.get('right-panel');
      if (!panel) {
        setTimeout(() => this.setViewMode(mode), 100);
        return;
      }

      const rendererMap = {
        cubenet: () => {
          this.currentRenderer = new CubeNetRenderer(panel);
          this.currentRenderer.setZoom(this.zoom2D);
          this.currentRenderer.setPan(this.panOffset.x, this.panOffset.y);
          this.updateButtons('cubenet');
        },
        perspective: () => {
          this.currentRenderer = new PerspectiveRenderer(panel);
          this.currentRenderer.setRotation(this.cubeRotation.x, this.cubeRotation.y);
          this.currentRenderer.setSize(this.cubeSize);
          this.updateButtons('perspective');
        },
        orthographic: () => {
          this.currentRenderer = new IsometricRenderer(panel);
          this.currentRenderer.setRotation(this.cubeRotation.x, this.cubeRotation.y);
          this.currentRenderer.setSize(this.cubeSize);
          this.updateButtons('orthographic');
        }
      };

      rendererMap[mode]?.();
      this.currentRenderer.show();
      this.cubeView = new CubeView(panel, this.currentRenderer);
    } catch (e) {
      console.error('setViewMode failed:', e);
      this.currentRenderer = null;
      this.cubeView = null;
    }
  }

  updateButtons(mode) {
    const buttons = {
      cubenet: this.dom.get('cubenetBtn'),
      perspective: this.dom.get('perspectiveBtn'),
      orthographic: this.dom.get('orthographicBtn')
    };
    Object.entries(buttons).forEach(([key, btn]) => {
      if (btn) btn.disabled = (key === mode);
    });
    if (window.editorOpen && mode !== 'cubenet') {
      buttons.cubenet.disabled = true;
    }
  }

  updateCubeRotation() {
    if (this.cubeView && this.currentRenderer?.setRotation) {
      this.cubeView.setRotation(this.cubeRotation.x, this.cubeRotation.y);
    }
    this.saveViewState();
  }

  update2DZoom() {
    if (this.cubeView && this.currentRenderer?.setZoom) {
      this.cubeView.setZoom(this.zoom2D);
      this.cubeView.setPan(this.panOffset.x, this.panOffset.y);
    }
    this.saveViewState();
  }

  handleDrag(delta) {
    if (this.currentViewMode === 'cubenet') {
      this.panOffset.x += delta.x;
      this.panOffset.y += delta.y;
      this.update2DZoom();
    } else {
      if (!this.cameraRotationEnabled) return;
      this.cubeRotation.x -= delta.y * 0.5;
      this.cubeRotation.y += delta.x * 0.5;
      this.cubeRotation.x = Math.max(-90, Math.min(90, this.cubeRotation.x));
      this.updateCubeRotation();
    }
  }

  handleZoom(delta) {
    if (this.currentViewMode === 'cubenet') {
      this.zoom2D = Math.max(0.5, Math.min(3, this.zoom2D * (1 - delta * 0.1)));
      this.update2DZoom();
    } else {
      this.cubeSize = Math.max(200, Math.min(800, this.cubeSize * (1 - delta * 0.1)));
      this.updateCubeSize();
    }
  }

  handlePinchZoom(initialZoom, scale) {
    if (this.currentViewMode === 'cubenet') {
      this.zoom2D = Math.max(0.5, Math.min(3, initialZoom * scale));
      this.update2DZoom();
    } else {
      this.cubeSize = Math.max(200, Math.min(800, initialZoom * scale * 300));
      this.updateCubeSize();
    }
  }

  getCurrentZoom() {
    return this.currentViewMode === 'cubenet' ? this.zoom2D : this.cubeSize / 300;
  }

  updateCubeSize() {
    const fontSize = Math.max(8, Math.min(32, (this.cubeSize / 300) * 16));
    document.documentElement.style.setProperty('--cube-size', `${this.cubeSize}px`);
    document.documentElement.style.setProperty('--font-size-3d', `${fontSize}px`);
    this.saveViewState();
  }

  saveViewState() {
    localStorage.setItem('cubeViewState', JSON.stringify({
      cubeRotation: this.cubeRotation,
      zoom2D: this.zoom2D,
      panOffset: this.panOffset,
      cubeSize: this.cubeSize
    }));
  }

  loadViewState() {
    try {
      const saved = localStorage.getItem('cubeViewState');
      if (saved) {
        const state = JSON.parse(saved);
        this.cubeRotation = state.cubeRotation || this.cubeRotation;
        this.zoom2D = state.zoom2D || this.zoom2D;
        this.panOffset = state.panOffset || this.panOffset;
        this.cubeSize = state.cubeSize || this.cubeSize;

        if (this.currentViewMode === 'cubenet') {
          this.update2DZoom();
        } else {
          this.updateCubeSize();
          this.updateCubeRotation();
        }
      }
    } catch (e) {}
  }
}
