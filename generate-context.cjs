const fs = require('fs');

const appContent = fs.readFileSync('src/App.tsx', 'utf8');
const lines = appContent.split('\n');

const hooksLines = lines.slice(57, 1756);
const exportedVars = new Set();
hooksLines.forEach(l => {
  let m = l.match(/const \[([a-zA-Z0-9_]+), ([a-zA-Z0-9_]+)\] = useState/);
  if(m){ exportedVars.add(m[1]); exportedVars.add(m[2]); return; }
  m = l.match(/const ([a-zA-Z0-9_]+) = \(\) => {/);
  if(m) exportedVars.add(m[1]);
  m = l.match(/const ([a-zA-Z0-9_]+) = \([^)]*\) => {/);
  if(m) exportedVars.add(m[1]);
  m = l.match(/^  const ([a-zA-Z0-9_]+) = /);
  if(m && !l.includes('useState')) {
    exportedVars.add(m[1]);
  }
});

const exportList = Array.from(exportedVars);
const uiContextCode = `
  const uiContextValue = useMemo(() => ({
    ${exportList.join(',\n    ')}
  }), [
    ${exportList.join(',\n    ')}
  ]);
`;
fs.writeFileSync('uiContextCode.txt', uiContextCode);
console.log('Created uiContextCode.txt. Items: ' + exportList.length);
