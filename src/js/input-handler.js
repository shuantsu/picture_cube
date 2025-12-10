// Input Handler - Mouse, touch, and wheel interactions
export class InputHandler {
  constructor(viewController, domManager) {
    this.viewController = viewController;
    this.dom = domManager;
    this.isDragging = false;
    this.previousPosition = { x: 0, y: 0 };
    this.initialDistance = 0;
    this.initialZoom = 1;
  }

  init() {
    const panel = this.dom.get('right-panel');
    
    panel.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    panel.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
    document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    document.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
    document.addEventListener('mouseup', () => this.handleMouseUp());
    document.addEventListener('touchend', () => this.handleTouchEnd());
    panel.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });

    // Pinch zoom
    panel.addEventListener('touchstart', (e) => this.handlePinchStart(e), { passive: false });
    panel.addEventListener('touchmove', (e) => this.handlePinchMove(e), { passive: false });
  }

  handleMouseDown(e) {
    if (e.target.id === 'right-panel' || e.target.closest('#right-panel')) {
      this.isDragging = true;
      this.previousPosition = { x: e.clientX, y: e.clientY };
      this.dom.get('right-panel').style.cursor = 'grabbing';
      e.preventDefault();
    }
  }

  handleMouseMove(e) {
    if (!this.isDragging) return;

    const delta = {
      x: e.clientX - this.previousPosition.x,
      y: e.clientY - this.previousPosition.y
    };

    this.viewController.handleDrag(delta);
    this.previousPosition = { x: e.clientX, y: e.clientY };
  }

  handleMouseUp() {
    this.isDragging = false;
    this.dom.get('right-panel').style.cursor = 'grab';
  }

  handleTouchStart(e) {
    if (e.touches.length === 1) {
      this.isDragging = true;
      const touch = e.touches[0];
      this.previousPosition = { x: touch.clientX, y: touch.clientY };
      e.preventDefault();
    }
  }

  handleTouchMove(e) {
    if (!this.isDragging || e.touches.length !== 1) return;

    const touch = e.touches[0];
    const delta = {
      x: touch.clientX - this.previousPosition.x,
      y: touch.clientY - this.previousPosition.y
    };

    this.viewController.handleDrag(delta);
    this.previousPosition = { x: touch.clientX, y: touch.clientY };
    e.preventDefault();
  }

  handleTouchEnd() {
    this.isDragging = false;
  }

  handleWheel(e) {
    if (e.target.closest('#controls')) return;
    e.preventDefault();
    
    const delta = Math.sign(e.deltaY);
    this.viewController.handleZoom(delta);
  }

  handlePinchStart(e) {
    if (e.touches.length === 2) {
      this.initialDistance = this.getTouchDistance(e.touches[0], e.touches[1]);
      this.initialZoom = this.viewController.getCurrentZoom();
    }
  }

  handlePinchMove(e) {
    if (e.touches.length === 2) {
      const currentDistance = this.getTouchDistance(e.touches[0], e.touches[1]);
      const scale = currentDistance / this.initialDistance;
      this.viewController.handlePinchZoom(this.initialZoom, scale);
    }
  }

  getTouchDistance(touch1, touch2) {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
