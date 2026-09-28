const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `  const setClients = useAppStore(s => s.setClients);`;
const injectStr = `  const setClients = useAppStore(s => s.setClients);
  const isStoreReady = useAppStore(s => s.isStoreReady);
  const initStore = useAppStore(s => s.initStore);

  useEffect(() => {
    initStore();
  }, []);

  if (!isStoreReady) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#181A20] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#6B5BAE] border-t-transparent"></div>
          <p className="text-sm text-gray-400 font-medium">Загрузка данных...</p>
        </div>
      </div>
    );
  }`;

content = content.replace(targetStr, injectStr);

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx updated with preloader!');
