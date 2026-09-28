const fs = require('fs');
const appContent = fs.readFileSync('src/App.tsx', 'utf8');
const lines = appContent.split('\n');

let dashStart = lines.findIndex(l => l.includes('{activeTab === "dashboard" && ('));
let dashEnd = lines.findIndex(l => l.includes('{activeTab === "clients" && ('));
// We want to skip the condition itself, just extract the JSX block
// and replace it with <DashboardScreen />

if (dashStart > -1 && dashEnd > -1) {
  const dashJSX = lines.slice(dashStart + 1, dashEnd - 1).join('\n'); // omit the opening condition and its closing )}

  // Detect which variables Dashboard uses to pull them from Context
  const neededVars = new Set();
  const contextProps = fs.readFileSync('uiContextCode.txt', 'utf8')
    .match(/isModalOpen[\s\S]*?(?=\}\), \[)/)[0]
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  contextProps.forEach(v => {
    // Exact word match
    const regex = new RegExp(`\\b${v}\\b`);
    if (regex.test(dashJSX)) neededVars.add(v);
  });

  const screenCode = `import React from 'react';
import { useAppStore } from '../store';
import { AppUIContext } from '../context/AppUIContext';
import { Plus, X, Search, FileDown, Calendar, AlertTriangle, ArrowRight, TrendingUp } from 'lucide-react';
import { SaleCard } from '../components/ui-core';
import * as Core from '../lib/app-core';

export function DashboardScreen() {
  const ui = React.useContext(AppUIContext);
  const { ${Array.from(neededVars).join(', ')} } = ui;

  const sales = useAppStore(s => s.sales);
  const activeTab = useAppStore(s => s.activeTab);

  return (
    <>
${dashJSX}
    </>
  );
}
`;

  fs.mkdirSync('src/screens', { recursive: true });
  fs.writeFileSync('src/screens/DashboardScreen.tsx', screenCode);

  const newAppLines = [
    ...lines.slice(0, dashStart),
    '      {activeTab === "dashboard" && <DashboardScreen />}',
    ...lines.slice(dashEnd)
  ];

  // Add import to App.tsx
  const finalApp = newAppLines.join('\n').replace(
    "import { AppUIContext } from './context/AppUIContext';",
    "import { AppUIContext } from './context/AppUIContext';\nimport { DashboardScreen } from './screens/DashboardScreen';"
  );
  fs.writeFileSync('src/App.tsx', finalApp);
  console.log('Extracted DashboardScreen!');
}
