const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// The scroll formula that uses .rounded-2xl block targeting
// Change: container.scrollTop = targetTop - 20
// To:     container.scrollTop = targetTop - parseInt(getComputedStyle(container).paddingTop || '0') + 4
// This ensures the block top edge is exactly 4px (≈1mm) inside the scroll area

const oldFormula = `container.scrollTop = targetTop - 20;`;
const newFormula = `container.scrollTop = targetTop - parseInt(window.getComputedStyle(container).paddingTop || '0') + 4;`;

const count = code.split(oldFormula).length - 1;
code = code.split(oldFormula).join(newFormula);

fs.writeFileSync('src/App.tsx', code);
console.log('Patched ' + count + ' occurrences.');
