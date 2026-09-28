const fs = require('fs');
const path = require('path');

const uiContextProps = fs.readFileSync('uiContextCode.txt', 'utf8')
  .match(/isModalOpen[\s\S]*?(?=\}\), \[)/)[0]
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const icons = "Users, UserPlus, FileDown, Search, ArrowRight, UserCheck, Phone, Check, EyeOff, AlertTriangle, MessageCircle, MapPin, Trash2, X, Plus, Calendar, Clock, DollarSign, Activity, Settings, Zap, ArrowLeft, ArrowDown, LogOut, ChevronRight, TrendingUp, Star, Gift, ChevronDown, PlusCircle, Bell, StickyNote, CalendarClock, ArrowDownAZ, Pin, Edit2, BarChart3, Receipt, Wallet, CalendarDays, History, Smartphone, Calculator, ShieldCheck, Mail, Send, Filter, Info, Copy, Share2, LayoutDashboard, PieChart, Scissors, CloudDownload, CloudUpload, ChevronUp, CheckCircle2".split(', ').map(i => i.trim());

const iconImport = `import { ${icons.join(', ')} } from 'lucide-react';`;

const screens = ['DashboardScreen.tsx', 'ClientsScreen.tsx', 'ProceduresScreen.tsx', 'SettingsScreen.tsx'];

screens.forEach(s => {
  const p = path.join('src', 'screens', s);
  let c = fs.readFileSync(p, 'utf8');
  
  // Replace lucide imports
  c = c.replace(/import \{([\s\S]*?)\} from 'lucide-react';/, iconImport);
  
  // Replace ui context destructuring
  c = c.replace(/const \{ [\s\S]*? \} = ui;/, 'const { ' + uiContextProps.join(', ') + ' } = ui;');

  // Make sure useAppStore actions are present
  if (!c.includes('const setClients = useAppStore(s => s.setClients);')) {
    c = c.replace('const activeTab = useAppStore(s => s.activeTab);', 'const activeTab = useAppStore(s => s.activeTab);\n  const setClients = useAppStore(s => s.setClients);\n  const setSales = useAppStore(s => s.setSales);\n  const setProcedures = useAppStore(s => s.setProcedures);');
  }

  // Ensure CURRENCY is imported in ProceduresScreen
  if (s === 'ProceduresScreen.tsx' && !c.includes('CURRENCY')) {
    c = c.replace('STORAGE_KEYS', 'STORAGE_KEYS, CURRENCY');
  }

  fs.writeFileSync(p, c);
});

console.log('Fixed screens successfully!');
