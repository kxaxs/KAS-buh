const fs = require('fs');
const hooksCode = fs.readFileSync('src/hooks/useAppUI.tsx', 'utf8');
const match = hooksCode.match(/return \{\n([\s\S]+?)\n  \};/);
if (match) {
  const exportsStr = match[1].split(',\n').map(s => s.trim()).join(', ');
  const appContent = fs.readFileSync('src/App.tsx', 'utf8');
  const lines = appContent.split('\n');
  const newApp = [
    ...lines.slice(0, 37), // imports
    "import { useAppUI, AppUIContext } from './hooks/useAppUI';",
    ...lines.slice(37, 57), // up to "export default function App() {"
    "  const ui = useAppUI();",
    "  const { " + exportsStr + " } = ui;",
    "  return (",
    "    <AppUIContext.Provider value={ui}>",
    ...lines.slice(1756, lines.length - 1), // Main return starts here
    "    </AppUIContext.Provider>",
    "  );",
    "}"
  ].join('\n');
  fs.writeFileSync('src/App-new.tsx', newApp);
  console.log('Created App-new.tsx');
}
