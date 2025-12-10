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

  moveD() {
    this.cubeState.D = this.rotateFaceDataCW(this.cubeState.D);
    this.stickerRotations.D = this.rotateFaceDataCW(this.stickerRotations.D);
    this.stickerTextures.D = this.rotateFaceDataCW(this.stickerTextures.D);
    for (let i = 0; i < 9; i++) this.applyStickerRotation("D", i, 1);
    const t = [this.cubeState.F[6], this.cubeState.F[7], this.cubeState.F[8]];
    const tR = [this.stickerRotations.F[6], this.stickerRotations.F[7], this.stickerRotations.F[8]];
    const tT = [this.stickerTextures.F[6], this.stickerTextures.F[7], this.stickerTextures.F[8]];
    this.cubeState.F[6] = this.cubeState.L[6]; this.cubeState.F[7] = this.cubeState.L[7]; this.cubeState.F[8] = this.cubeState.L[8];
    this.stickerRotations.F[6] = this.stickerRotations.L[6]; this.stickerRotations.F[7] = this.stickerRotations.L[7]; this.stickerRotations.F[8] = this.stickerRotations.L[8];
    this.stickerTextures.F[6] = this.stickerTextures.L[6]; this.stickerTextures.F[7] = this.stickerTextures.L[7]; this.stickerTextures.F[8] = this.stickerTextures.L[8];
    this.cubeState.L[6] = this.cubeState.B[6]; this.cubeState.L[7] = this.cubeState.B[7]; this.cubeState.L[8] = this.cubeState.B[8];
    this.stickerRotations.L[6] = this.stickerRotations.B[6]; this.stickerRotations.L[7] = this.stickerRotations.B[7]; this.stickerRotations.L[8] = this.stickerRotations.B[8];
    this.stickerTextures.L[6] = this.stickerTextures.B[6]; this.stickerTextures.L[7] = this.stickerTextures.B[7]; this.stickerTextures.L[8] = this.stickerTextures.B[8];
    this.cubeState.B[6] = this.cubeState.R[6]; this.cubeState.B[7] = this.cubeState.R[7]; this.cubeState.B[8] = this.cubeState.R[8];
    this.stickerRotations.B[6] = this.stickerRotations.R[6]; this.stickerRotations.B[7] = this.stickerRotations.R[7]; this.stickerRotations.B[8] = this.stickerRotations.R[8];
    this.stickerTextures.B[6] = this.stickerTextures.R[6]; this.stickerTextures.B[7] = this.stickerTextures.R[7]; this.stickerTextures.B[8] = this.stickerTextures.R[8];
    this.cubeState.R[6] = t[0]; this.cubeState.R[7] = t[1]; this.cubeState.R[8] = t[2];
    this.stickerRotations.R[6] = tR[0]; this.stickerRotations.R[7] = tR[1]; this.stickerRotations.R[8] = tR[2];
    this.stickerTextures.R[6] = tT[0]; this.stickerTextures.R[7] = tT[1]; this.stickerTextures.R[8] = tT[2];
  }

  moveR() {
    this.cubeState.R = this.rotateFaceDataCW(this.cubeState.R);
    this.stickerRotations.R = this.rotateFaceDataCW(this.stickerRotations.R);
    this.stickerTextures.R = this.rotateFaceDataCW(this.stickerTextures.R);
    for (let i = 0; i < 9; i++) this.applyStickerRotation("R", i, 1);
    const t = [this.cubeState.F[2], this.cubeState.F[5], this.cubeState.F[8]];
    const tR = [this.stickerRotations.F[2], this.stickerRotations.F[5], this.stickerRotations.F[8]];
    const tT = [this.stickerTextures.F[2], this.stickerTextures.F[5], this.stickerTextures.F[8]];
    this.cubeState.F[2] = this.cubeState.D[2]; this.cubeState.F[5] = this.cubeState.D[5]; this.cubeState.F[8] = this.cubeState.D[8];
    this.stickerRotations.F[2] = this.stickerRotations.D[2]; this.stickerRotations.F[5] = this.stickerRotations.D[5]; this.stickerRotations.F[8] = this.stickerRotations.D[8];
    this.stickerTextures.F[2] = this.stickerTextures.D[2]; this.stickerTextures.F[5] = this.stickerTextures.D[5]; this.stickerTextures.F[8] = this.stickerTextures.D[8];
    this.cubeState.D[2] = this.cubeState.B[6]; this.cubeState.D[5] = this.cubeState.B[3]; this.cubeState.D[8] = this.cubeState.B[0];
    this.stickerRotations.D[2] = (this.stickerRotations.B[6] + 2) % 4; this.stickerRotations.D[5] = (this.stickerRotations.B[3] + 2) % 4; this.stickerRotations.D[8] = (this.stickerRotations.B[0] + 2) % 4;
    this.stickerTextures.D[2] = this.stickerTextures.B[6]; this.stickerTextures.D[5] = this.stickerTextures.B[3]; this.stickerTextures.D[8] = this.stickerTextures.B[0];
    this.cubeState.B[6] = this.cubeState.U[2]; this.cubeState.B[3] = this.cubeState.U[5]; this.cubeState.B[0] = this.cubeState.U[8];
    this.stickerRotations.B[6] = (this.stickerRotations.U[2] + 2) % 4; this.stickerRotations.B[3] = (this.stickerRotations.U[5] + 2) % 4; this.stickerRotations.B[0] = (this.stickerRotations.U[8] + 2) % 4;
    this.stickerTextures.B[6] = this.stickerTextures.U[2]; this.stickerTextures.B[3] = this.stickerTextures.U[5]; this.stickerTextures.B[0] = this.stickerTextures.U[8];
    this.cubeState.U[2] = t[0]; this.cubeState.U[5] = t[1]; this.cubeState.U[8] = t[2];
    this.stickerRotations.U[2] = tR[0]; this.stickerRotations.U[5] = tR[1]; this.stickerRotations.U[8] = tR[2];
    this.stickerTextures.U[2] = tT[0]; this.stickerTextures.U[5] = tT[1]; this.stickerTextures.U[8] = tT[2];
  }

  moveL() {
    this.cubeState.L = this.rotateFaceDataCW(this.cubeState.L);
    this.stickerRotations.L = this.rotateFaceDataCW(this.stickerRotations.L);
    this.stickerTextures.L = this.rotateFaceDataCW(this.stickerTextures.L);
    for (let i = 0; i < 9; i++) this.applyStickerRotation("L", i, 1);
    const t = [this.cubeState.F[0], this.cubeState.F[3], this.cubeState.F[6]];
    const tR = [this.stickerRotations.F[0], this.stickerRotations.F[3], this.stickerRotations.F[6]];
    const tT = [this.stickerTextures.F[0], this.stickerTextures.F[3], this.stickerTextures.F[6]];
    this.cubeState.F[0] = this.cubeState.U[0]; this.cubeState.F[3] = this.cubeState.U[3]; this.cubeState.F[6] = this.cubeState.U[6];
    this.stickerRotations.F[0] = this.stickerRotations.U[0]; this.stickerRotations.F[3] = this.stickerRotations.U[3]; this.stickerRotations.F[6] = this.stickerRotations.U[6];
    this.stickerTextures.F[0] = this.stickerTextures.U[0]; this.stickerTextures.F[3] = this.stickerTextures.U[3]; this.stickerTextures.F[6] = this.stickerTextures.U[6];
    this.cubeState.U[0] = this.cubeState.B[8]; this.cubeState.U[3] = this.cubeState.B[5]; this.cubeState.U[6] = this.cubeState.B[2];
    this.stickerRotations.U[0] = (this.stickerRotations.B[8] + 2) % 4; this.stickerRotations.U[3] = (this.stickerRotations.B[5] + 2) % 4; this.stickerRotations.U[6] = (this.stickerRotations.B[2] + 2) % 4;
    this.stickerTextures.U[0] = this.stickerTextures.B[8]; this.stickerTextures.U[3] = this.stickerTextures.B[5]; this.stickerTextures.U[6] = this.stickerTextures.B[2];
    this.cubeState.B[8] = this.cubeState.D[0]; this.cubeState.B[5] = this.cubeState.D[3]; this.cubeState.B[2] = this.cubeState.D[6];
    this.stickerRotations.B[8] = (this.stickerRotations.D[0] + 2) % 4; this.stickerRotations.B[5] = (this.stickerRotations.D[3] + 2) % 4; this.stickerRotations.B[2] = (this.stickerRotations.D[6] + 2) % 4;
    this.stickerTextures.B[8] = this.stickerTextures.D[0]; this.stickerTextures.B[5] = this.stickerTextures.D[3]; this.stickerTextures.B[2] = this.stickerTextures.D[6];
    this.cubeState.D[0] = t[0]; this.cubeState.D[3] = t[1]; this.cubeState.D[6] = t[2];
    this.stickerRotations.D[0] = tR[0]; this.stickerRotations.D[3] = tR[1]; this.stickerRotations.D[6] = tR[2];
    this.stickerTextures.D[0] = tT[0]; this.stickerTextures.D[3] = tT[1]; this.stickerTextures.D[6] = tT[2];
  }

  moveF() {
    this.cubeState.F = this.rotateFaceDataCW(this.cubeState.F);
    this.stickerRotations.F = this.rotateFaceDataCW(this.stickerRotations.F);
    this.stickerTextures.F = this.rotateFaceDataCW(this.stickerTextures.F);
    for (let i = 0; i < 9; i++) this.applyStickerRotation("F", i, 1);
    const t = [this.cubeState.U[6], this.cubeState.U[7], this.cubeState.U[8]];
    const tR = [this.stickerRotations.U[6], this.stickerRotations.U[7], this.stickerRotations.U[8]];
    const tT = [this.stickerTextures.U[6], this.stickerTextures.U[7], this.stickerTextures.U[8]];
    this.cubeState.U[6] = this.cubeState.L[8]; this.cubeState.U[7] = this.cubeState.L[5]; this.cubeState.U[8] = this.cubeState.L[2];
    this.stickerRotations.U[6] = (this.stickerRotations.L[8] + 1) % 4; this.stickerRotations.U[7] = (this.stickerRotations.L[5] + 1) % 4; this.stickerRotations.U[8] = (this.stickerRotations.L[2] + 1) % 4;
    this.stickerTextures.U[6] = this.stickerTextures.L[8]; this.stickerTextures.U[7] = this.stickerTextures.L[5]; this.stickerTextures.U[8] = this.stickerTextures.L[2];
    this.cubeState.L[8] = this.cubeState.D[2]; this.cubeState.L[5] = this.cubeState.D[1]; this.cubeState.L[2] = this.cubeState.D[0];
    this.stickerRotations.L[8] = (this.stickerRotations.D[2] + 1) % 4; this.stickerRotations.L[5] = (this.stickerRotations.D[1] + 1) % 4; this.stickerRotations.L[2] = (this.stickerRotations.D[0] + 1) % 4;
    this.stickerTextures.L[8] = this.stickerTextures.D[2]; this.stickerTextures.L[5] = this.stickerTextures.D[1]; this.stickerTextures.L[2] = this.stickerTextures.D[0];
    this.cubeState.D[2] = this.cubeState.R[0]; this.cubeState.D[1] = this.cubeState.R[3]; this.cubeState.D[0] = this.cubeState.R[6];
    this.stickerRotations.D[2] = (this.stickerRotations.R[0] + 1) % 4; this.stickerRotations.D[1] = (this.stickerRotations.R[3] + 1) % 4; this.stickerRotations.D[0] = (this.stickerRotations.R[6] + 1) % 4;
    this.stickerTextures.D[2] = this.stickerTextures.R[0]; this.stickerTextures.D[1] = this.stickerTextures.R[3]; this.stickerTextures.D[0] = this.stickerTextures.R[6];
    this.cubeState.R[0] = t[0]; this.cubeState.R[3] = t[1]; this.cubeState.R[6] = t[2];
    this.stickerRotations.R[0] = (tR[0] + 1) % 4; this.stickerRotations.R[3] = (tR[1] + 1) % 4; this.stickerRotations.R[6] = (tR[2] + 1) % 4;
    this.stickerTextures.R[0] = tT[0]; this.stickerTextures.R[3] = tT[1]; this.stickerTextures.R[6] = tT[2];
  }

  moveB() {
    this.cubeState.B = this.rotateFaceDataCW(this.cubeState.B);
    this.stickerRotations.B = this.rotateFaceDataCW(this.stickerRotations.B);
    this.stickerTextures.B = this.rotateFaceDataCW(this.stickerTextures.B);
    for (let i = 0; i < 9; i++) this.applyStickerRotation("B", i, 1);
    const t = [this.cubeState.U[0], this.cubeState.U[1], this.cubeState.U[2]];
    const tR = [this.stickerRotations.U[0], this.stickerRotations.U[1], this.stickerRotations.U[2]];
    const tT = [this.stickerTextures.U[0], this.stickerTextures.U[1], this.stickerTextures.U[2]];
    this.cubeState.U[0] = this.cubeState.R[2]; this.cubeState.U[1] = this.cubeState.R[5]; this.cubeState.U[2] = this.cubeState.R[8];
    this.stickerRotations.U[0] = (this.stickerRotations.R[2] - 1 + 4) % 4; this.stickerRotations.U[1] = (this.stickerRotations.R[5] - 1 + 4) % 4; this.stickerRotations.U[2] = (this.stickerRotations.R[8] - 1 + 4) % 4;
    this.stickerTextures.U[0] = this.stickerTextures.R[2]; this.stickerTextures.U[1] = this.stickerTextures.R[5]; this.stickerTextures.U[2] = this.stickerTextures.R[8];
    this.cubeState.R[2] = this.cubeState.D[8]; this.cubeState.R[5] = this.cubeState.D[7]; this.cubeState.R[8] = this.cubeState.D[6];
    this.stickerRotations.R[2] = (this.stickerRotations.D[8] - 1 + 4) % 4; this.stickerRotations.R[5] = (this.stickerRotations.D[7] - 1 + 4) % 4; this.stickerRotations.R[8] = (this.stickerRotations.D[6] - 1 + 4) % 4;
    this.stickerTextures.R[2] = this.stickerTextures.D[8]; this.stickerTextures.R[5] = this.stickerTextures.D[7]; this.stickerTextures.R[8] = this.stickerTextures.D[6];
    this.cubeState.D[8] = this.cubeState.L[6]; this.cubeState.D[7] = this.cubeState.L[3]; this.cubeState.D[6] = this.cubeState.L[0];
    this.stickerRotations.D[8] = (this.stickerRotations.L[6] - 1 + 4) % 4; this.stickerRotations.D[7] = (this.stickerRotations.L[3] - 1 + 4) % 4; this.stickerRotations.D[6] = (this.stickerRotations.L[0] - 1 + 4) % 4;
    this.stickerTextures.D[8] = this.stickerTextures.L[6]; this.stickerTextures.D[7] = this.stickerTextures.L[3]; this.stickerTextures.D[6] = this.stickerTextures.L[0];
    this.cubeState.L[6] = t[0]; this.cubeState.L[3] = t[1]; this.cubeState.L[0] = t[2];
    this.stickerRotations.L[6] = (tR[0] - 1 + 4) % 4; this.stickerRotations.L[3] = (tR[1] - 1 + 4) % 4; this.stickerRotations.L[0] = (tR[2] - 1 + 4) % 4;
    this.stickerTextures.L[6] = tT[0]; this.stickerTextures.L[3] = tT[1]; this.stickerTextures.L[0] = tT[2];
  }

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

  moveE() {
    const t = [this.cubeState.F[3], this.cubeState.F[4], this.cubeState.F[5]];
    const tR = [this.stickerRotations.F[3], this.stickerRotations.F[4], this.stickerRotations.F[5]];
    const tT = [this.stickerTextures.F[3], this.stickerTextures.F[4], this.stickerTextures.F[5]];
    this.cubeState.F[3] = this.cubeState.L[3]; this.cubeState.F[4] = this.cubeState.L[4]; this.cubeState.F[5] = this.cubeState.L[5];
    this.stickerRotations.F[3] = this.stickerRotations.L[3]; this.stickerRotations.F[4] = this.stickerRotations.L[4]; this.stickerRotations.F[5] = this.stickerRotations.L[5];
    this.stickerTextures.F[3] = this.stickerTextures.L[3]; this.stickerTextures.F[4] = this.stickerTextures.L[4]; this.stickerTextures.F[5] = this.stickerTextures.L[5];
    this.cubeState.L[3] = this.cubeState.B[3]; this.cubeState.L[4] = this.cubeState.B[4]; this.cubeState.L[5] = this.cubeState.B[5];
    this.stickerRotations.L[3] = this.stickerRotations.B[3]; this.stickerRotations.L[4] = this.stickerRotations.B[4]; this.stickerRotations.L[5] = this.stickerRotations.B[5];
    this.stickerTextures.L[3] = this.stickerTextures.B[3]; this.stickerTextures.L[4] = this.stickerTextures.B[4]; this.stickerTextures.L[5] = this.stickerTextures.B[5];
    this.cubeState.B[3] = this.cubeState.R[3]; this.cubeState.B[4] = this.cubeState.R[4]; this.cubeState.B[5] = this.cubeState.R[5];
    this.stickerRotations.B[3] = this.stickerRotations.R[3]; this.stickerRotations.B[4] = this.stickerRotations.R[4]; this.stickerRotations.B[5] = this.stickerRotations.R[5];
    this.stickerTextures.B[3] = this.stickerTextures.R[3]; this.stickerTextures.B[4] = this.stickerTextures.R[4]; this.stickerTextures.B[5] = this.stickerTextures.R[5];
    this.cubeState.R[3] = t[0]; this.cubeState.R[4] = t[1]; this.cubeState.R[5] = t[2];
    this.stickerRotations.R[3] = tR[0]; this.stickerRotations.R[4] = tR[1]; this.stickerRotations.R[5] = tR[2];
    this.stickerTextures.R[3] = tT[0]; this.stickerTextures.R[4] = tT[1]; this.stickerTextures.R[5] = tT[2];
  }
  moveEPrime() { this.moveE(); this.moveE(); this.moveE(); }
  moveE2() { this.moveE(); this.moveE(); }
  moveS() { this.rotationY(); this.moveM(); this.prime(this.rotationY.bind(this))(); }
  moveSPrime() { this.prime(this.rotationY.bind(this))(); this.moveM(); this.rotationY(); }
  moveS2() { this.prime(this.rotationY.bind(this))(); this.moveM2(); this.rotationY(); }

  moveRw() { this.moveL(); this.rotationX(); }
  moveLw() {
    this.cubeState.L = this.rotateFaceDataCW(this.cubeState.L);
    this.stickerRotations.L = this.rotateFaceDataCW(this.stickerRotations.L);
    this.stickerTextures.L = this.rotateFaceDataCW(this.stickerTextures.L);
    for (let i = 0; i < 9; i++) this.applyStickerRotation("L", i, 1);
    const t = [this.cubeState.F[0], this.cubeState.F[3], this.cubeState.F[6], this.cubeState.F[1], this.cubeState.F[4], this.cubeState.F[7]];
    const tR = [this.stickerRotations.F[0], this.stickerRotations.F[3], this.stickerRotations.F[6], this.stickerRotations.F[1], this.stickerRotations.F[4], this.stickerRotations.F[7]];
    const tT = [this.stickerTextures.F[0], this.stickerTextures.F[3], this.stickerTextures.F[6], this.stickerTextures.F[1], this.stickerTextures.F[4], this.stickerTextures.F[7]];
    this.cubeState.F[0] = this.cubeState.U[0]; this.cubeState.F[3] = this.cubeState.U[3]; this.cubeState.F[6] = this.cubeState.U[6]; this.cubeState.F[1] = this.cubeState.U[1]; this.cubeState.F[4] = this.cubeState.U[4]; this.cubeState.F[7] = this.cubeState.U[7];
    this.stickerRotations.F[0] = this.stickerRotations.U[0]; this.stickerRotations.F[3] = this.stickerRotations.U[3]; this.stickerRotations.F[6] = this.stickerRotations.U[6]; this.stickerRotations.F[1] = this.stickerRotations.U[1]; this.stickerRotations.F[4] = this.stickerRotations.U[4]; this.stickerRotations.F[7] = this.stickerRotations.U[7];
    this.stickerTextures.F[0] = this.stickerTextures.U[0]; this.stickerTextures.F[3] = this.stickerTextures.U[3]; this.stickerTextures.F[6] = this.stickerTextures.U[6]; this.stickerTextures.F[1] = this.stickerTextures.U[1]; this.stickerTextures.F[4] = this.stickerTextures.U[4]; this.stickerTextures.F[7] = this.stickerTextures.U[7];
    this.cubeState.U[0] = this.cubeState.B[8]; this.cubeState.U[3] = this.cubeState.B[5]; this.cubeState.U[6] = this.cubeState.B[2]; this.cubeState.U[1] = this.cubeState.B[7]; this.cubeState.U[4] = this.cubeState.B[4]; this.cubeState.U[7] = this.cubeState.B[1];
    this.stickerRotations.U[0] = (this.stickerRotations.B[8] + 2) % 4; this.stickerRotations.U[3] = (this.stickerRotations.B[5] + 2) % 4; this.stickerRotations.U[6] = (this.stickerRotations.B[2] + 2) % 4; this.stickerRotations.U[1] = (this.stickerRotations.B[7] + 2) % 4; this.stickerRotations.U[4] = (this.stickerRotations.B[4] + 2) % 4; this.stickerRotations.U[7] = (this.stickerRotations.B[1] + 2) % 4;
    this.stickerTextures.U[0] = this.stickerTextures.B[8]; this.stickerTextures.U[3] = this.stickerTextures.B[5]; this.stickerTextures.U[6] = this.stickerTextures.B[2]; this.stickerTextures.U[1] = this.stickerTextures.B[7]; this.stickerTextures.U[4] = this.stickerTextures.B[4]; this.stickerTextures.U[7] = this.stickerTextures.B[1];
    this.cubeState.B[8] = this.cubeState.D[0]; this.cubeState.B[5] = this.cubeState.D[3]; this.cubeState.B[2] = this.cubeState.D[6]; this.cubeState.B[7] = this.cubeState.D[1]; this.cubeState.B[4] = this.cubeState.D[4]; this.cubeState.B[1] = this.cubeState.D[7];
    this.stickerRotations.B[8] = (this.stickerRotations.D[0] + 2) % 4; this.stickerRotations.B[5] = (this.stickerRotations.D[3] + 2) % 4; this.stickerRotations.B[2] = (this.stickerRotations.D[6] + 2) % 4; this.stickerRotations.B[7] = (this.stickerRotations.D[1] + 2) % 4; this.stickerRotations.B[4] = (this.stickerRotations.D[4] + 2) % 4; this.stickerRotations.B[1] = (this.stickerRotations.D[7] + 2) % 4;
    this.stickerTextures.B[8] = this.stickerTextures.D[0]; this.stickerTextures.B[5] = this.stickerTextures.D[3]; this.stickerTextures.B[2] = this.stickerTextures.D[6]; this.stickerTextures.B[7] = this.stickerTextures.D[1]; this.stickerTextures.B[4] = this.stickerTextures.D[4]; this.stickerTextures.B[1] = this.stickerTextures.D[7];
    this.cubeState.D[0] = t[0]; this.cubeState.D[3] = t[1]; this.cubeState.D[6] = t[2]; this.cubeState.D[1] = t[3]; this.cubeState.D[4] = t[4]; this.cubeState.D[7] = t[5];
    this.stickerRotations.D[0] = tR[0]; this.stickerRotations.D[3] = tR[1]; this.stickerRotations.D[6] = tR[2]; this.stickerRotations.D[1] = tR[3]; this.stickerRotations.D[4] = tR[4]; this.stickerRotations.D[7] = tR[5];
    this.stickerTextures.D[0] = tT[0]; this.stickerTextures.D[3] = tT[1]; this.stickerTextures.D[6] = tT[2]; this.stickerTextures.D[1] = tT[3]; this.stickerTextures.D[4] = tT[4]; this.stickerTextures.D[7] = tT[5];
  }
  moveUw() { this.moveD(); this.rotationY(); }
  moveDw() { this.moveU(); this.prime(this.rotationY.bind(this))(); }
  moveFw() { this.moveB(); this.rotationZ(); }
  moveBw() {
    this.cubeState.B = this.rotateFaceDataCW(this.cubeState.B);
    this.stickerRotations.B = this.rotateFaceDataCW(this.stickerRotations.B);
    this.stickerTextures.B = this.rotateFaceDataCW(this.stickerTextures.B);
    for (let i = 0; i < 9; i++) this.applyStickerRotation("B", i, 1);
    const t = [this.cubeState.U[0], this.cubeState.U[1], this.cubeState.U[2], this.cubeState.U[3], this.cubeState.U[4], this.cubeState.U[5]];
    const tR = [this.stickerRotations.U[0], this.stickerRotations.U[1], this.stickerRotations.U[2], this.stickerRotations.U[3], this.stickerRotations.U[4], this.stickerRotations.U[5]];
    const tT = [this.stickerTextures.U[0], this.stickerTextures.U[1], this.stickerTextures.U[2], this.stickerTextures.U[3], this.stickerTextures.U[4], this.stickerTextures.U[5]];
    this.cubeState.U[0] = this.cubeState.R[2]; this.cubeState.U[1] = this.cubeState.R[5]; this.cubeState.U[2] = this.cubeState.R[8]; this.cubeState.U[3] = this.cubeState.R[1]; this.cubeState.U[4] = this.cubeState.R[4]; this.cubeState.U[5] = this.cubeState.R[7];
    this.stickerRotations.U[0] = (this.stickerRotations.R[2] - 1 + 4) % 4; this.stickerRotations.U[1] = (this.stickerRotations.R[5] - 1 + 4) % 4; this.stickerRotations.U[2] = (this.stickerRotations.R[8] - 1 + 4) % 4; this.stickerRotations.U[3] = (this.stickerRotations.R[1] - 1 + 4) % 4; this.stickerRotations.U[4] = (this.stickerRotations.R[4] - 1 + 4) % 4; this.stickerRotations.U[5] = (this.stickerRotations.R[7] - 1 + 4) % 4;
    this.stickerTextures.U[0] = this.stickerTextures.R[2]; this.stickerTextures.U[1] = this.stickerTextures.R[5]; this.stickerTextures.U[2] = this.stickerTextures.R[8]; this.stickerTextures.U[3] = this.stickerTextures.R[1]; this.stickerTextures.U[4] = this.stickerTextures.R[4]; this.stickerTextures.U[5] = this.stickerTextures.R[7];
    this.cubeState.R[2] = this.cubeState.D[8]; this.cubeState.R[5] = this.cubeState.D[7]; this.cubeState.R[8] = this.cubeState.D[6]; this.cubeState.R[1] = this.cubeState.D[5]; this.cubeState.R[4] = this.cubeState.D[4]; this.cubeState.R[7] = this.cubeState.D[3];
    this.stickerRotations.R[2] = (this.stickerRotations.D[8] - 1 + 4) % 4; this.stickerRotations.R[5] = (this.stickerRotations.D[7] - 1 + 4) % 4; this.stickerRotations.R[8] = (this.stickerRotations.D[6] - 1 + 4) % 4; this.stickerRotations.R[1] = (this.stickerRotations.D[5] - 1 + 4) % 4; this.stickerRotations.R[4] = (this.stickerRotations.D[4] - 1 + 4) % 4; this.stickerRotations.R[7] = (this.stickerRotations.D[3] - 1 + 4) % 4;
    this.stickerTextures.R[2] = this.stickerTextures.D[8]; this.stickerTextures.R[5] = this.stickerTextures.D[7]; this.stickerTextures.R[8] = this.stickerTextures.D[6]; this.stickerTextures.R[1] = this.stickerTextures.D[5]; this.stickerTextures.R[4] = this.stickerTextures.D[4]; this.stickerTextures.R[7] = this.stickerTextures.D[3];
    this.cubeState.D[8] = this.cubeState.L[6]; this.cubeState.D[7] = this.cubeState.L[3]; this.cubeState.D[6] = this.cubeState.L[0]; this.cubeState.D[5] = this.cubeState.L[7]; this.cubeState.D[4] = this.cubeState.L[4]; this.cubeState.D[3] = this.cubeState.L[1];
    this.stickerRotations.D[8] = (this.stickerRotations.L[6] - 1 + 4) % 4; this.stickerRotations.D[7] = (this.stickerRotations.L[3] - 1 + 4) % 4; this.stickerRotations.D[6] = (this.stickerRotations.L[0] - 1 + 4) % 4; this.stickerRotations.D[5] = (this.stickerRotations.L[7] - 1 + 4) % 4; this.stickerRotations.D[4] = (this.stickerRotations.L[4] - 1 + 4) % 4; this.stickerRotations.D[3] = (this.stickerRotations.L[1] - 1 + 4) % 4;
    this.stickerTextures.D[8] = this.stickerTextures.L[6]; this.stickerTextures.D[7] = this.stickerTextures.L[3]; this.stickerTextures.D[6] = this.stickerTextures.L[0]; this.stickerTextures.D[5] = this.stickerTextures.L[7]; this.stickerTextures.D[4] = this.stickerTextures.L[4]; this.stickerTextures.D[3] = this.stickerTextures.L[1];
    this.cubeState.L[6] = t[0]; this.cubeState.L[3] = t[1]; this.cubeState.L[0] = t[2]; this.cubeState.L[7] = t[3]; this.cubeState.L[4] = t[4]; this.cubeState.L[1] = t[5];
    this.stickerRotations.L[6] = (tR[0] - 1 + 4) % 4; this.stickerRotations.L[3] = (tR[1] - 1 + 4) % 4; this.stickerRotations.L[0] = (tR[2] - 1 + 4) % 4; this.stickerRotations.L[7] = (tR[3] - 1 + 4) % 4; this.stickerRotations.L[4] = (tR[4] - 1 + 4) % 4; this.stickerRotations.L[1] = (tR[5] - 1 + 4) % 4;
    this.stickerTextures.L[6] = tT[0]; this.stickerTextures.L[3] = tT[1]; this.stickerTextures.L[0] = tT[2]; this.stickerTextures.L[7] = tT[3]; this.stickerTextures.L[4] = tT[4]; this.stickerTextures.L[1] = tT[5];
  }

  applyMove(move) {
    if (!this._moveCache) {
      this._moveCache = {
        U: () => this.moveU(), D: () => this.moveD(), R: () => this.moveR(), L: () => this.moveL(), F: () => this.moveF(), B: () => this.moveB(),
        M: () => this.moveM(), E: () => this.moveE(), S: () => this.moveS(),
        Rw: () => this.moveRw(), Lw: () => this.moveLw(), Uw: () => this.moveUw(), Dw: () => this.moveDw(), Fw: () => this.moveFw(), Bw: () => this.moveBw(),
        r: () => this.moveRw(), l: () => this.moveLw(), u: () => this.moveUw(), d: () => this.moveDw(), f: () => this.moveFw(), b: () => this.moveBw(),
        x: () => this.rotationX(), y: () => this.rotationY(), z: () => this.rotationZ(),
        "U'": () => { this.moveU(); this.moveU(); this.moveU(); }, "D'": () => { this.moveD(); this.moveD(); this.moveD(); }, "R'": () => { this.moveR(); this.moveR(); this.moveR(); }, "L'": () => { this.moveL(); this.moveL(); this.moveL(); }, "F'": () => { this.moveF(); this.moveF(); this.moveF(); }, "B'": () => { this.moveB(); this.moveB(); this.moveB(); },
        "M'": () => this.moveMPrime(), "E'": () => this.moveEPrime(), "S'": () => this.moveSPrime(),
        "Rw'": () => { this.moveRw(); this.moveRw(); this.moveRw(); }, "Lw'": () => { this.moveLw(); this.moveLw(); this.moveLw(); }, "Uw'": () => { this.moveUw(); this.moveUw(); this.moveUw(); }, "Dw'": () => { this.moveDw(); this.moveDw(); this.moveDw(); }, "Fw'": () => { this.moveFw(); this.moveFw(); this.moveFw(); }, "Bw'": () => { this.moveBw(); this.moveBw(); this.moveBw(); },
        "r'": () => { this.moveRw(); this.moveRw(); this.moveRw(); }, "l'": () => { this.moveLw(); this.moveLw(); this.moveLw(); }, "u'": () => { this.moveUw(); this.moveUw(); this.moveUw(); }, "d'": () => { this.moveDw(); this.moveDw(); this.moveDw(); }, "f'": () => { this.moveFw(); this.moveFw(); this.moveFw(); }, "b'": () => { this.moveBw(); this.moveBw(); this.moveBw(); },
        "x'": () => { this.rotationX(); this.rotationX(); this.rotationX(); }, "y'": () => { this.rotationY(); this.rotationY(); this.rotationY(); }, "z'": () => { this.rotationZ(); this.rotationZ(); this.rotationZ(); },
        U2: () => { this.moveU(); this.moveU(); }, D2: () => { this.moveD(); this.moveD(); }, R2: () => { this.moveR(); this.moveR(); }, L2: () => { this.moveL(); this.moveL(); }, F2: () => { this.moveF(); this.moveF(); }, B2: () => { this.moveB(); this.moveB(); },
        M2: () => this.moveM2(), E2: () => this.moveE2(), S2: () => this.moveS2(),
        Rw2: () => { this.moveRw(); this.moveRw(); }, Lw2: () => { this.moveLw(); this.moveLw(); }, Uw2: () => { this.moveUw(); this.moveUw(); }, Dw2: () => { this.moveDw(); this.moveDw(); }, Fw2: () => { this.moveFw(); this.moveFw(); }, Bw2: () => { this.moveBw(); this.moveBw(); },
        r2: () => { this.moveRw(); this.moveRw(); }, l2: () => { this.moveLw(); this.moveLw(); }, u2: () => { this.moveUw(); this.moveUw(); }, d2: () => { this.moveDw(); this.moveDw(); }, f2: () => { this.moveFw(); this.moveFw(); }, b2: () => { this.moveBw(); this.moveBw(); },
        x2: () => { this.rotationX(); this.rotationX(); }, y2: () => { this.rotationY(); this.rotationY(); }, z2: () => { this.rotationZ(); this.rotationZ(); }
      };
    }
    if (this._moveCache[move]) this._moveCache[move]();
  }

  cloneFace(face) { return face.map(v => typeof v === 'object' ? {...v} : v); }

  getState() {
    return {
      cubeState: { U: this.cloneFace(this.cubeState.U), L: this.cloneFace(this.cubeState.L), F: this.cloneFace(this.cubeState.F), R: this.cloneFace(this.cubeState.R), B: this.cloneFace(this.cubeState.B), D: this.cloneFace(this.cubeState.D) },
      stickerRotations: { U: [...this.stickerRotations.U], L: [...this.stickerRotations.L], F: [...this.stickerRotations.F], R: [...this.stickerRotations.R], B: [...this.stickerRotations.B], D: [...this.stickerRotations.D] },
      stickerTextures: { U: this.cloneFace(this.stickerTextures.U), L: this.cloneFace(this.stickerTextures.L), F: this.cloneFace(this.stickerTextures.F), R: this.cloneFace(this.stickerTextures.R), B: this.cloneFace(this.stickerTextures.B), D: this.cloneFace(this.stickerTextures.D) }
    };
  }

  setState(state) {
    this.cubeState = { U: this.cloneFace(state.cubeState.U), L: this.cloneFace(state.cubeState.L), F: this.cloneFace(state.cubeState.F), R: this.cloneFace(state.cubeState.R), B: this.cloneFace(state.cubeState.B), D: this.cloneFace(state.cubeState.D) };
    this.stickerRotations = { U: [...state.stickerRotations.U], L: [...state.stickerRotations.L], F: [...state.stickerRotations.F], R: [...state.stickerRotations.R], B: [...state.stickerRotations.B], D: [...state.stickerRotations.D] };
    this.stickerTextures = { U: this.cloneFace(state.stickerTextures.U), L: this.cloneFace(state.stickerTextures.L), F: this.cloneFace(state.stickerTextures.F), R: this.cloneFace(state.stickerTextures.R), B: this.cloneFace(state.stickerTextures.B), D: this.cloneFace(state.stickerTextures.D) };
  }
}

export default CubeCore;
