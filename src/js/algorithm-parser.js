// Algorithm Parser and Executor
class AlgorithmParser {
  constructor(cubeCore) {
    this.cubeCore = cubeCore;
  }

  parse(algString) {
    let alg = algString.trim();
    if (!alg) return [];
    
    alg = alg.replace(/'/g, "'");
    alg = alg.replace(/\/\/.*$/gm, '');
    alg = alg.replace(/\/\*[\s\S]*?\*\//g, '');
    alg = alg.replace(/\)\(/g, ' ');
    alg = alg.replace(/[()]/g, '');
    
    return alg.trim().split(/\s+/).filter(move => move.length > 0);
  }

  execute(algString, trackHistory = true, historyCallback = null) {
    const moves = this.parse(algString);
    if (moves.length === 0) return 0;
    
    if (moves.length <= 50) {
      moves.forEach(move => {
        this.cubeCore.applyMove(move);
        if (trackHistory && historyCallback) historyCallback(move);
      });
    } else {
      moves.forEach(move => this.cubeCore.applyMove(move));
      if (trackHistory && historyCallback) {
        historyCallback(`ALG (${moves.length} moves)`);
      }
    }
    
    return moves.length;
  }
}
