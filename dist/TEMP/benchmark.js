const CubeCore = require('./cube-core.js');

const moves = ['U', "U'", 'U2', 'D', "D'", 'D2', 'R', "R'", 'R2', 'L', "L'", 'L2', 'F', "F'", 'F2', 'B', "B'", 'B2', 'M', "M'", 'M2', 'E', "E'", 'E2', 'S', "S'", 'S2', 'x', "x'", 'x2', 'y', "y'", 'y2', 'z', "z'", 'z2'];

function randomMove() { return moves[Math.floor(Math.random() * moves.length)]; }

function benchmark(name, fn) {
  const start = performance.now();
  fn();
  const time = performance.now() - start;
  console.log(`${name}: ${time.toFixed(2)}ms`);
  return time;
}

console.log('=== CUBE CORE BENCHMARK ===\n');

// Test 1: Single move repetition
console.log('TEST 1: Single Move Repetition (10k each)');
const cube1 = new CubeCore();
['U', 'R', 'F', 'M', 'E', 'S', 'x', 'y', 'z', 'Rw'].forEach(move => {
  const c = new CubeCore();
  benchmark(`  ${move.padEnd(3)} x10k`, () => { for(let i=0; i<10000; i++) c.applyMove(move); });
});

// Test 2: Random sequences
console.log('\nTEST 2: Random Sequences');
const seq1k = Array(1000).fill(0).map(() => randomMove());
const seq10k = Array(10000).fill(0).map(() => randomMove());
const seq100k = Array(100000).fill(0).map(() => randomMove());

benchmark('  1k random moves', () => { const c = new CubeCore(); seq1k.forEach(m => c.applyMove(m)); });
benchmark('  10k random moves', () => { const c = new CubeCore(); seq10k.forEach(m => c.applyMove(m)); });
benchmark('  100k random moves', () => { const c = new CubeCore(); seq100k.forEach(m => c.applyMove(m)); });

// Test 3: Algorithm patterns
console.log('\nTEST 3: Common Algorithms (1k repetitions)');
const algs = {
  'Sexy Move': "R U R' U'",
  'T-Perm': "R U R' U' R' F R2 U' R' U' R U R' F'",
  'Sune': "R U R' U R U2 R'",
  'Sledgehammer': "R' F R F'"
};
Object.entries(algs).forEach(([name, alg]) => {
  const c = new CubeCore();
  const moveList = alg.split(' ');
  benchmark(`  ${name}`, () => { for(let i=0; i<1000; i++) moveList.forEach(m => c.applyMove(m)); });
});

// Test 4: State operations
console.log('\nTEST 4: State Operations');
const c4 = new CubeCore();
for(let i=0; i<100; i++) c4.applyMove(randomMove());
benchmark('  getState x10k', () => { for(let i=0; i<10000; i++) c4.getState(); });
const state = c4.getState();
benchmark('  setState x10k', () => { for(let i=0; i<10000; i++) c4.setState(state); });

// Test 5: Worst case (complex moves)
console.log('\nTEST 5: Complex Moves (10k each)');
['Rw', 'Lw', 'Uw', 'Dw', 'Fw', 'Bw', 'E', 'S', 'M'].forEach(move => {
  const c = new CubeCore();
  benchmark(`  ${move.padEnd(3)} x10k`, () => { for(let i=0; i<10000; i++) c.applyMove(move); });
});

// Test 6: Stress test
console.log('\nTEST 6: Stress Test');
const total = benchmark('  1M random moves', () => {
  const c = new CubeCore();
  for(let i=0; i<1000000; i++) c.applyMove(randomMove());
});

console.log(`\n=== SUMMARY ===`);
console.log(`Average per move: ${(total/1000000).toFixed(4)}ms`);
console.log(`Moves per second: ${(1000000/(total/1000)).toFixed(0)}`);
