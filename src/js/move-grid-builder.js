// Move Grid Builder - Creates move button grid
export class MoveGridBuilder {
  constructor(domManager, applyMoveCallback) {
    this.dom = domManager;
    this.applyMove = applyMoveCallback;
  }

  build() {
    const moves = ['U', 'D', 'R', 'L', 'F', 'B', 'M', 'E', 'S', 'x', 'y', 'z', 'Rw', 'Lw', 'Uw', 'Dw', 'Fw', 'Bw'];
    const grid = this.dom.get('moveGrid');
    
    if (!grid) return;

    moves.forEach(m => {
      ['', "'", '2'].forEach(mod => {
        const move = m + mod;
        const btn = document.createElement('button');
        btn.onclick = () => this.applyMove(move);
        btn.textContent = move.replace("'", "'");
        grid.appendChild(btn);
      });
    });
  }
}
