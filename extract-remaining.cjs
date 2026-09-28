const fs = require('fs');
const appContent = fs.readFileSync('src/App.tsx', 'utf8');
const lines = appContent.split('\n');

const contextProps = fs.readFileSync('uiContextCode.txt', 'utf8')
  .match(/isModalOpen[\s\S]*?(?=\}\), \[)/)[0]
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

function extractScreen(name, startStr, endStr) {
  let startIdx = lines.findIndex(l => l.includes(startStr));
  let endIdx = lines.findIndex(l => l.includes(endStr));
  
  if (name === 'SettingsScreen' && endIdx === -1) {
    endIdx = lines.findIndex(l => l.includes('{!isCalendarScreenOpen && ('));
  }

  if (startIdx > -1 && endIdx > -1) {
    let jsx = lines.slice(startIdx + 1, endIdx - 1).join('\n');
    if (name === 'SettingsScreen') {
        jsx = jsx.replace(/\s*\)\}\s*<\/>/, '\n    </>\n');
    } else {
        jsx = jsx.replace(/\s*\)\}\s*<\/>/, '\n    </>\n');
        jsx = jsx.replace(/\s*\)\}\s*$/, '\n');
    }

    const neededVars = new Set();
    contextProps.forEach(v => {
      const regex = new RegExp('\\\\b' + v + '\\\\b');
      if (regex.test(jsx)) neededVars.add(v);
    });

    const screenCode = `// @ts-nocheck
import React from 'react';
import { useAppStore } from '../store';
import { AppUIContext } from '../context/AppUIContext';
import * as Core from '../lib/app-core';
import { 
  Users, UserPlus, FileDown, Search, ArrowRight, UserCheck, Phone, Check, EyeOff, AlertTriangle, MessageCircle, MapPin, 
  Trash2, X, Plus, Calendar, Clock, DollarSign, Activity, Settings, Zap, ArrowLeft, ArrowDown, LogOut, ChevronRight,
  TrendingUp, Star, Gift, ChevronDown, PlusCircle
} from 'lucide-react';
import { SaleCard } from '../components/ui-core';

export function ${name}() {
  const ui = React.useContext(AppUIContext);
  const { ${Array.from(neededVars).join(', ')} } = ui;

  const sales = useAppStore(s => s.sales);
  const procedures = useAppStore(s => s.procedures);
  const clients = useAppStore(s => s.clients);
  const activeTab = useAppStore(s => s.activeTab);

  return (
    <>
${jsx}
    </>
  );
}
`;

    fs.writeFileSync('src/screens/' + name + '.tsx', screenCode);
    console.log('Extracted ' + name + '!');
    return { name, startIdx, endIdx };
  }
  return null;
}

const screens = [
  extractScreen('ClientsScreen', '{activeTab === "clients" && (', '{activeTab === "procedures" && ('),
  extractScreen('ProceduresScreen', '{activeTab === "procedures" && (', '{activeTab === "settings" && ('),
  extractScreen('SettingsScreen', '{activeTab === "settings" && (', '{!isCalendarScreenOpen && (')
];

let newLines = [...lines];
let imports = [];

screens.filter(Boolean).reverse().forEach(s => {
  let tabName = s.name.replace('Screen','').toLowerCase();
  const replacement = '      {activeTab === "' + tabName + '" && <' + s.name + ' />}';
  newLines.splice(s.startIdx, s.endIdx - s.startIdx, replacement);
  imports.push('import { ' + s.name + ' } from "./screens/' + s.name + '";');
});

let finalApp = newLines.join('\n');
finalApp = finalApp.replace(
  "import { DashboardScreen } from './screens/DashboardScreen';",
  "import { DashboardScreen } from './screens/DashboardScreen';\n" + imports.reverse().join('\n')
);

fs.writeFileSync('src/App.tsx', finalApp);
console.log('App.tsx updated!');
