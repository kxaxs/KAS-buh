const fs = require('fs');

const appContent = fs.readFileSync('src/App.tsx', 'utf8');
const lines = appContent.split('\n');

const appCoreContent = fs.readFileSync('src/lib/app-core.ts', 'utf8');
const appCoreExports = [...appCoreContent.matchAll(/export (?:const|function) ([a-zA-Z0-9_]+)/g)].map(m => m[1]);

const importsTop = lines.slice(0, 36).join('\n');
const appCoreImport = `import { ${appCoreExports.join(', ')} } from '../lib/app-core';`;

const componentsLines = lines.slice(37, 1495);
const exportedComponents = [];

const newComponentsLines = componentsLines.map(line => {
  if (line.startsWith('function ')) {
    const match = line.match(/^function ([a-zA-Z0-9_]+)/);
    if (match) exportedComponents.push(match[1]);
    return 'export ' + line;
  }
  return line;
});

const uiCoreContent = [
  importsTop,
  appCoreImport,
  ...newComponentsLines
].join('\n');

fs.mkdirSync('src/components', { recursive: true });
fs.writeFileSync('src/components/ui-core.tsx', uiCoreContent);

const newAppContent = [
  ...lines.slice(0, 37),
  `import { ${exportedComponents.join(', ')} } from './components/ui-core';`,
  ...lines.slice(1495)
].join('\n');

fs.writeFileSync('src/App.tsx', newAppContent);
console.log('Exported UI Components: ' + exportedComponents.join(', '));
