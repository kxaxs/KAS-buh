const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// OLD: uses offsetTop which is relative to offsetParent - unreliable
// const targetTop = block.offsetTop;
// container.scrollTop = targetTop - parseInt(...) + 4;

// NEW: uses getBoundingClientRect() relative to viewport, then recalculates
// exact position within the scrollable container

const oldScroll = `const targetTop = block.offsetTop;
                        [100, 300, 500].forEach((t) => setTimeout(() => { container.scrollTop = targetTop - parseInt(window.getComputedStyle(container).paddingTop || '0') + 4; }, t));`;

const newScroll = `[100, 300, 500].forEach((t) => setTimeout(() => {
                          const cRect = container.getBoundingClientRect();
                          const bRect = block.getBoundingClientRect();
                          container.scrollTop = container.scrollTop + (bRect.top - cRect.top) - 4;
                        }, t));`;

let count = 0;
while (code.includes(oldScroll)) {
  code = code.replace(oldScroll, newScroll);
  count++;
}

// Also cover indentation variants
const oldScroll2 = `const targetTop = block.offsetTop;
                          [100, 300, 500].forEach((t) => setTimeout(() => { container.scrollTop = targetTop - parseInt(window.getComputedStyle(container).paddingTop || '0') + 4; }, t));`;
const newScroll2 = `[100, 300, 500].forEach((t) => setTimeout(() => {
                            const cRect = container.getBoundingClientRect();
                            const bRect = block.getBoundingClientRect();
                            container.scrollTop = container.scrollTop + (bRect.top - cRect.top) - 4;
                          }, t));`;

while (code.includes(oldScroll2)) {
  code = code.replace(oldScroll2, newScroll2);
  count++;
}

fs.writeFileSync('src/App.tsx', code);
console.log('Patched ' + count + ' scroll occurrences.');
