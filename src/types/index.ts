// Types for KAS-buh (Accounting/Receipt Management App)

export interface Procedure {
  id?: string | number;
  name: string;
  price: string;
  income: string;
  recalcFrom?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Client {
  id?: string | number;
  name: string;
  notes?: string;
  registeredAt?: string;
}

export interface SaleItem {
  instanceId?: string;
  id?: string | number;
  name: string;
  price: string;
  income: string;
  actualPrice?: string;
}

export type PayrollType = 'advance' | 'salary' | 'vacation' | 'sickLeave' | 'payout';

export interface Sale {
  id?: string | number;
  clientName: string;
  date: string;
  time: string;
  category: string;
  items: SaleItem[];
  manualIncome: string;
  tips: string | number;
  notes: string;
  isDeferred: boolean;
  isCompleted?: boolean;
  payrollType: string;
  tempProcName: string;
  tempProcPrice: string;
  tempProcIncome: string;
  salonExtraType?: string;
}

export interface ConfirmDialogState {
  isOpen: boolean;
  message: string;
  title?: string;
  variant?: 'default' | 'delete' | 'save';
  onConfirm?: () => void;
}

export interface StatsBreakdown {
  turnover: number;
  turnoverCount: number;
  accrual: number;
  income: number;
  homeIncome: number;
  salonCleanIncome: number;
  tipsIncome: number;
  kalymIncome: number;
}

export type TabId = 'dashboard' | 'clients' | 'procedures' | 'stats' | 'settings';

export type DateRangeMode = 'day' | 'month' | 'year' | 'custom';

export interface DateRange {
  start: string;
  end: string;
}

export interface ReportItem {
  label: string;
  value: number;
  color: string;
  count?: number;
}

export interface NotificationPlugin {
  schedule?: (opts: {
    id: number;
    title: string;
    body: string;
    fireAt: number;
  }) => Promise<void>;
  cancel?: (opts: { id: number }) => Promise<void>;
  requestPermissions?: () => Promise<{ results?: { granted: boolean }[] }>;
}
