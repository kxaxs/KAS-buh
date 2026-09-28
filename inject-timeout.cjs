const fs = require('fs');
let content = fs.readFileSync('src/store/index.ts', 'utf8');

// Replace the initStore logic to add a timeout fallback
content = content.replace(
  'const idbSales = await get(STORAGE_KEYS.SALES);',
  `const idbSales = await Promise.race([get(STORAGE_KEYS.SALES), new Promise(r => setTimeout(() => r(null), 2000))]);`
);
content = content.replace(
  'const idbProcedures = await get(STORAGE_KEYS.PROCEDURES);',
  `const idbProcedures = await Promise.race([get(STORAGE_KEYS.PROCEDURES), new Promise(r => setTimeout(() => r(null), 2000))]);`
);
content = content.replace(
  'const idbClients = await get(STORAGE_KEYS.CLIENTS);',
  `const idbClients = await Promise.race([get(STORAGE_KEYS.CLIENTS), new Promise(r => setTimeout(() => r(null), 2000))]);`
);

fs.writeFileSync('src/store/index.ts', content);
console.log('Timeout added to get() calls');
