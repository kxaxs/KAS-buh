const fs = require('fs');
let content = fs.readFileSync('src/store/index.ts', 'utf8');

const oldInit = `  initStore: async () => {
    try {
      // 1. Попытка загрузить из LocalStorage (Миграция)`;

const newInit = `  initStore: async () => {
    try {
      await Promise.race([
        new Promise((_, reject) => setTimeout(() => reject(new Error("IndexedDB timeout")), 2000)),
        (async () => {
      // 1. Попытка загрузить из LocalStorage (Миграция)`;

content = content.replace(oldInit, newInit);

const oldEnd = `      setStore({
        sales: initialSales,
        procedures: initialProcedures,
        clients: initialClients,
        isStoreReady: true
      });
    } catch (error) {`;

const newEnd = `      setStore({
        sales: initialSales,
        procedures: initialProcedures,
        clients: initialClients,
        isStoreReady: true
      });
      })()
      ]);
    } catch (error) {`;

content = content.replace(oldEnd, newEnd);

fs.writeFileSync('src/store/index.ts', content);
console.log('Global timeout wrapper added to initStore!');
