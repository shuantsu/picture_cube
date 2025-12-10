// Bluetooth Rotation Mode Module
class BluetoothRotation {
  constructor() {
    this.rotationModeKey = ' ';
    this.rotationModeActive = false;
    this.tempRotationKey = null;
    this.load();
    this.initListeners();
  }

  initListeners() {
    document.addEventListener('keydown', (e) => {
      if (e.key === this.rotationModeKey) {
        if (window.bluetoothCube?.isConnected()) {
          this.rotationModeActive = true;
        }
      }
    });

    document.addEventListener('keyup', (e) => {
      if (e.key === this.rotationModeKey) {
        this.rotationModeActive = false;
      }
    });

    // Mobile button
    const btn = document.getElementById('rotationModeBtn');
    if (btn) {
      btn.addEventListener('touchstart', (e) => {
        if (window.bluetoothCube?.isConnected()) {
          this.rotationModeActive = true;
          btn.classList.add('active');
          e.preventDefault();
        }
      });
      btn.addEventListener('touchend', () => {
        this.rotationModeActive = false;
        btn.classList.remove('active');
      });
      btn.addEventListener('mousedown', (e) => {
        if (window.bluetoothCube?.isConnected()) {
          this.rotationModeActive = true;
          btn.classList.add('active');
          e.preventDefault();
        }
      });
      btn.addEventListener('mouseup', () => {
        this.rotationModeActive = false;
        btn.classList.remove('active');
      });
    }
  }

  convertMoveToRotation(move) {
    const map = {
      'U': 'y', "U'": "y'", 'U2': 'y2',
      'R': 'x', "R'": "x'", 'R2': 'x2',
      'F': 'z', "F'": "z'", 'F2': 'z2',
      'D': "y'", "D'": 'y', 'D2': 'y2',
      'L': "x'", "L'": 'x', 'L2': 'x2',
      'B': "z'", "B'": 'z', 'B2': 'z2'
    };
    return map[move] || move;
  }

  processMove(notation) {
    const result = this.rotationModeActive ? this.convertMoveToRotation(notation) : notation;
    console.log('Rotation mode:', this.rotationModeActive, 'Move:', notation, '->', result);
    return result;
  }

  configure() {
    this.tempRotationKey = null;
    const modal = document.getElementById('keyConfigModal');
    modal.style.display = 'block';
    document.getElementById('keyConfigMessage').textContent = 'Press any key';
    document.getElementById('keyConfigPreview').textContent = '';
    
    const keyHandler = (e) => {
      e.preventDefault();
      this.tempRotationKey = e.key;
      document.getElementById('keyConfigMessage').textContent = 'You pressed:';
      document.getElementById('keyConfigPreview').textContent = e.key === ' ' ? 'Space' : e.key;
      document.removeEventListener('keydown', keyHandler);
    };
    
    document.addEventListener('keydown', keyHandler);
  }

  confirm() {
    if (this.tempRotationKey) {
      this.rotationModeKey = this.tempRotationKey;
      this.save();
      this.updateDisplay();
      if (window.uiControls) {
        window.uiControls.showToast(`Rotation key set to: ${this.tempRotationKey === ' ' ? 'Space' : this.tempRotationKey}`);
      }
    }
    this.closeModal();
  }

  closeModal() {
    document.getElementById('keyConfigModal').style.display = 'none';
  }

  updateDisplay() {
    const display = document.getElementById('currentRotationKey');
    if (display) display.textContent = this.rotationModeKey === ' ' ? 'Space' : this.rotationModeKey;
  }

  save() {
    localStorage.setItem('rotationModeKey', this.rotationModeKey);
  }

  load() {
    const saved = localStorage.getItem('rotationModeKey');
    if (saved) this.rotationModeKey = saved;
    setTimeout(() => this.updateDisplay(), 100);
  }
}

export default BluetoothRotation;
