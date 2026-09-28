const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Fix "Своя услуга" button: single smooth scroll at 300ms
const oldCustom = `                      if (container && block) {
                        // Use longer delays so React has time to re-render and expand/collapse the form
                        [200, 400, 700].forEach((t) => setTimeout(() => {
                          const cRect = container.getBoundingClientRect();
                          const bRect = block.getBoundingClientRect();
                          container.scrollTop = container.scrollTop + (bRect.top - cRect.top) - 4;
                        }, t));
                      }`;
const newCustom = `                      if (container && block) {
                        // Single smooth scroll after React re-render (~300ms)
                        setTimeout(() => {
                          const cRect = container.getBoundingClientRect();
                          const bRect = block.getBoundingClientRect();
                          const targetScrollTop = container.scrollTop + (bRect.top - cRect.top) - 4;
                          container.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
                        }, 300);
                      }`;

let count = 0;
if (code.includes(oldCustom)) { code = code.replace(oldCustom, newCustom); count++; }

// 2. Fix all other multi-timeout getBoundingClientRect scrolls (onFocus/onClick for fields)
const oldMulti = `[100, 300, 500].forEach((t) => setTimeout(() => {
                            const cRect = container.getBoundingClientRect();
                            const bRect = block.getBoundingClientRect();
                            container.scrollTop = container.scrollTop + (bRect.top - cRect.top) - 4;
                          }, t));`;
const newMulti = `setTimeout(() => {
                            const cRect = container.getBoundingClientRect();
                            const bRect = block.getBoundingClientRect();
                            const targetScrollTop = container.scrollTop + (bRect.top - cRect.top) - 4;
                            container.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
                          }, 150);`;

while (code.includes(oldMulti)) { code = code.replace(oldMulti, newMulti); count++; }

// Also shorter indentation variant
const oldMulti2 = `[100, 300, 500].forEach((t) => setTimeout(() => {
                          const cRect = container.getBoundingClientRect();
                          const bRect = block.getBoundingClientRect();
                          container.scrollTop = container.scrollTop + (bRect.top - cRect.top) - 4;
                        }, t));`;
const newMulti2 = `setTimeout(() => {
                          const cRect = container.getBoundingClientRect();
                          const bRect = block.getBoundingClientRect();
                          const targetScrollTop = container.scrollTop + (bRect.top - cRect.top) - 4;
                          container.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
                        }, 150);`;

while (code.includes(oldMulti2)) { code = code.replace(oldMulti2, newMulti2); count++; }

// 3. Fix the bottom scroll (notes/tips field) - use smooth as well  
const oldBottom = `el.scrollTop = el.scrollHeight - el.clientHeight - 44`;
const newBottom = `el.scrollTo({ top: el.scrollHeight - el.clientHeight - 44, behavior: 'smooth' })`;
while (code.includes(oldBottom)) { code = code.replace(oldBottom, newBottom); count++; }

// 4. Wrap single-timeout bottom scrolls in proper smooth
const oldScroll = `[100, 300, 500].forEach(t => setTimeout(() => el.scrollTo({ top: el.scrollHeight - el.clientHeight - 44, behavior: 'smooth' }), t));`;
const newScroll = `setTimeout(() => el.scrollTo({ top: el.scrollHeight - el.clientHeight - 44, behavior: 'smooth' }), 150);`;
while (code.includes(oldScroll)) { code = code.replace(oldScroll, newScroll); count++; }

fs.writeFileSync('src/App.tsx', code);
console.log('Patched ' + count + ' scroll occurrences to single smooth scroll.');
