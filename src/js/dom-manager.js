// DOM Manager - Centralized DOM element access
export class DOMManager {
  constructor() {
    this.elements = {};
  }

  // Selector helper
  $(sel) {
    return sel.startsWith('#') 
      ? document.getElementById(sel.slice(1))
      : document.querySelector(sel);
  }

  // Initialize all DOM references
  init() {
    const ids = [
      'right-panel', 'controls', 'container', 'cube-net', 'cube-3d',
      'cubenetBtn', 'perspectiveBtn', 'orthographicBtn', 'crispBtn',
      'throttleBtn', 'cameraBtn', 'bluetoothBtn', 'alg', 'customConfig',
      'exampleSelect', 'historyEnabled', 'stateModal', 'instructionsModal',
      'loadingSpinner', 'toast', 'bluetoothStatus', 'cameraStatus',
      'cameraSelect', 'cameraContainer', 'cameraControls', 'cameraPreview',
      'headDot', 'historyGraph', 'historyRows', 'editor-iframe',
      'stateTab', 'rotationsTab', 'backgroundGallery',
      'sensitivityX', 'sensitivityXValue', 'sensitivityY', 'sensitivityYValue',
      'offsetX', 'offsetXValue', 'offsetY', 'offsetYValue',
      'bgSensitivityX', 'bgSensitivityXValue', 'bgSensitivityY', 'bgSensitivityYValue',
      'sameSensitivity', 'sameBgSensitivity', 'invertX', 'invertY',
      'invertBgX', 'invertBgY', 'savedStatesGrid', 'moveGrid', 'bgColorPicker'
    ];

    ids.forEach(id => {
      this.elements[id] = this.$(`#${id}`);
    });
  }

  get(id) {
    return this.elements[id];
  }
}

export const domManager = new DOMManager();
