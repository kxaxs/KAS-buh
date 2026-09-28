const fs = require('fs');
const appContent = fs.readFileSync('src/App.tsx', 'utf8');
const lines = appContent.split('\n');
const extracted = lines.slice(36, 465);
const exportNames = [];
const newExtracted = extracted.map(line => {
  if (line.startsWith('const ')) {
    const match = line.match(/^const ([a-zA-Z0-9_]+)/);
    if (match) exportNames.push(match[1]);
    return 'export ' + line;
  }
  if (line.startsWith('let capacitorAppRef')) {
    exportNames.push('setCapacitorAppRef');
    return 'let capacitorAppRef: any = null;\nexport const setCapacitorAppRef = (ref: any) => { capacitorAppRef = ref; };';
  }
  if (line.startsWith('function ')) {
    const match = line.match(/^function ([a-zA-Z0-9_]+)/);
    if (match) exportNames.push(match[1]);
    return 'export ' + line;
  }
  return line;
});
fs.mkdirSync('src/lib', { recursive: true });
fs.writeFileSync('src/lib/app-core.ts', newExtracted.join('\n'));
let newApp = [
  ...lines.slice(0, 36),
  'import { ' + exportNames.join(', ') + ' } from "./lib/app-core";',
  ...lines.slice(465)
].join('\n').replace(/capacitorAppRef = App;/g, 'setCapacitorAppRef(App);');
fs.writeFileSync('src/App.tsx', newApp);
console.log('Exported: ' + exportNames.length);
