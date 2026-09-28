const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const search = `el.scrollTop = el.scrollHeight`;
const replace = `el.scrollTop = el.scrollHeight - el.clientHeight - 44`;

code = code.split(search).join(replace);

fs.writeFileSync('src/App.tsx', code);
console.log('Patched bottom scroll alignment.');
