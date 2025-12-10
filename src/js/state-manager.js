// State Manager - Save/Load cube states
export class StateManager {
  constructor() {
    this.storageKey = 'savedCubeStates';
  }

  save(name, cubeState, stickerRotations, stickerTextures) {
    const states = this.getAll();
    states.push({
      id: Date.now(),
      name,
      date: new Date().toLocaleString(),
      cubeState: JSON.parse(JSON.stringify(cubeState)),
      stickerRotations: JSON.parse(JSON.stringify(stickerRotations)),
      stickerTextures: JSON.parse(JSON.stringify(stickerTextures))
    });
    localStorage.setItem(this.storageKey, JSON.stringify(states));
  }

  load(id) {
    return this.getAll().find(s => s.id === id);
  }

  delete(id) {
    const states = this.getAll().filter(s => s.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(states));
  }

  getAll() {
    return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
  }
}
