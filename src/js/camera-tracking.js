// Camera Head Tracking Module
const $ = (sel) => {
  if (sel.startsWith('#')) {
    return document.getElementById(sel.slice(1));
  }
  return document.querySelector(sel);
};

export class CameraTracking {
  constructor() {
    this.enabled = false;
    this.faceMesh = null;
    this.stream = null;
    this.camera = null;
    this.calibrationCenter = { x: 160, y: 120 };
    this.isCalibrated = false;
    this.mediaPipeReady = false;
    this.faceDetected = false;
    this.lastUpdateTime = 0;
    
    this.settings = {
      sensitivityX: 60,
      sensitivityY: 40,
      offsetX: 0,
      offsetY: 0,
      bgSensitivityX: 30,
      bgSensitivityY: 30,
      sameSensitivity: false,
      sameBgSensitivity: false,
      invertX: false,
      invertY: false,
      invertBgX: false,
      invertBgY: false
    };
    
    this.onRotationChange = null;
    this.onStatusChange = null;
  }

  async loadCameras() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === 'videoinput');
      
      this.updateStatus(`Found ${videoDevices.length} cameras`);
      return videoDevices;
    } catch (e) {
      this.updateStatus('Camera permission needed');
      return [];
    }
  }

  async startCamera(deviceId = null) {
    const video = $('#cameraPreview');
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    
    try {
      let constraints = { video: { width: 320, height: 240 } };
      if (deviceId) constraints.video.deviceId = { exact: deviceId };
      
      this.updateStatus('Starting camera...');
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      video.srcObject = this.stream;
      
      if (!window.FaceMesh) await this.loadMediaPipeScripts();
      
      try {
        this.faceMesh = new FaceMesh({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
        });
        
        this.faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });
        
        this.faceMesh.onResults(this.onCameraResults.bind(this));
        this.mediaPipeReady = true;
        this.updateStatus('Face detection ready - position head and calibrate');
      } catch (e) {
        this.updateStatus('Face detection failed - camera preview only');
      }
      
      await new Promise(resolve => { video.onloadedmetadata = resolve; });
      
      this.camera = new Camera(video, {
        onFrame: async () => {
          if (this.faceMesh && this.mediaPipeReady) {
            await this.faceMesh.send({ image: video });
          }
        },
        width: 320,
        height: 240
      });
      
      this.camera.start();
      const track = this.stream.getVideoTracks()[0];
      this.updateStatus(`Active: ${track.label} - Position head and calibrate`);
    } catch (error) {
      this.mediaPipeReady = false;
      this.updateStatus('Camera error: ' + error.message);
    }
  }

  async loadMediaPipeScripts() {
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
  }

  onCameraResults(results) {
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      this.faceDetected = true;
      const landmarks = results.multiFaceLandmarks[0];
      const noseTip = landmarks[1];
      const x = noseTip.x * 320;
      const y = noseTip.y * 240;
      
      const dot = $('#headDot');
      dot.style.display = 'block';
      dot.style.left = x + 'px';
      dot.style.top = y + 'px';
      
      if (this.isCalibrated) {
        const adjustedX = x + this.settings.offsetX;
        const adjustedY = y + this.settings.offsetY;
        const deltaX = (adjustedX - this.calibrationCenter.x) / 160;
        const deltaY = (adjustedY - this.calibrationCenter.y) / 120;
        
        const rotationY = 0 - (deltaX * this.settings.sensitivityX * (this.settings.invertX ? -1 : 1));
        const rotationX = -15 + (deltaY * this.settings.sensitivityY * (this.settings.invertY ? -1 : 1));
        
        const now = Date.now();
        if (now - this.lastUpdateTime > 16) {
          if (this.onRotationChange) this.onRotationChange(rotationX, rotationY);
          this.updateBackgroundParallax(x, y);
          this.lastUpdateTime = now;
        }
      }
    } else {
      this.faceDetected = false;
      $('#headDot').style.display = 'none';
    }
  }

  calibrate() {
    if (!this.enabled) {
      this.updateStatus('Camera not enabled');
      return false;
    }
    if (!this.mediaPipeReady) {
      this.updateStatus('Face detection not ready - wait a moment');
      return false;
    }
    if (!this.faceDetected) {
      this.updateStatus('No face detected - position yourself in camera view');
      return false;
    }
    
    this.calibrationCenter = { x: 160, y: 120 };
    this.isCalibrated = true;
    this.save();
    this.updateStatus('Calibrated! Move your head to control the cube');
    return true;
  }

  updateBackgroundParallax(x, y) {
    const panel = $('#right-panel');
    const adjustedX = (x + this.settings.offsetX - this.calibrationCenter.x) / 160;
    const adjustedY = (y + this.settings.offsetY - this.calibrationCenter.y) / 120;
    const bgOffsetX = 50 - (adjustedX * this.settings.bgSensitivityX * (this.settings.invertBgX ? -1 : 1));
    const bgOffsetY = 50 - (adjustedY * this.settings.bgSensitivityY * (this.settings.invertBgY ? -1 : 1));
    panel.style.backgroundPosition = `${bgOffsetX}% ${bgOffsetY}%`;
  }

  stop() {
    if (this.camera) {
      this.camera.stop();
      this.camera = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.isCalibrated = false;
    this.mediaPipeReady = false;
    this.faceDetected = false;
  }

  save() {
    localStorage.setItem('cameraCalibration', JSON.stringify({
      calibrationCenter: this.calibrationCenter,
      isCalibrated: this.isCalibrated,
      ...this.settings
    }));
  }

  load() {
    try {
      const saved = localStorage.getItem('cameraCalibration');
      if (saved) {
        const data = JSON.parse(saved);
        this.calibrationCenter = data.calibrationCenter || { x: 160, y: 120 };
        this.isCalibrated = data.isCalibrated || false;
        Object.assign(this.settings, data);
        return true;
      }
    } catch (e) {}
    return false;
  }

  updateStatus(text) {
    if (this.onStatusChange) this.onStatusChange(text);
    const el = $('#cameraStatus');
    if (el) el.textContent = text;
  }
}
