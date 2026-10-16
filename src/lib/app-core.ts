// Core domain helpers for KAS-buh (typed)

import type { Client, Procedure, Sale, PayrollType } from "../types";

export const APP_ID = "kas_buhgalteriya_v3";
export const SALON_SERVICES_CATEGORY = "Салон услуги";
export const SALON_PAYROLL_CATEGORY = "Салон зп";
export const LEGACY_SALON_CATEGORY = "Салон";
export const HOME_CATEGORY = "Домашние";
export const KALYM_CATEGORY = "Калым";
export const CATEGORIES: string[] = [
  SALON_SERVICES_CATEGORY,
  SALON_PAYROLL_CATEGORY,
  HOME_CATEGORY,
  KALYM_CATEGORY,
];
export const MARKED_CATEGORIES: string[] = [
  SALON_SERVICES_CATEGORY,
  HOME_CATEGORY,
  KALYM_CATEGORY,
];
export const CATEGORY_DOT_COLOR: Record<string, string> = {
  [SALON_SERVICES_CATEGORY]: "#6B5BAE",
  [HOME_CATEGORY]: "#10B981",
  [KALYM_CATEGORY]: "#F59E0B",
  [SALON_PAYROLL_CATEGORY]: "#38bdf8",
};
export const CURRENCY = "₽";

/** Текущая версия приложения (держать в синхроне с versionName в android/app/build.gradle). */
export const APP_VERSION = "2.0.38";

/**
 * Компактный формат чисел: разряды разделяются ТОНКИМ пробелом (U+2009)
 * вместо широкого неразрывного, который даёт toLocaleString в ru-локали.
 * Длинные суммы (период «Год») помещаются в карточки на узких экранах.
 */
export const formatNumber = (value: number | string | null | undefined): string => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return String(value ?? "");
  return num.toLocaleString("ru-RU").replace(/[\u00A0\u202F\u2009]/g, "\u2009");
};
export const WEEK_DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export interface PayrollTypeOption {
  id: PayrollType;
  label: string;
}

export const PAYROLL_TYPES: PayrollTypeOption[] = [
  { id: "advance", label: "Аванс" },
  { id: "salary", label: "ЗП" },
  { id: "vacation", label: "Отпускные" },
  { id: "sickLeave", label: "Больничный" },
  { id: "payout", label: "Выплата" },
];
export const BACK_EXIT_DELAY = 2000;
export const BACK_LAYER_COOLDOWN = 700;
export const BACK_DEBOUNCE = 220;

export const STORAGE_KEYS = {
  SALES: `${APP_ID}_sales`,
  PROCEDURES: `${APP_ID}_procedures`,
  CLIENTS: `${APP_ID}_clients`,
  SNAPSHOT: `${APP_ID}_snapshot`,
  ROLLBACK: `${APP_ID}_rollback`,
} as const;

interface CapacitorAppLike {
  exitApp?: () => void;
}

let capacitorAppRef: CapacitorAppLike | null = null;
export const setCapacitorAppRef = (ref: CapacitorAppLike | null): void => {
  capacitorAppRef = ref;
};

export const exitApp = (): void => {
  if (capacitorAppRef?.exitApp) {
    try {
      capacitorAppRef.exitApp();
      return;
    } catch (error) {
      console.error("Capacitor exit error:", error);
    }
  }

  const navApp =
    typeof navigator !== "undefined"
      ? (navigator as unknown as { app?: { exitApp?: () => void } }).app
      : null;
  if (navApp?.exitApp) {
    try {
      navApp.exitApp();
      return;
    } catch (error) {
      console.error("Navigator exit error:", error);
    }
  }

  if (typeof window !== "undefined") {
    try {
      window.close();
    } catch {
      // ignore
    }
    if (window.history.length > 1) {
      window.history.back();
    }
  }
};

export const padNumber = (value: number | string): string =>
  String(value).padStart(2, "0");

export const toDateKey = (date: Date): string => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}`;
};

export const parseDateKey = (dateStr: string | null | undefined): Date | null => {
  const text = String(dateStr || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return null;
  const [year, month, day] = text
    .split("-")
    .map((value) => Number(value));

  if (!year || month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) return null;
  return date;
};

export const getToday = (): string => toDateKey(new Date());

export const getCurrentTime = (): string => {
  const now = new Date();
  return `${padNumber(now.getHours())}:${padNumber(now.getMinutes())}`;
};

export const getExportFileName = (): string => {
  const now = new Date();
  const day = padNumber(now.getDate());
  const month = padNumber(now.getMonth() + 1);
  const year = String(now.getFullYear()).slice(-2);
  const hours = padNumber(now.getHours());
  const minutes = padNumber(now.getMinutes());
  return `${day}.${month}.${year}-${hours}.${minutes}.json`;
};

export const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "";
  const [year, month, day] = String(dateStr).split("-");
  if (!year || !month || !day) return dateStr;
  return `${day}.${month}.${year}`;
};

export const formatLongDate = (dateStr: string | null | undefined): string => {
  const date = parseDateKey(dateStr);
  if (!date) return formatDate(dateStr);

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
    .format(date)
    .replace(" г.", "");
};

export const formatMonthLabel = (monthDate: Date): string => {
  const label = new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric",
  }).format(monthDate);

  return label.charAt(0).toUpperCase() + label.slice(1);
};

export const shiftMonth = (monthDate: Date, diff: number): Date =>
  new Date(monthDate.getFullYear(), monthDate.getMonth() + diff, 1);

export const getMonthDays = (monthDate: Date): (string | null)[] => {
  const start = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const startOffset = (start.getDay() + 6) % 7;
  const daysInMonth = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth() + 1,
    0,
  ).getDate();
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

  return Array.from({ length: totalCells }, (_, idx) => {
    const dayNumber = idx - startOffset + 1;
    if (dayNumber < 1 || dayNumber > daysInMonth) return null;
    return toDateKey(
      new Date(monthDate.getFullYear(), monthDate.getMonth(), dayNumber),
    );
  });
};

export const getSaleDateTime = (sale: Partial<Sale> | null | undefined): Date => {
  const date = parseDateKey(sale?.date) || new Date(0);
  const time = String(sale?.time || "00:00");
  const match = /^(?:[01]\d|2[0-3]):[0-5]\d$/.exec(time);
  const [hours, minutes] = (match ? time : "00:00")
    .split(":")
    .map((value) => Number(value));

  date.setHours(hours || 0, minutes || 0, 0, 0);
  return date;
};

export const sortSalesByDateTimeDesc = (
  data: Sale[] | null | undefined,
): Sale[] =>
  [...(data || [])].sort((a, b) => {
    if (a.isDeferred && !b.isDeferred) return -1;
    if (!a.isDeferred && b.isDeferred) return 1;
    if (a.isDeferred && b.isDeferred) {
      return getSaleDateTime(a).getTime() - getSaleDateTime(b).getTime();
    }
    return getSaleDateTime(b).getTime() - getSaleDateTime(a).getTime();
  });

export interface CustomRange {
  start: string;
  end: string;
}

export const getPeriodRangeLabel = (
  statsPeriod: string,
  customRange: CustomRange,
  statsDay: string | null | undefined,
): string => {
  const now = new Date();

  if (statsPeriod === "day") {
    return statsDay ? formatDate(statsDay) : "День не выбран";
  }

  if (statsPeriod === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return `${formatDate(toDateKey(start))} - ${formatDate(toDateKey(end))}`;
  }

  if (statsPeriod === "year") {
    const year = now.getFullYear();
    return `01.01.${year} - 31.12.${year}`;
  }

  if (statsPeriod === "custom") {
    if (!customRange.start || !customRange.end) return "Период не выбран";
    return `${formatDate(customRange.start)} - ${formatDate(customRange.end)}`;
  }

  return "За всё время";
};

export const inferRegisteredAt = (name: string, sales: Sale[]): string => {
  const dates = (sales || [])
    .filter((sale) => sale.clientName === name && sale.date)
    .map((sale) => sale.date)
    .sort();

  return dates[0] || getToday();
};

export const normalizeSaleCategory = (
  sale: Partial<Sale> | null | undefined,
): string => {
  if (sale?.category === LEGACY_SALON_CATEGORY) {
    return sale.salonExtraType && sale.salonExtraType !== "tips"
      ? SALON_PAYROLL_CATEGORY
      : SALON_SERVICES_CATEGORY;
  }

  return sale?.category || SALON_SERVICES_CATEGORY;
};

export const getPayrollType = (type: string): PayrollTypeOption =>
  PAYROLL_TYPES.find((item) => item.id === type) || PAYROLL_TYPES[0];

export const normalizeSales = (sales: unknown): Sale[] => {
  const list = Array.isArray(sales) ? (sales as Partial<Sale>[]) : [];
  return list.map((sale, idx) => {
    const category = normalizeSaleCategory(sale);
    const legacyPayrollType =
      sale.salonExtraType && sale.salonExtraType !== "tips"
        ? sale.salonExtraType
        : "";

    return {
      ...sale,
      id: sale.id || crypto.randomUUID(),
      date: sale.date || getToday(),
      time: sale.time || "00:00",
      category,
      items: Array.isArray(sale.items)
        ? sale.items.map((item: any) => ({
            instanceId: item?.instanceId || crypto.randomUUID(),
            id: item?.id || crypto.randomUUID(),
            procedureId: item?.procedureId,
            name: typeof item?.name === "string" ? item.name : "",
            price: item?.price ?? 0,
            income: item?.income ?? 0,
            actualPrice: item?.actualPrice ?? "",
          }))
        : [],
      manualIncome: sale.manualIncome ?? "",
      notes: sale.notes || "",
      isDeferred: Boolean(sale.isDeferred),
      tips: parseNonNegativeMoney(sale.tips) ?? 0,
      payrollType: sale.payrollType || legacyPayrollType || PAYROLL_TYPES[0].id,
      salonExtraType: sale.salonExtraType || "tips",
      clientId: sale.clientId,
    } as Sale;
  });
};

export const getSaleDisplayName = (sale: Partial<Sale> | null | undefined): string => {
  const name = String(sale?.clientName || "").trim();
  if (name) return name;
  if (sale?.category === SALON_PAYROLL_CATEGORY) {
    return getPayrollType(sale.payrollType || sale.salonExtraType || "").label;
  }
  return "Без клиента";
};

export const normalizeClients = (clients: unknown, sales: Sale[]): Client[] => {
  const list = Array.isArray(clients) ? (clients as Partial<Client>[]) : [];
  return list.map((client) => ({
    id: client.id || crypto.randomUUID(),
    name: client.name || "",
    registeredAt: client.registeredAt || inferRegisteredAt(client.name || "", sales),
    notes: client.notes || "",
    archived: Boolean(client.archived),
  }));
};

export const normalizeProcedures = (procedures: unknown): Procedure[] => {
  const today = getToday();
  const list = Array.isArray(procedures)
    ? (procedures as Partial<Procedure>[])
    : [];
  return list.map((proc) => ({
    id: proc.id || crypto.randomUUID(),
    name: typeof proc.name === "string" ? proc.name : "",
    price: proc.price ?? 0,
    income: proc.income ?? 0,
    createdAt: proc.createdAt || today,
    updatedAt: proc.updatedAt || proc.createdAt || today,
    archived: Boolean(proc.archived),
  })) as Procedure[];
};

export const getInitialSaleState = (): Sale => ({
  clientName: "",
  date: getToday(),
  time: getCurrentTime(),
  category: SALON_SERVICES_CATEGORY,
  items: [],
  manualIncome: "",
  tips: "",
  notes: "",
  isDeferred: localStorage.getItem("kas_default_isDeferred") === "true",
  payrollType: PAYROLL_TYPES[0].id,
  tempProcName: "",
  tempProcPrice: "",
  tempProcIncome: "",
});

export const parseMoney = (value: unknown, fallback = 0): number => {
  if (value === null || value === undefined || value === "") return fallback;
  const normalized = String(value).replace(/\s/g, "").replace(/,/g, ".");
  if (!/^-?\d+(?:\.\d+)?$/.test(normalized)) return fallback;
  const result = Number(normalized);
  return Number.isFinite(result) ? result : fallback;
};

export const parseNonNegativeMoney = (value: unknown): number | null => {
  const result = parseMoney(value, NaN);
  return Number.isFinite(result) && result >= 0 ? result : null;
};

export const getSaleTurnover = (sale: Sale): number => {
  if (sale.category !== SALON_SERVICES_CATEGORY) return 0;
  return (sale.items || []).reduce(
    (sum, item) => sum + (parseNonNegativeMoney(item.actualPrice || item.price) ?? 0),
    0,
  );
};

export const getSaleAccrual = (sale: Sale): number => {
  if (sale.category !== SALON_SERVICES_CATEGORY) return 0;
  return (sale.items || []).reduce(
    (sum, item) => sum + (parseNonNegativeMoney(item.income) ?? 0),
    0,
  );
};

export const getSaleSalonCleanIncome = (sale: Sale): number => {
  if (![SALON_SERVICES_CATEGORY, SALON_PAYROLL_CATEGORY].includes(sale.category))
    return 0;
  return parseNonNegativeMoney(sale.tips) ?? 0;
};

export const getSaleIncome = (sale: Sale): number => {
  if ([SALON_SERVICES_CATEGORY, SALON_PAYROLL_CATEGORY].includes(sale.category))
    return 0;
  return parseNonNegativeMoney(sale.manualIncome) ?? 0;
};

export const getSaleAnalyticsIncome = (sale: Sale): number =>
  [SALON_SERVICES_CATEGORY, SALON_PAYROLL_CATEGORY].includes(sale.category)
    ? getSaleSalonCleanIncome(sale)
    : getSaleIncome(sale);

export const getSaleCardAmount = (sale: Sale): number => {
  if (sale.category === SALON_PAYROLL_CATEGORY)
    return getSaleSalonCleanIncome(sale);
  if (sale.category !== SALON_SERVICES_CATEGORY) return getSaleIncome(sale);
  return getSaleAccrual(sale) || getSaleSalonCleanIncome(sale);
};

export const RU_MONTHS_FULL = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];
export const RU_MONTHS_SHORT = [
  "янв.",
  "февр.",
  "мар.",
  "апр.",
  "мая",
  "июн.",
  "июл.",
  "авг.",
  "сент.",
  "окт.",
  "нояб.",
  "дек.",
];
export const RU_WEEKDAYS = ["П", "В", "С", "Ч", "П", "С", "В"];

export function formatHeaderDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map((n) => parseInt(n, 10));
  if (!y || !m || !d) return "—";
  return `${d} ${RU_MONTHS_SHORT[m - 1]} ${y} г.`;
}

export function isoToDDMMYYYY(iso: string | null | undefined): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return "";
  return `${d}.${m}.${y}`;
}

export function ddmmyyyyToIso(text: string): string | null {
  const m = text.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!m) return null;
  const day = parseInt(m[1], 10);
  const mon = parseInt(m[2], 10);
  const yr = parseInt(m[3], 10);
  if (mon < 1 || mon > 12 || day > 31) return null;
  const dt = new Date(yr, mon - 1, day);
  if (
    dt.getFullYear() !== yr ||
    dt.getMonth() !== mon - 1 ||
    dt.getDate() !== day
  )
    return null;
  return `${yr}-${String(mon).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
