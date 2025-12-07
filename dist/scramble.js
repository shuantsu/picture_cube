class AlgUtils {
  constructor() {
    this.possibleMoves = {
      "x": ["R", "L"],
      "y": ["U", "D"],
      "z": ["F", "B"]
    };
    this.alg = null;
  }

  applyAlg(alg) {
    this.alg = alg;
  }

  _getAxisByFace(face) {
    for (const [axis, faces] of Object.entries(this.possibleMoves)) {
      if (faces.includes(face)) {
        return axis;
      }
    }
    return null;
  }

  _getPossibleMovesWithoutOneFace(face) {
    const result = {};
    for (const [k, v] of Object.entries(this.possibleMoves)) {
      result[k] = v.filter(f => f !== face);
    }
    return result;
  }

  _selectFace(lastFaces) {
    const lastFace = lastFaces.length > 0 ? lastFaces[lastFaces.length - 1] : null;
    let axes = Object.keys(this.possibleMoves);
    const possibleMoves = this._getPossibleMovesWithoutOneFace(lastFace);
    
    if (lastFaces.length > 1) {
      const ax1 = this._getAxisByFace(lastFaces[lastFaces.length - 1]);
      const ax2 = this._getAxisByFace(lastFaces[lastFaces.length - 2]);
      if (ax1 === ax2) {
        axes = axes.filter(ax => ax !== ax1);
      }
    }
    
    const randomAxis = axes[Math.floor(Math.random() * axes.length)];
    const randomFace = possibleMoves[randomAxis][Math.floor(Math.random() * possibleMoves[randomAxis].length)];
    return randomFace;
  }

  generateScrambleAlg(moves) {
    const alg = [];
    const lastFaces = [];
    
    for (let move = 0; move < moves; move++) {
      const currentFace = this._selectFace(lastFaces);
      lastFaces.push(currentFace);
      const currentDirection = ["'", "2", ""][Math.floor(Math.random() * 3)];
      alg.push(currentFace + currentDirection);
    }
    
    this.alg = alg.join(' ');
  }

  get reversed() {
    if (this.alg === null) {
      return null;
    }
    
    const processedAlg = this.alg.split(' ').reverse();
    const finalAlg = [];
    
    for (const move of processedAlg) {
      if (move.includes("'")) {
        finalAlg.push(move.replace("'", ""));
      } else if (move.includes("2")) {
        finalAlg.push(move);
      } else {
        finalAlg.push(move + "'");
      }
    }
    
    return finalAlg.join(' ');
  }
}