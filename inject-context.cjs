const fs = require('fs');

const contextCode = `import React, { createContext, useContext } from 'react';

export const AppUIContext = createContext<any>(null);

export const useAppUI = () => {
  const ctx = useContext(AppUIContext);
  if (!ctx) throw new Error("useAppUI must be used within AppUIProvider");
  return ctx;
};
`;

fs.mkdirSync('src/context', { recursive: true });
fs.writeFileSync('src/context/AppUIContext.tsx', contextCode);
console.log('Created AppUIContext.tsx');

const appContent = fs.readFileSync('src/App.tsx', 'utf8');
const lines = appContent.split('\n');

const uiContextCode = fs.readFileSync('uiContextCode.txt', 'utf8');

const mainReturnRegex = /(return \(\s*<div className="min-h-screen)/;

if (mainReturnRegex.test(appContent)) {
  const newApp = appContent.replace(mainReturnRegex, uiContextCode + '\n  $1')
    .replace('import { useAppStore } from \'./store\';', "import { useAppStore } from './store';\nimport { AppUIContext } from './context/AppUIContext';")
    .replace(/(return \(\s*)<div className="min-h-screen/, '$1<AppUIContext.Provider value={uiContextValue}>\n    <div className="min-h-screen')
    .replace(/(export default function App\(\) \{[\s\S]*?)(\s*\}\s*)$/, '$1\n    </AppUIContext.Provider>\n$2');

  fs.writeFileSync('src/App.tsx', newApp);
  console.log('App.tsx wrapped in AppUIContext.Provider');
}
