const fs = require('fs');
const imports = `// @ts-nocheck
import React from 'react';
import { useAppStore } from '../store';
import { AppUIContext } from '../context/AppUIContext';
import { 
  getToday, padNumber, toDateKey, parseDateKey, getCurrentTime, getExportFileName, formatDate, 
  formatLongDate, formatMonthLabel, shiftMonth, getMonthDays, getSaleDateTime, 
  sortSalesByDateTimeDesc, getPeriodRangeLabel, inferRegisteredAt, normalizeSaleCategory, 
  getPayrollType, normalizeSales, getSaleDisplayName, normalizeClients, normalizeProcedures, 
  getStoredAppData, getInitialSaleState, getSaleTurnover, getSaleAccrual, getSaleSalonCleanIncome, 
  getSaleIncome, getSaleAnalyticsIncome, getSaleCardAmount, formatHeaderDate, isoToDDMMYYYY, 
  ddmmyyyyToIso, CATEGORIES, APP_ID, SALON_SERVICES_CATEGORY, SALON_PAYROLL_CATEGORY, STORAGE_KEYS, CURRENCY
} from '../lib/app-core';
import { 
  Users, UserPlus, FileDown, Search, ArrowRight, UserCheck, Phone, Check, EyeOff, AlertTriangle, MessageCircle, MapPin, Trash2, X, Plus, Calendar, Clock, DollarSign, Activity, Settings, Zap, ArrowLeft, ArrowDown, LogOut, ChevronRight, TrendingUp, Star, Gift, ChevronDown, PlusCircle, Bell, StickyNote, CalendarClock, ArrowDownAZ, Pin, Edit2, BarChart3, Receipt, Wallet, CalendarDays, History, Smartphone, Calculator, ShieldCheck, Mail, Send, Filter, Info, Copy, Share2, LayoutDashboard, PieChart, Scissors, CloudDownload, CloudUpload, ChevronUp, CheckCircle2 
} from 'lucide-react';
import { SaleCard } from '../components/ui-core';
`;

const screens = ['DashboardScreen.tsx', 'ClientsScreen.tsx', 'ProceduresScreen.tsx', 'SettingsScreen.tsx'];
screens.forEach(s => {
  let c = fs.readFileSync('src/screens/' + s, 'utf8');
  // the first line might just be // @ts-nocheck\n\nimport { DashboardScreen }
  // we will just replace everything from the very start up to "export function"
  c = c.replace(/[\s\S]*?export function /, imports + '\nexport function ');
  fs.writeFileSync('src/screens/' + s, c);
});
console.log('Fixed imports!');
