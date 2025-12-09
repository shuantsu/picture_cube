const moves = ['U', "U'", 'U2', 'D', "D'", 'D2', 'R', "R'", 'R2', 'L', "L'", 'L2', 'F', "F'", 'F2', 'B', "B'", 'B2'];

const n = parseInt(process.argv[2]) || 25;
const scramble = [];

for (let i = 0; i < n; i++) {
  scramble.push(moves[Math.floor(Math.random() * moves.length)]);
}

console.log(scramble.join(' '));
