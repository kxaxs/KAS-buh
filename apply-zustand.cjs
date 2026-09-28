const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add import for store
content = content.replace('import React, {', "import { useAppStore } from './store';\nimport React, {");

// 2. Replace the state initializations
const stateCode = `  const [activeTab, setActiveTab] = useState("dashboard");
  const initialData = useMemo(() => getStoredAppData(), []);
  const [sales, setSales] = useState(initialData.sales);
  const [procedures, setProcedures] = useState(initialData.procedures);
  const [clients, setClients] = useState(initialData.clients);`;

const storeCode = `  const activeTab = useAppStore(s => s.activeTab);
  const setActiveTab = useAppStore(s => s.setActiveTab);
  const sales = useAppStore(s => s.sales);
  const setSales = useAppStore(s => s.setSales);
  const procedures = useAppStore(s => s.procedures);
  const setProcedures = useAppStore(s => s.setProcedures);
  const clients = useAppStore(s => s.clients);
  const setClients = useAppStore(s => s.setClients);`;

content = content.replace(stateCode, storeCode);

// 3. Remove useEffects
const useEffectsCode = `  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROCEDURES, JSON.stringify(procedures));
  }, [procedures]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  }, [clients]);`;

content = content.replace(useEffectsCode, '');

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx successfully updated with Zustand!');
