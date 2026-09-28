const fs = require('fs');

const appContent = fs.readFileSync('src/App.tsx', 'utf8');
const lines = appContent.split('\n');

// Hooks are between lines 57 and 1756
const hooksLines = lines.slice(57, 1756);
const exportedVars = new Set();
hooksLines.forEach(l => {
  let m = l.match(/const \[([a-zA-Z0-9_]+), ([a-zA-Z0-9_]+)\] = useState/);
  if(m){ exportedVars.add(m[1]); exportedVars.add(m[2]); return; }
  m = l.match(/const ([a-zA-Z0-9_]+) = \(\) => {/);
  if(m) exportedVars.add(m[1]);
  m = l.match(/const ([a-zA-Z0-9_]+) = \([^)]*\) => {/);
  if(m) exportedVars.add(m[1]);
  // also handle normal const definitions if they are used outside
  m = l.match(/^  const ([a-zA-Z0-9_]+) = /);
  if(m && !l.includes('useState')) {
    exportedVars.add(m[1]);
  }
});

const exportList = Array.from(exports).join(',\n    ');

const useAppUIContent = `import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAppStore } from '../store';
import * as Core from '../lib/app-core';

export const useAppUI = () => {
  const activeTab = useAppStore(s => s.activeTab);
  const setActiveTab = useAppStore(s => s.setActiveTab);
  const sales = useAppStore(s => s.sales);
  const setSales = useAppStore(s => s.setSales);
  const procedures = useAppStore(s => s.procedures);
  const setProcedures = useAppStore(s => s.setProcedures);
  const clients = useAppStore(s => s.clients);
  const setClients = useAppStore(s => s.setClients);

${hooksLines.join('\n').replace(/([A-Z_]+)(?=\s*[,=:}])/g, (m) => {
    // Prefix Core variables
    if (m === 'CATEGORIES' || m === 'APP_ID' || m === 'SALON_SERVICES_CATEGORY' || m === 'SALON_PAYROLL_CATEGORY' || m === 'STORAGE_KEYS') return 'Core.' + m;
    return m;
}).replace(/([a-zA-Z0-9_]+)\(/g, (m, name) => {
    // Prefix Core functions
    const coreFuncs = ['getToday', 'padNumber', 'toDateKey', 'parseDateKey', 'getCurrentTime', 'getExportFileName', 'formatDate', 'formatLongDate', 'formatMonthLabel', 'shiftMonth', 'getMonthDays', 'getSaleDateTime', 'sortSalesByDateTimeDesc', 'getPeriodRangeLabel', 'inferRegisteredAt', 'normalizeSaleCategory', 'getPayrollType', 'normalizeSales', 'getSaleDisplayName', 'normalizeClients', 'normalizeProcedures', 'getStoredAppData', 'getInitialSaleState', 'getSaleTurnover', 'getSaleAccrual', 'getSaleSalonCleanIncome', 'getSaleIncome', 'getSaleAnalyticsIncome', 'getSaleCardAmount', 'formatHeaderDate', 'isoToDDMMYYYY', 'ddmmyyyyToIso'];
    if (coreFuncs.includes(name)) return 'Core.' + name + '(';
    return m;
})}

  return {
    ${exportList}
  };
};

export const AppUIContext = React.createContext<ReturnType<typeof useAppUI> | null>(null);
export const useUI = () => {
  const ctx = React.useContext(AppUIContext);
  if (!ctx) throw new Error("useUI out of context");
  return ctx;
};
`;

fs.mkdirSync('src/hooks', { recursive: true });
fs.writeFileSync('src/hooks/useAppUI.tsx', useAppUIContent);
console.log('Created useAppUI.tsx. Exported: ' + exportedVars.size);
