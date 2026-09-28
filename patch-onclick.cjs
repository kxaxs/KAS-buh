const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
const searchStr = `onFocus={(e) => { const el = e.target.closest('[class*="overflow-y-auto"]'); if(el) [100, 300, 500].forEach(t => setTimeout(() => el.scrollTop = el.scrollHeight, t)); }}`;
const replaceStr = `onFocus={(e) => { const el = e.target.closest('[class*="overflow-y-auto"]'); if(el) [100, 300, 500].forEach(t => setTimeout(() => el.scrollTop = el.scrollHeight, t)); }} onClick={(e) => { const el = e.target.closest('[class*="overflow-y-auto"]'); if(el) [100, 300, 500].forEach(t => setTimeout(() => el.scrollTop = el.scrollHeight, t)); }}`;
code = code.split(searchStr).join(replaceStr);

const searchStr2 = `[100, 300, 500].forEach((t) => setTimeout(() => el.scrollTop = el.scrollHeight, t));`;
// Let's check how many times the exact strings occur

fs.writeFileSync('src/App.tsx', code);
console.log('Patched onClick for autoscroll fields');
