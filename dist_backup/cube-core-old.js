// Cube Core - Isolated cube logic for performance testing
class CubeCore {
  constructor() {
    this.faces = ["U", "L", "F", "R", "B", "D"];
    this.cubeState = { U: [], L: [], F: [], R: [], B: [], D: [] };
    this.stickerRotations = { U: [], L: [], F: [], R: [], B: [], D: [] };
    this.stickerTextures = { U: [], L: [], F: [], R: [], B: [], D: [] };
    this.init();
  }

  init() {
    this.faces.forEach((face, faceIndex) => {
      this.cubeState[face] = Array(9).fill(0).map((_, i) => faceIndex * 9 + i);
      this.stickerRotations[face] = Array(9).fill(0);
      this.stickerTextures[face] = Array(9).fill(0).map((_, i) => ({ face, index: i }));
    });
  }

  applyStickerRotation(face, index, rotationIncrement) {
    this.stickerRotations[face][index] = (this.stickerRotations[face][index] + rotationIncrement + 4) % 4;
  }

  rotateFaceDataCW(faceData) {
    return [faceData[6], faceData[3], faceData[0], faceData[7], faceData[4], faceData[1], faceData[8], faceData[5], faceData[2]];
  }

  rotateFaceDataCCW(faceData) {
    return [faceData[2], faceData[5], faceData[8], faceData[1], faceData[4], faceData[7], faceData[0], faceData[3], faceData[6]];
  }

  rotateFaceData180(faceData) {
    return [faceData[8], faceData[7], faceData[6], faceData[5], faceData[4], faceData[3], faceData[2], faceData[1], faceData[0]];
  }

  moveU() {
    this.cubeState.U = this.rotateFaceDataCW(this.cubeState.U);
    this.stickerRotations.U = this.rotateFaceDataCW(this.stickerRotations.U);
    this.stickerTextures.U = this.rotateFaceDataCW(this.stickerTextures.U);
    for (let i = 0; i < 9; i++) this.applyStickerRotation("U", i, 1);

    const temp = [this.cubeState.F[0], this.cubeState.F[1], this.cubeState.F[2]];
    const tempRot = [this.stickerRotations.F[0], this.stickerRotations.F[1], this.stickerRotations.F[2]];
    const tempTex = [this.stickerTextures.F[0], this.stickerTextures.F[1], this.stickerTextures.F[2]];

    this.cubeState.F[0] = this.cubeState.R[0];
    this.cubeState.F[1] = this.cubeState.R[1];
    this.cubeState.F[2] = this.cubeState.R[2];
    this.stickerRotations.F[0] = this.stickerRotations.R[0];
    this.stickerRotations.F[1] = this.stickerRotations.R[1];
    this.stickerRotations.F[2] = this.stickerRotations.R[2];
    this.stickerTextures.F[0] = this.stickerTextures.R[0];
    this.stickerTextures.F[1] = this.stickerTextures.R[1];
    this.stickerTextures.F[2] = this.stickerTextures.R[2];

    this.cubeState.R[0] = this.cubeState.B[0];
    this.cubeState.R[1] = this.cubeState.B[1];
    this.cubeState.R[2] = this.cubeState.B[2];
    this.stickerRotations.R[0] = this.stickerRotations.B[0];
    this.stickerRotations.R[1] = this.stickerRotations.B[1];
    this.stickerRotations.R[2] = this.stickerRotations.B[2];
    this.stickerTextures.R[0] = this.stickerTextures.B[0];
    this.stickerTextures.R[1] = this.stickerTextures.B[1];
    this.stickerTextures.R[2] = this.stickerTextures.B[2];

    this.cubeState.B[0] = this.cubeState.L[0];
    this.cubeState.B[1] = this.cubeState.L[1];
    this.cubeState.B[2] = this.cubeState.L[2];
    this.stickerRotations.B[0] = this.stickerRotations.L[0];
    this.stickerRotations.B[1] = this.stickerRotations.L[1];
    this.stickerRotations.B[2] = this.stickerRotations.L[2];
    this.stickerTextures.B[0] = this.stickerTextures.L[0];
    this.stickerTextures.B[1] = this.stickerTextures.L[1];
    this.stickerTextures.B[2] = this.stickerTextures.L[2];

    this.cubeState.L[0] = temp[0];
    this.cubeState.L[1] = temp[1];
    this.cubeState.L[2] = temp[2];
    this.stickerRotations.L[0] = tempRot[0];
    this.stickerRotations.L[1] = tempRot[1];
    this.stickerRotations.L[2] = tempRot[2];
    this.stickerTextures.L[0] = tempTex[0];
    this.stickerTextures.L[1] = tempTex[1];
    this.stickerTextures.L[2] = tempTex[2];
  }

  rotationX() {
    const temp = this.cubeState.U;
    const tempRot = [...this.stickerRotations.U];
    const tempTex = [...this.stickerTextures.U];

    this.cubeState.U = this.cubeState.F;
    this.stickerRotations.U = [...this.stickerRotations.F];
    this.stickerTextures.U = [...this.stickerTextures.F];

    this.cubeState.F = this.cubeState.D;
    this.stickerRotations.F = [...this.stickerRotations.D];
    this.stickerTextures.F = [...this.stickerTextures.D];

    this.cubeState.D = this.rotateFaceData180(this.cubeState.B);
    this.stickerRotations.D = this.rotateFaceData180(this.stickerRotations.B);
    this.stickerTextures.D = this.rotateFaceData180(this.stickerTextures.B);
    for (let i = 0; i < 9; i++) this.applyStickerRotation("D", i, 2);

    this.cubeState.B = this.rotateFaceData180(temp);
    this.stickerRotations.B = this.rotateFaceData180(tempRot);
    this.stickerTextures.B = this.rotateFaceData180(tempTex);
    for (let i = 0; i < 9; i++) this.applyStickerRotation("B", i, 2);

    this.cubeState.L = this.rotateFaceDataCCW(this.cubeState.L);
    this.stickerRotations.L = this.rotateFaceDataCCW(this.stickerRotations.L);
    this.stickerTextures.L = this.rotateFaceDataCCW(this.stickerTextures.L);
    for (let i = 0; i < 9; i++) this.applyStickerRotation("L", i, -1);

    this.cubeState.R = this.rotateFaceDataCW(this.cubeState.R);
    this.stickerRotations.R = this.rotateFaceDataCW(this.stickerRotations.R);
    this.stickerTextures.R = this.rotateFaceDataCW(this.stickerTextures.R);
    for (let i = 0; i < 9; i++) this.applyStickerRotation("R", i, 1);
  }

  rotationY() {
    const temp = this.cubeState.F;
    const tempRot = [...this.stickerRotations.F];
    const tempTex = [...this.stickerTextures.F];

    this.cubeState.F = this.cubeState.R;
    this.stickerRotations.F = [...this.stickerRotations.R];
    this.stickerTextures.F = [...this.stickerTextures.R];

    this.cubeState.R = this.cubeState.B;
    this.stickerRotations.R = [...this.stickerRotations.B];
    this.stickerTextures.R = [...this.stickerTextures.B];

    this.cubeState.B = this.cubeState.L;
    this.stickerRotations.B = [...this.stickerRotations.L];
    this.stickerTextures.B = [...this.stickerTextures.L];

    this.cubeState.L = temp;
    this.stickerRotations.L = tempRot;
    this.stickerTextures.L = tempTex;

    this.cubeState.U = this.rotateFaceDataCW(this.cubeState.U);
    this.stickerRotations.U = this.rotateFaceDataCW(this.stickerRotations.U);
    this.stickerTextures.U = this.rotateFaceDataCW(this.stickerTextures.U);
    for (let i = 0; i < 9; i++) this.applyStickerRotation("U", i, 1);

    this.cubeState.D = this.rotateFaceDataCCW(this.cubeState.D);
    this.stickerRotations.D = this.rotateFaceDataCCW(this.stickerRotations.D);
    this.stickerTextures.D = this.rotateFaceDataCCW(this.stickerTextures.D);
    for (let i = 0; i < 9; i++) this.applyStickerRotation("D", i, -1);
  }

  rotationZ() {
    this.repeat(this.rotationY.bind(this), 3);
    this.rotationX();
    this.rotationY();
  }

  repeat(fn, times) {
    for (let i = 0; i < times; i++) fn();
  }

  prime(fn) {
    return () => this.repeat(fn, 3);
  }

  double(fn) {
    return () => this.repeat(fn, 2);
  }

  // Derived moves
  moveD() { this.double(this.rotationX.bind(this))(); this.moveU(); this.double(this.rotationX.bind(this))(); }
  moveR() { this.prime(this.rotationZ.bind(this))(); this.moveU(); this.rotationZ(); }
  moveL() { this.rotationZ(); this.moveU(); this.prime(this.rotationZ.bind(this))(); }
  moveF() { this.rotationX(); this.moveU(); this.prime(this.rotationX.bind(this))(); }
  moveB() { this.prime(this.rotationX.bind(this))(); this.moveU(); this.rotationX(); }

  moveM() {
    const temp = [this.cubeState.U[1], this.cubeState.U[4], this.cubeState.U[7]];
    const tempRot = [this.stickerRotations.U[1], this.stickerRotations.U[4], this.stickerRotations.U[7]];
    const tempTex = [this.stickerTextures.U[1], this.stickerTextures.U[4], this.stickerTextures.U[7]];

    this.cubeState.U[1] = this.cubeState.B[7]; this.cubeState.U[4] = this.cubeState.B[4]; this.cubeState.U[7] = this.cubeState.B[1];
    this.stickerRotations.U[1] = (this.stickerRotations.B[7] + 2) % 4; this.stickerRotations.U[4] = (this.stickerRotations.B[4] + 2) % 4; this.stickerRotations.U[7] = (this.stickerRotations.B[1] + 2) % 4;
    this.stickerTextures.U[1] = this.stickerTextures.B[7]; this.stickerTextures.U[4] = this.stickerTextures.B[4]; this.stickerTextures.U[7] = this.stickerTextures.B[1];

    this.cubeState.B[7] = this.cubeState.D[1]; this.cubeState.B[4] = this.cubeState.D[4]; this.cubeState.B[1] = this.cubeState.D[7];
    this.stickerRotations.B[7] = (this.stickerRotations.D[1] + 2) % 4; this.stickerRotations.B[4] = (this.stickerRotations.D[4] + 2) % 4; this.stickerRotations.B[1] = (this.stickerRotations.D[7] + 2) % 4;
    this.stickerTextures.B[7] = this.stickerTextures.D[1]; this.stickerTextures.B[4] = this.stickerTextures.D[4]; this.stickerTextures.B[1] = this.stickerTextures.D[7];

    this.cubeState.D[1] = this.cubeState.F[1]; this.cubeState.D[4] = this.cubeState.F[4]; this.cubeState.D[7] = this.cubeState.F[7];
    this.stickerRotations.D[1] = this.stickerRotations.F[1]; this.stickerRotations.D[4] = this.stickerRotations.F[4]; this.stickerRotations.D[7] = this.stickerRotations.F[7];
    this.stickerTextures.D[1] = this.stickerTextures.F[1]; this.stickerTextures.D[4] = this.stickerTextures.F[4]; this.stickerTextures.D[7] = this.stickerTextures.F[7];

    this.cubeState.F[1] = temp[0]; this.cubeState.F[4] = temp[1]; this.cubeState.F[7] = temp[2];
    this.stickerRotations.F[1] = tempRot[0]; this.stickerRotations.F[4] = tempRot[1]; this.stickerRotations.F[7] = tempRot[2];
    this.stickerTextures.F[1] = tempTex[0]; this.stickerTextures.F[4] = tempTex[1]; this.stickerTextures.F[7] = tempTex[2];
  }

  moveMPrime() {
    const temp = [this.cubeState.U[1], this.cubeState.U[4], this.cubeState.U[7]];
    const tempRot = [this.stickerRotations.U[1], this.stickerRotations.U[4], this.stickerRotations.U[7]];
    const tempTex = [this.stickerTextures.U[1], this.stickerTextures.U[4], this.stickerTextures.U[7]];

    this.cubeState.U[1] = this.cubeState.F[1]; this.cubeState.U[4] = this.cubeState.F[4]; this.cubeState.U[7] = this.cubeState.F[7];
    this.stickerRotations.U[1] = this.stickerRotations.F[1]; this.stickerRotations.U[4] = this.stickerRotations.F[4]; this.stickerRotations.U[7] = this.stickerRotations.F[7];
    this.stickerTextures.U[1] = this.stickerTextures.F[1]; this.stickerTextures.U[4] = this.stickerTextures.F[4]; this.stickerTextures.U[7] = this.stickerTextures.F[7];

    this.cubeState.F[1] = this.cubeState.D[1]; this.cubeState.F[4] = this.cubeState.D[4]; this.cubeState.F[7] = this.cubeState.D[7];
    this.stickerRotations.F[1] = this.stickerRotations.D[1]; this.stickerRotations.F[4] = this.stickerRotations.D[4]; this.stickerRotations.F[7] = this.stickerRotations.D[7];
    this.stickerTextures.F[1] = this.stickerTextures.D[1]; this.stickerTextures.F[4] = this.stickerTextures.D[4]; this.stickerTextures.F[7] = this.stickerTextures.D[7];

    this.cubeState.D[1] = this.cubeState.B[7]; this.cubeState.D[4] = this.cubeState.B[4]; this.cubeState.D[7] = this.cubeState.B[1];
    this.stickerRotations.D[1] = (this.stickerRotations.B[7] + 2) % 4; this.stickerRotations.D[4] = (this.stickerRotations.B[4] + 2) % 4; this.stickerRotations.D[7] = (this.stickerRotations.B[1] + 2) % 4;
    this.stickerTextures.D[1] = this.stickerTextures.B[7]; this.stickerTextures.D[4] = this.stickerTextures.B[4]; this.stickerTextures.D[7] = this.stickerTextures.B[1];

    this.cubeState.B[7] = temp[0]; this.cubeState.B[4] = temp[1]; this.cubeState.B[1] = temp[2];
    this.stickerRotations.B[7] = (tempRot[0] + 2) % 4; this.stickerRotations.B[4] = (tempRot[1] + 2) % 4; this.stickerRotations.B[1] = (tempRot[2] + 2) % 4;
    this.stickerTextures.B[7] = tempTex[0]; this.stickerTextures.B[4] = tempTex[1]; this.stickerTextures.B[1] = tempTex[2];
  }

  moveM2() {
    const tempU = [this.cubeState.U[1], this.cubeState.U[4], this.cubeState.U[7]];
    const tempRotU = [this.stickerRotations.U[1], this.stickerRotations.U[4], this.stickerRotations.U[7]];
    const tempTexU = [this.stickerTextures.U[1], this.stickerTextures.U[4], this.stickerTextures.U[7]];

    this.cubeState.U[1] = this.cubeState.D[1]; this.cubeState.U[4] = this.cubeState.D[4]; this.cubeState.U[7] = this.cubeState.D[7];
    this.stickerRotations.U[1] = this.stickerRotations.D[1]; this.stickerRotations.U[4] = this.stickerRotations.D[4]; this.stickerRotations.U[7] = this.stickerRotations.D[7];
    this.stickerTextures.U[1] = this.stickerTextures.D[1]; this.stickerTextures.U[4] = this.stickerTextures.D[4]; this.stickerTextures.U[7] = this.stickerTextures.D[7];

    this.cubeState.D[1] = tempU[0]; this.cubeState.D[4] = tempU[1]; this.cubeState.D[7] = tempU[2];
    this.stickerRotations.D[1] = tempRotU[0]; this.stickerRotations.D[4] = tempRotU[1]; this.stickerRotations.D[7] = tempRotU[2];
    this.stickerTextures.D[1] = tempTexU[0]; this.stickerTextures.D[4] = tempTexU[1]; this.stickerTextures.D[7] = tempTexU[2];

    const tempF = [this.cubeState.F[1], this.cubeState.F[4], this.cubeState.F[7]];
    const tempRotF = [this.stickerRotations.F[1], this.stickerRotations.F[4], this.stickerRotations.F[7]];
    const tempTexF = [this.stickerTextures.F[1], this.stickerTextures.F[4], this.stickerTextures.F[7]];

    this.cubeState.F[1] = this.cubeState.B[7]; this.cubeState.F[4] = this.cubeState.B[4]; this.cubeState.F[7] = this.cubeState.B[1];
    this.stickerRotations.F[1] = (this.stickerRotations.B[7] + 2) % 4; this.stickerRotations.F[4] = (this.stickerRotations.B[4] + 2) % 4; this.stickerRotations.F[7] = (this.stickerRotations.B[1] + 2) % 4;
    this.stickerTextures.F[1] = this.stickerTextures.B[7]; this.stickerTextures.F[4] = this.stickerTextures.B[4]; this.stickerTextures.F[7] = this.stickerTextures.B[1];

    this.cubeState.B[7] = tempF[0]; this.cubeState.B[4] = tempF[1]; this.cubeState.B[1] = tempF[2];
    this.stickerRotations.B[7] = (tempRotF[0] + 2) % 4; this.stickerRotations.B[4] = (tempRotF[1] + 2) % 4; this.stickerRotations.B[1] = (tempRotF[2] + 2) % 4;
    this.stickerTextures.B[7] = tempTexF[0]; this.stickerTextures.B[4] = tempTexF[1]; this.stickerTextures.B[1] = tempTexF[2];
  }

  moveE() { this.rotationZ(); this.moveM(); this.prime(this.rotationZ.bind(this))(); }
  moveEPrime() { this.prime(this.rotationZ.bind(this))(); this.moveM(); this.rotationZ(); }
  moveE2() { this.prime(this.rotationZ.bind(this))(); this.moveM2(); this.rotationZ(); }
  moveS() { this.rotationY(); this.moveM(); this.prime(this.rotationY.bind(this))(); }
  moveSPrime() { this.prime(this.rotationY.bind(this))(); this.moveM(); this.rotationY(); }
  moveS2() { this.prime(this.rotationY.bind(this))(); this.moveM2(); this.rotationY(); }

  moveRw() { this.moveL(); this.rotationX(); }
  moveLw() { this.moveR(); this.prime(this.rotationX.bind(this))(); }
  moveUw() { this.moveD(); this.rotationY(); }
  moveDw() { this.moveU(); this.prime(this.rotationY.bind(this))(); }
  moveFw() { this.moveB(); this.rotationZ(); }
  moveBw() { this.moveF(); this.prime(this.rotationZ.bind(this))(); }

  applyMove(move) {
    const moves = {
      U: () => this.moveU(), D: () => this.moveD(), R: () => this.moveR(), L: () => this.moveL(), F: () => this.moveF(), B: () => this.moveB(),
      M: () => this.moveM(), E: () => this.moveE(), S: () => this.moveS(),
      Rw: () => this.moveRw(), Lw: () => this.moveLw(), Uw: () => this.moveUw(), Dw: () => this.moveDw(), Fw: () => this.moveFw(), Bw: () => this.moveBw(),
      r: () => this.moveRw(), l: () => this.moveLw(), u: () => this.moveUw(), d: () => this.moveDw(), f: () => this.moveFw(), b: () => this.moveBw(),
      x: () => this.rotationX(), y: () => this.rotationY(), z: () => this.rotationZ(),
      "U'": this.prime(this.moveU.bind(this)), "D'": this.prime(this.moveD.bind(this)), "R'": this.prime(this.moveR.bind(this)), "L'": this.prime(this.moveL.bind(this)), "F'": this.prime(this.moveF.bind(this)), "B'": this.prime(this.moveB.bind(this)),
      "M'": () => this.moveMPrime(), "E'": () => this.moveEPrime(), "S'": () => this.moveSPrime(),
      "Rw'": this.prime(this.moveRw.bind(this)), "Lw'": this.prime(this.moveLw.bind(this)), "Uw'": this.prime(this.moveUw.bind(this)), "Dw'": this.prime(this.moveDw.bind(this)), "Fw'": this.prime(this.moveFw.bind(this)), "Bw'": this.prime(this.moveBw.bind(this)),
      "r'": this.prime(this.moveRw.bind(this)), "l'": this.prime(this.moveLw.bind(this)), "u'": this.prime(this.moveUw.bind(this)), "d'": this.prime(this.moveDw.bind(this)), "f'": this.prime(this.moveFw.bind(this)), "b'": this.prime(this.moveBw.bind(this)),
      "x'": this.prime(this.rotationX.bind(this)), "y'": this.prime(this.rotationY.bind(this)), "z'": this.prime(this.rotationZ.bind(this)),
      U2: this.double(this.moveU.bind(this)), D2: this.double(this.moveD.bind(this)), R2: this.double(this.moveR.bind(this)), L2: this.double(this.moveL.bind(this)), F2: this.double(this.moveF.bind(this)), B2: this.double(this.moveB.bind(this)),
      M2: () => this.moveM2(), E2: () => this.moveE2(), S2: () => this.moveS2(),
      Rw2: this.double(this.moveRw.bind(this)), Lw2: this.double(this.moveLw.bind(this)), Uw2: this.double(this.moveUw.bind(this)), Dw2: this.double(this.moveDw.bind(this)), Fw2: this.double(this.moveFw.bind(this)), Bw2: this.double(this.moveBw.bind(this)),
      r2: this.double(this.moveRw.bind(this)), l2: this.double(this.moveLw.bind(this)), u2: this.double(this.moveUw.bind(this)), d2: this.double(this.moveDw.bind(this)), f2: this.double(this.moveFw.bind(this)), b2: this.double(this.moveBw.bind(this)),
      x2: this.double(this.rotationX.bind(this)), y2: this.double(this.rotationY.bind(this)), z2: this.double(this.rotationZ.bind(this))
    };
    if (moves[move]) moves[move]();
  }

  getState() {
    return {
      cubeState: JSON.parse(JSON.stringify(this.cubeState)),
      stickerRotations: JSON.parse(JSON.stringify(this.stickerRotations)),
      stickerTextures: JSON.parse(JSON.stringify(this.stickerTextures))
    };
  }

  setState(state) {
    this.cubeState = JSON.parse(JSON.stringify(state.cubeState));
    this.stickerRotations = JSON.parse(JSON.stringify(state.stickerRotations));
    this.stickerTextures = JSON.parse(JSON.stringify(state.stickerTextures));
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CubeCore;
}
