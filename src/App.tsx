// @ts-nocheck
import { useAppStore } from './store';
import { AppUIContext } from './context/AppUIContext';
import { DashboardScreen } from './screens/DashboardScreen';
import { ClientsScreen } from "./screens/ClientsScreen";
import { ProceduresScreen } from "./screens/ProceduresScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { StatsScreen } from "./screens/StatsScreen";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowDownAZ,
  ArrowRight,
  BarChart3,
  Bell,
  Calendar,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CloudDownload,
  CloudUpload,
  Copy,
  Edit2,
  Filter,
  Info,
  LayoutDashboard,
  PieChart,
  Pin,
  Plus,
  Scissors,
  Search,
  Settings,
  Share2,
  StickyNote,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import { APP_ID, SALON_SERVICES_CATEGORY, SALON_PAYROLL_CATEGORY, LEGACY_SALON_CATEGORY, HOME_CATEGORY, KALYM_CATEGORY, CATEGORIES, MARKED_CATEGORIES, CATEGORY_DOT_COLOR, CURRENCY, WEEK_DAYS, PAYROLL_TYPES, BACK_EXIT_DELAY, BACK_LAYER_COOLDOWN, BACK_DEBOUNCE, STORAGE_KEYS, exitApp, padNumber, toDateKey, parseDateKey, getToday, getCurrentTime, getExportFileName, formatDate, formatLongDate, formatMonthLabel, shiftMonth, getMonthDays, getSaleDateTime, sortSalesByDateTimeDesc, getPeriodRangeLabel, inferRegisteredAt, normalizeSaleCategory, getPayrollType, normalizeSales, getSaleDisplayName, normalizeClients, normalizeProcedures, getInitialSaleState, getSaleTurnover, getSaleAccrual, getSaleSalonCleanIncome, getSaleIncome, getSaleAnalyticsIncome, getSaleCardAmount, RU_MONTHS_FULL, RU_MONTHS_SHORT, RU_WEEKDAYS, formatHeaderDate, isoToDDMMYYYY, ddmmyyyyToIso, formatNumber } from "./lib/app-core";
import { DatePickerDialog, TimePickerDialog, BottomSheet, CalendarPicker, ConfirmDialog, NavBtn, AppNav, MonthCalendar, SaleCard, SaleDetailsSheet, InlineDatePickerCard } from './components/ui-core';
import { useAutosave } from "./hooks/useAutosave";
import { useBackListener } from "./hooks/useBackListener";
import { useReminders } from "./hooks/useReminders";
import { useBackupIO } from "./hooks/useBackupIO";
import { useStatsData } from "./hooks/useStatsData";
import { calculateStats, getReportSaleAmount } from "./lib/stats";
import { AutoFitText } from "./components/AutoFitText";
import { Num } from "./components/Num";
export default function App() {
  const activeTab = useAppStore(s => s.activeTab);
  const setActiveTab = useAppStore(s => s.setActiveTab);
  const sales = useAppStore(s => s.sales);
  const setSales = useAppStore(s => s.setSales);
  const procedures = useAppStore(s => s.procedures);
  const setProcedures = useAppStore(s => s.setProcedures);
  const clients = useAppStore(s => s.clients);
  const setClients = useAppStore(s => s.setClients);
  const isStoreReady = useAppStore(s => s.isStoreReady);
  const initStore = useAppStore(s => s.initStore);
  const storageFailed = useAppStore(s => s.storageFailed);

  useEffect(() => {
    initStore();
  }, []);

  useAutosave({ isStoreReady, storageFailed, sales, procedures, clients });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isProcModalOpen, setIsProcModalOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isStatsChartOpen, setIsStatsChartOpen] = useState(false);
  const [reportRange, setReportRange] = useState(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const toKey = (d) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return { start: toKey(start), end: toKey(end) };
  });
  const [reportRangeEditing, setReportRangeEditing] = useState(null);
  const [reportClients, setReportClients] = useState("all");
  const [reportClientSearch, setReportClientSearch] = useState("");
  const [reportCategories, setReportCategories] = useState("all");
  const [reportServices, setReportServices] = useState("all");
  const [reportServiceSearch, setReportServiceSearch] = useState("");
  const [reportShowFilters, setReportShowFilters] = useState(false);
  const [reportFilterPanel, setReportFilterPanel] = useState(null);
  const [reportChartType, setReportChartType] = useState("bar");
  const [reportGroupBy, setReportGroupBy] = useState("category");
  const [reportDrillItem, setReportDrillItem] = useState(null);
  const [reportDrillSort, setReportDrillSort] = useState("date");
  const [isStatsBreakdownOpen, setIsStatsBreakdownOpen] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [calendarScreenMode, setCalendarScreenMode] = useState("calendar");
  const [calendarScreenTextValue, setCalendarScreenTextValue] = useState("");
  const [calendarScreenTextError, setCalendarScreenTextError] = useState(false);
  const [statsBreakdownType, setStatsBreakdownType] = useState("income");
  const [statsBreakdownFilter, setStatsBreakdownFilter] = useState("all");
  const [isClientHistoryOpen, setIsClientHistoryOpen] = useState(false);
  const [isCalendarScreenOpen, setIsCalendarScreenOpen] = useState(false);
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  const [showStatsClientSuggestions, setShowStatsClientSuggestions] =
    useState(false);
  const [backHint, setBackHint] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [selectedSale, setSelectedSale] = useState(null);
  const [saleDetailsId, setSaleDetailsId] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([...CATEGORIES]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statsPeriod, setStatsPeriod] = useState("month");
  const [statsClient, setStatsClient] = useState("all");
  const [statsClientSearch, setStatsClientSearch] = useState("");
  const [statsDay, setStatsDay] = useState(getToday());
  const [statsDayMonth, setStatsDayMonth] = useState(
    () => parseDateKey(getToday()) || new Date(),
  );
  const [calendarScreenMonth, setCalendarScreenMonth] = useState(
    () => parseDateKey(getToday()) || new Date(),
  );
  const [calendarScreenSelectedDate, setCalendarScreenSelectedDate] =
    useState(null);
  const [customRangeEditing, setCustomRangeEditing] = useState(null);
  const [customRange, setCustomRange] = useState({
    start: getToday(),
    end: getToday(),
  });
  const [editingProc, setEditingProc] = useState(null);
  const [procRecalcEnabled, setProcRecalcEnabled] = useState(false);
  const [procRecalcDate, setProcRecalcDate] = useState("");
  const [editingClient, setEditingClient] = useState(null);
  const [procSearch, setProcSearch] = useState("");
  const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false);
  const [dashPeriodEnabled, setDashPeriodEnabled] = useState(() => {
    try { return localStorage.getItem("kas_dashPeriodEnabled") === "true"; } catch { return false; }
  });
  const [dashPeriod, setDashPeriod] = useState(() => {
    try { return localStorage.getItem("kas_dashPeriod") || "today"; } catch { return "today"; }
  });
  const [isDashPeriodMenuOpen, setIsDashPeriodMenuOpen] = useState(false);
  const [recentProcIds, setRecentProcIds] = useState([]);
  const [procedureListSearch, setProcedureListSearch] = useState("");
  const [clientListSearch, setClientListSearch] = useState("");
  const [clientSortMode, setClientSortMode] = useState("name");
  const [procSortMode, setProcSortMode] = useState("name");
  const [clientPinNotes, setClientPinNotes] = useState(false);
  const [salesPinNotes, setSalesPinNotes] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(() => {
    try { return localStorage.getItem("kas_notif_enabled") === "1"; } catch { return false; }
  });
  const [notifMinutes, setNotifMinutes] = useState(() => {
    try {
      const v = parseInt(localStorage.getItem("kas_notif_minutes") || "0", 10);
      return isNaN(v) ? 0 : Math.max(0, v);
    } catch { return 0; }
  });
  const [notifPendingId, setNotifPendingId] = useState(null);
  const [newClientName, setNewClientName] = useState("");
  const [newClientRegistrationDate, setNewClientRegistrationDate] =
    useState(getToday());
  const [newClientNotes, setNewClientNotes] = useState("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [newSale, setNewSale] = useState(getInitialSaleState());

  useEffect(() => {
    if (newSale.date && newSale.time) {
      try {
        const saleDt = new Date(newSale.date + "T" + newSale.time);
        if (Number.isFinite(saleDt.getTime())) {
          const isFuture = saleDt.getTime() > Date.now();
          if (newSale.isDeferred !== isFuture) {
            setNewSale((prev) => ({ ...prev, isDeferred: isFuture }));
          }
        }
      } catch (e) {}
    }
  }, [newSale.date, newSale.time]);
  const [manualService, setManualService] = useState({
    name: "",
    price: "",
    income: "",
    active: false,
  });

  const [confirmData, setConfirmData] = useState({
    isOpen: false,
    onConfirm: null,
    message: "",
  });

  const fileInputRef = useRef(null);
  const saleClientWrapRef = useRef(null);
  const statsClientWrapRef = useRef(null);
  const reportFilterWrapRef = useRef(null);
  const saleClientRef = useRef(null);
  const saleDateRef = useRef(null);
  const saleTimeRef = useRef(null);
  const manualNameRef = useRef(null);
  const manualPriceRef = useRef(null);
  const manualIncomeRef = useRef(null);
  const manualSaleIncomeRef = useRef(null);
  const clientInputRef = useRef(null);
  const clientDateRef = useRef(null);
  const procNameRef = useRef(null);
  const procPriceRef = useRef(null);
  const procIncomeRef = useRef(null);
  const lastBackAtRef = useRef(0);
  const backHintTimerRef = useRef(null);
  const lastLayerCloseAtRef = useRef(0);

  const closeTopLayerForBack = () => {
    if (confirmData.isOpen) {
      setConfirmData((prev) => ({ ...prev, isOpen: false }));
      return true;
    }

    if (isNotifMenuOpen || isDashPeriodMenuOpen) {
      setIsNotifMenuOpen(false);
      setIsDashPeriodMenuOpen(false);
      return true;
    }

    if (showStatsClientSuggestions) {
      setShowStatsClientSuggestions(false);
      return true;
    }

    if (showClientSuggestions) {
      setShowClientSuggestions(false);
      return true;
    }

    if (reportDrillItem) {
      setReportDrillItem(null);
      return true;
    }

    if (reportShowFilters || reportFilterPanel) {
      setReportShowFilters(false);
      setReportFilterPanel(null);
      return true;
    }

    // Stack pop order (topmost first)
    if (saleDetailsId) {
      setSaleDetailsId(null);
      return true;
    }

    if (isModalOpen) {
      setIsModalOpen(false);
      return true;
    }

    if (isProcModalOpen) {
      setIsProcModalOpen(false);
      return true;
    }

    if (isClientModalOpen) {
      setIsClientModalOpen(false);
      return true;
    }

    if (isClientHistoryOpen) {
      setIsClientHistoryOpen(false);
      return true;
    }

    if (isCalendarScreenOpen) {
      setIsCalendarScreenOpen(false);
      return true;
    }

    if (isStatsChartOpen || isStatsBreakdownOpen) {
      setIsStatsChartOpen(false);
      setIsStatsBreakdownOpen(false);
      return true;
    }

    if (activeTab !== "dashboard") {
      setTabDirection("right");
      setActiveTab("dashboard");
      return true;
    }

    return false;
  };

  const handleBackNavigation = () => {
    if (closeTopLayerForBack()) {
      setBackHint(false);
      lastBackAtRef.current = 0;
      lastLayerCloseAtRef.current = Date.now();
      window.clearTimeout(backHintTimerRef.current);
      return false;
    }

    const isCleanDashboard =
      activeTab === "dashboard" &&
      !isStatsOpen &&
      !isStatsChartOpen &&
      !isStatsBreakdownOpen &&
      !isModalOpen &&
      !isProcModalOpen &&
      !isClientModalOpen &&
      !isClientHistoryOpen &&
      !isCalendarScreenOpen &&
      !saleDetailsId &&
      !reportDrillItem &&
      !confirmData.isOpen;

    if (!isCleanDashboard) {
      lastBackAtRef.current = 0;
      return false;
    }

    const now = Date.now();

    if (now - lastLayerCloseAtRef.current < BACK_LAYER_COOLDOWN) {
      lastBackAtRef.current = 0;
      setBackHint(true);
      window.clearTimeout(backHintTimerRef.current);
      backHintTimerRef.current = window.setTimeout(() => {
        setBackHint(false);
      }, BACK_EXIT_DELAY);
      return false;
    }

    if (
      lastBackAtRef.current > 0 &&
      now - lastBackAtRef.current < BACK_EXIT_DELAY
    ) {
      window.clearTimeout(backHintTimerRef.current);
      setBackHint(false);
      lastBackAtRef.current = 0;
      exitApp();
      return true;
    }

    lastBackAtRef.current = now;
    setBackHint(true);
    window.clearTimeout(backHintTimerRef.current);
    backHintTimerRef.current = window.setTimeout(() => {
      setBackHint(false);
      lastBackAtRef.current = 0;
    }, BACK_EXIT_DELAY);

    return false;
  };

  const { backHandlerRef, lastPopstateAtRef } = useBackListener(
    handleBackNavigation,
    () => {
      window.clearTimeout(backHintTimerRef.current);
    },
  );

  useEffect(() => {
    if (
      !showClientSuggestions &&
      !showStatsClientSuggestions &&
      !reportFilterPanel
    ) {
      return;
    }

    const handleOutside = (event) => {
      const target = event.target;
      if (
        showClientSuggestions &&
        saleClientWrapRef.current &&
        !saleClientWrapRef.current.contains(target)
      ) {
        setShowClientSuggestions(false);
      }
      if (
        showStatsClientSuggestions &&
        statsClientWrapRef.current &&
        !statsClientWrapRef.current.contains(target)
      ) {
        setShowStatsClientSuggestions(false);
      }
      if (
        reportFilterPanel &&
        reportFilterWrapRef.current &&
        !reportFilterWrapRef.current.contains(target)
      ) {
        setReportFilterPanel(null);
      }
    };

    document.addEventListener("pointerdown", handleOutside);
    return () => document.removeEventListener("pointerdown", handleOutside);
  }, [showClientSuggestions, showStatsClientSuggestions, reportFilterPanel]);



  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 320);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);



  useEffect(() => {
    try { localStorage.setItem("kas_dashPeriodEnabled", dashPeriodEnabled ? "true" : "false"); } catch {}
  }, [dashPeriodEnabled]);

  useEffect(() => {
    try { localStorage.setItem("kas_dashPeriod", dashPeriod); } catch {}
  }, [dashPeriod]);

  const { prevFiredSaleId } = useReminders({
    sales,
    notifEnabled,
    notifMinutes,
    onOpenSale: (saleId) => {
      setSaleDetailsId(saleId);
      setActiveTab("dashboard");
    },
  });

  useEffect(() => {
    if (isModalOpen && !selectedSale) {
      if (!newSale.clientName?.trim()) {
        setTimeout(() => saleClientRef.current?.focus(), 50);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen, selectedSale]);

  useEffect(() => {
    if (manualService.active) {
      if (manualService.name?.trim()) {
        setTimeout(() => manualPriceRef.current?.focus(), 50);
      } else {
        setTimeout(() => manualNameRef.current?.focus(), 50);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manualService.active]);

  useEffect(() => {
    if (isClientModalOpen) {
      setTimeout(() => clientInputRef.current?.focus(), 50);
    }
  }, [isClientModalOpen]);

  useEffect(() => {
    if (isProcModalOpen) {
      setTimeout(() => procNameRef.current?.focus(), 50);
    }
  }, [isProcModalOpen]);

  const filteredSales = useMemo(() => {
    // Запрос разбивается на ключевые слова; каждое слово должно
    // встретиться в ЛЮБОМ поле чека (порядок слов не важен).
    const tokens = searchQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
    
    let baseSales = sales;
    if (dashPeriodEnabled) {
      const today = getToday();
      baseSales = sales.filter(s => {
        if (!s.date) return false;
        if (dashPeriod === "today") return s.date === today;
        if (dashPeriod === "month") return s.date.substring(0, 7) === today.substring(0, 7);
        if (dashPeriod === "year") return s.date.substring(0, 4) === today.substring(0, 4);
        return true;
      });
    }

    const sorted = sortSalesByDateTimeDesc(
      baseSales.filter((sale) => {
        const matchSelectedCategory = selectedCategories.includes(sale.category);

        if (!tokens.length) return matchSelectedCategory;

        // Единый «стог сена» из всех полей чека: каждое ключевое слово
        // может совпасть с разным полем (имя + услуга + заметка и т.д.).
        const parts = [
          String(sale.clientName || ""),
          String(sale.notes || ""),
          String(sale.id || ""),
          String(sale.category || ""),
        ];
        if (sale.category === SALON_PAYROLL_CATEGORY && sale.payrollType) {
          const pt = PAYROLL_TYPES.find((p) => p.id === sale.payrollType);
          if (pt) parts.push(pt.label);
        }
        for (const item of sale.items || []) {
          parts.push(String(item.name || ""));
        }
        const haystack = parts.join(" ").toLowerCase();

        return matchSelectedCategory && tokens.every((t) => haystack.includes(t));
      }),
    );

    if (salesPinNotes) {
      const withNotes = sorted.filter((s) => !!s.notes?.trim());
      const without = sorted.filter((s) => !s.notes?.trim());
      return [...withNotes, ...without];
    }

    return sorted;
  }, [sales, searchQuery, selectedCategories, salesPinNotes, dashPeriodEnabled, dashPeriod]);

  const filteredClients = useMemo(() => {
    const q = clientListSearch.trim().toLowerCase();

    const filtered = clients.filter((client) => {
      if (!q) return true;
      return client.name.toLowerCase().includes(q);
    });

    const sorted = [...filtered].sort((a, b) => {
      if (clientSortMode === "date") {
        const da = a.registeredAt || "";
        const db = b.registeredAt || "";
        if (da !== db) return db.localeCompare(da);
        return a.name.localeCompare(b.name, "ru");
      }
      return a.name.localeCompare(b.name, "ru");
    });

    if (clientPinNotes) {
      const withNotes = sorted.filter((c) => !!c.notes?.trim());
      const without = sorted.filter((c) => !c.notes?.trim());
      return [...withNotes, ...without];
    }

    return sorted;
  }, [clients, clientListSearch, clientSortMode, clientPinNotes]);

  const clientSuggestions = useMemo(() => {
    const q = newSale.clientName.trim().toLowerCase();
    const sorted = [...clients].sort((a, b) =>
      a.name.localeCompare(b.name, "ru"),
    );

    if (!q) return sorted;
    return sorted.filter((client) => client.name.toLowerCase().includes(q));
  }, [clients, newSale.clientName]);

  const filteredProcedures = useMemo(() => {
    const q = procedureListSearch.trim().toLowerCase();

    return procedures
      .filter((procedure) =>
        String(procedure.name || "")
          .toLowerCase()
          .includes(q),
      )
      .sort((a, b) => {
        if (procSortMode === "time") {
          const tA = new Date(a.createdAt || a.id || 0).getTime();
          const tB = new Date(b.createdAt || b.id || 0).getTime();
          return tB - tA; // Newest first
        }
        return a.name.localeCompare(b.name, "ru");
      });
  }, [procedures, procedureListSearch, procSortMode]);

  const {
    filteredStatsClients,
    selectedClientSales,
    statsFilteredSales,
    periodStats,
    reportFilteredSales,
    reportServiceStats,
    reportChartData,
    reportPeriodLabel,
    exportReportCsv,
    reportDrillSales,
    statsPeriodLabel,
    statsBreakdownSales,
    statsCalendarMarkedDates,
  } = useStatsData({
    sales,
    clients,
    procedures,
    selectedClient,
    selectedCategories,
    statsClient,
    statsClientSearch,
    statsPeriod,
    statsDay,
    statsDayMonth,
    customRange,
    reportRange,
    reportCategories,
    reportClients,
    reportServices,
    reportGroupBy,
    reportDrillItem,
    reportDrillSort,
    statsBreakdownType,
    statsBreakdownFilter,
  });

  const dashboardMonthSales = useMemo(() => {
    const now = new Date();

    return sales.filter((sale) => {
      if (sale.isDeferred) return false;

      const saleDate = parseDateKey(sale.date);
      if (!saleDate) return false;

      return (
        saleDate.getMonth() === now.getMonth() &&
        saleDate.getFullYear() === now.getFullYear()
      );
    });
  }, [sales]);

  const dashboardStats = useMemo(
    () => calculateStats(dashboardMonthSales),
    [dashboardMonthSales],
  );


  const saleDetails = useMemo(
    () => sales.find((sale) => sale.id === saleDetailsId) || null,
    [sales, saleDetailsId],
  );

  const calendarMarkedDates = useMemo(() => {
    const map = new Map();
    sales.forEach((sale) => {
      if (!sale.date) return;
      if (!MARKED_CATEGORIES.includes(sale.category)) return;
      if (!map.has(sale.date)) map.set(sale.date, new Set());
      map.get(sale.date).add(sale.category);
    });
    return map;
  }, [sales]);

  const calendarScreenSales = useMemo(() => {
    let data;
    if (calendarScreenSelectedDate) {
      data = sales.filter((sale) => sale.date === calendarScreenSelectedDate);
    } else {
      const year = calendarScreenMonth.getFullYear();
      const month = String(calendarScreenMonth.getMonth() + 1).padStart(2, "0");
      const prefix = `${year}-${month}-`;
      data = sales.filter((sale) => sale.date && sale.date.startsWith(prefix));
    }
    return sortSalesByDateTimeDesc(data);
  }, [sales, calendarScreenSelectedDate, calendarScreenMonth]);

  const resetSaleForm = (initialClientName = "") => {
    const initialState = getInitialSaleState();
    if (initialClientName) initialState.clientName = initialClientName;
    setNewSale(initialState);
    setSelectedSale(null);
    setManualService({
      name: "",
      price: "",
      income: "",
      active: false,
    });
    setProcSearch("");
    setShowClientSuggestions(false);
  };

  const resetClientForm = () => {
    setEditingClient(null);
    setNewClientName("");
    setNewClientRegistrationDate(getToday());
    setNewClientNotes("");
  };

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category],
    );
  };

  const handleNextFocus = (event, nextRef) => {
    if (event.key === "Enter" || (event.keyCode === 13 && event.keyCode !== 229) || event.which === 13) {
      event.preventDefault();
      event.stopPropagation();

      if (nextRef?.current) {
        setTimeout(() => {
          nextRef.current?.focus();
        }, 100);
      } else {
        setTimeout(() => {
          event.target.blur();
        }, 100);
      }
    }
  };

  const handleManualServiceFocus = (e: any) => {
    const container = e.target.closest('[class*="overflow-y-auto"]');
    const block = e.target.closest('.rounded-2xl');
    if (container && block) {
      setTimeout(() => {
        const cRect = container.getBoundingClientRect();
        const bRect = block.getBoundingClientRect();
        const targetScrollTop = container.scrollTop + (bRect.top - cRect.top) - 4;
        container.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
      }, 400);
    }
  };

  const isSaleFormValid = () => {
    const isPayrollSale = newSale.category === SALON_PAYROLL_CATEGORY;
    return isPayrollSale || Boolean(newSale.clientName?.trim());
  };

  const requestSaveSale = () => {
    if (!isSaleFormValid()) return;
    if (selectedSale) {
      setConfirmData({
        isOpen: true,
        message: "Сохранить изменения чека?",
        variant: "save",
        onConfirm: saveSale,
      });
    } else {
      saveSale();
    }
  };

  const handleSaleEnterKey = (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.blur();
    requestSaveSale();
  };

  const handleSelectClient = (name) => {
    setNewSale((prev) => ({ ...prev, clientName: name }));
    setShowClientSuggestions(false);

    requestAnimationFrame(() => {
      saleClientRef.current?.blur();
    });
  };

  const handleClientNameChange = (e) => {
    const value = e.target.value;
    setNewSale((prev) => ({ ...prev, clientName: value }));
    setShowClientSuggestions(true);
  };

  const openNewClientModal = () => {
    resetClientForm();
    setIsClientModalOpen(true);
  };

  const openEditClientModal = (client) => {
    setEditingClient(client);
    setNewClientName(client.name || "");
    setNewClientRegistrationDate(client.registeredAt || getToday());
    setNewClientNotes(client.notes || "");
    setIsClientModalOpen(true);
  };

  const openClientHistory = (client) => {
    setSelectedClient(client);
    setIsClientHistoryOpen(true);
  };

  const openSaleDetails = (sale) => {
    setSaleDetailsId(sale.id);
  };

  const openStatsBreakdown = (type) => {
    setStatsBreakdownType(type);
    setIsStatsBreakdownOpen(true);
  };

  const handleSelectStatsClient = (name) => {
    setStatsClient(name);
    setStatsClientSearch(name === "all" ? "" : name);
    setShowStatsClientSuggestions(false);
  };

  const handleSelectPayrollType = (type) => {
    setNewSale((prev) => ({
      ...prev,
      payrollType: type,
      clientName: "",
      items: [],
    }));
    setShowClientSuggestions(false);
    setProcSearch("");
  };

  const openEditSale = (sale) => {
    setSaleDetailsId(null);
    setSelectedSale(sale);
    setNewSale({
      ...getInitialSaleState(),
      ...sale,
      items: Array.isArray(sale.items)
        ? sale.items.map((item) => ({ ...item }))
        : [],
      notes: sale.notes || "",
      isDeferred: Boolean(sale.isDeferred),
    });
    setIsModalOpen(true);
  };

  const repeatSale = (sale) => {
    setSaleDetailsId(null);
    setSelectedSale(null);
    setNewSale({
      ...getInitialSaleState(),
      ...sale,
      id: undefined,
      date: getToday(),
      time: getCurrentTime(),
      isDeferred: false,
      notes: sale.notes || "",
      items: Array.isArray(sale.items)
        ? sale.items.map((item) => ({ ...item, id: Date.now() + Math.random() }))
        : [],
    });
    setIsModalOpen(true);
  };

  const requestDeleteSale = (id) => {
    const _delId = Math.abs(String(id).split("").reduce((h, ch) => (h << 5) - h + ch.charCodeAt(0) | 0, 0)) % 999000 + 1;
    try {
      const _KN = window.Capacitor?.Plugins?.KasNotification;
      _KN?.cancel?.({ id: _delId }).catch(() => {});
    } catch {}
    setConfirmData({
      isOpen: true,
      message: "Удалить чек?",
      onConfirm: () => {
        setSales((prev) => prev.filter((sale) => sale.id !== id));
        setSaleDetailsId((current) => (current === id ? null : current));
      },
    });
  };

  const conductSale = (sale) => {
    setSales((prev) =>
      prev.map((item) =>
        item.id === sale.id
          ? {
              ...item,
              isDeferred: false,
            }
          : item,
      ),
    );
    setSaleDetailsId(null);
  };

  const openCalendarScreen = () => {
    setCalendarScreenMonth(parseDateKey(getToday()) || new Date());
    setCalendarScreenSelectedDate(null);
    setIsCalendarScreenOpen(true);
  };

  const handleDashboardNav = () => {
    goToTab("dashboard");
  };

  const SWIPE_TABS = ["dashboard", "clients", "procedures", "stats"];
  const swipeStartRef = useRef(null);
  const [tabDirection, setTabDirection] = useState(null);

  const goToTab = (next, direction = null) => {
    lastBackAtRef.current = 0;
    setBackHint(false);
    window.clearTimeout(backHintTimerRef.current);
    if (next === "stats") {
      setIsCalendarScreenOpen(false);
      setTabDirection(direction);
      setActiveTab("stats");
      setIsStatsOpen(true);
      return;
    }
    setIsCalendarScreenOpen(false);
    setIsStatsOpen(false);
    setTabDirection(direction);
    setActiveTab(next);
  };

  const handleMainTouchStart = (e) => {
    if (e.touches.length !== 1) {
      swipeStartRef.current = null;
      return;
    }
    const t = e.touches[0];
    swipeStartRef.current = { x: t.clientX, y: t.clientY, time: Date.now() };
  };

  const handleMainTouchEnd = (e) => {
    const start = swipeStartRef.current;
    swipeStartRef.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    if (!t) return;
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    const dt = Date.now() - start.time;
    if (dt > 700) return;
    if (Math.abs(dx) < 60) return;
    if (Math.abs(dy) > Math.abs(dx) * 0.7) return;
    const tabKey = SWIPE_TABS.includes(activeTab) ? activeTab : "dashboard";
    const idx = SWIPE_TABS.indexOf(tabKey);
    if (idx === -1) return;
    let nextIdx = idx;
    if (dx < 0) nextIdx = Math.min(SWIPE_TABS.length - 1, idx + 1);
    else nextIdx = Math.max(0, idx - 1);
    if (nextIdx === idx) return;
    goToTab(SWIPE_TABS[nextIdx], dx < 0 ? "left" : "right");
  };

  const handleClientsNav = () => {
    goToTab("clients");
  };

  const handleProceduresNav = () => {
    goToTab("procedures");
  };

  const handleStatsNav = () => {
    goToTab("stats");
  };

  const handleStatsClose = () => {
    setIsStatsOpen(false);
    if (activeTab === "stats") {
      setActiveTab("dashboard");
    }
  };

  const handlePrimaryAction = () => {
    setIsCalendarScreenOpen(false);

    if (activeTab === "dashboard") openNewSaleModal();
    else if (activeTab === "procedures") openNewProcedureModal();
    else if (activeTab === "clients") openNewClientModal();
    else openNewSaleModal();
  };

  const handleSaveClient = () => {
    const name = newClientName.trim();
    const registeredAt = newClientRegistrationDate || getToday();

    if (!name) return;

    const duplicate = clients.some(
      (client) =>
        client.id !== editingClient?.id &&
        client.name.toLowerCase() === name.toLowerCase(),
    );

    if (duplicate) {
      alert("Клиент с таким именем уже есть.");
      return;
    }

    const notes = newClientNotes.trim();

    if (editingClient) {
      const oldName = editingClient.name;
      const updatedClient = { ...editingClient, name, registeredAt, notes };

      setClients((prev) =>
        prev.map((client) =>
          client.id === editingClient.id ? updatedClient : client,
        ),
      );

      if (oldName !== name) {
        setSales((prev) =>
          prev.map((sale) =>
            sale.clientName === oldName ? { ...sale, clientName: name } : sale,
          ),
        );
      }

      if (selectedClient?.id === editingClient.id) {
        setSelectedClient(updatedClient);
      }
    } else {
      setClients((prev) => [
        ...prev,
        { id: Date.now(), name, registeredAt, notes },
      ]);
    }

    setIsClientModalOpen(false);
    resetClientForm();
  };

  const saveSale = () => {
    const isPayrollSale = newSale.category === SALON_PAYROLL_CATEGORY;
    const isSalonServicesSale = newSale.category === SALON_SERVICES_CATEGORY;
    const clientName = isPayrollSale ? "" : newSale.clientName?.trim();

    if (!isPayrollSale && !clientName) return;

    if (
      clientName &&
      !clients.some(
        (client) => client.name.toLowerCase() === clientName.toLowerCase(),
      )
    ) {
      setClients((prev) => [
        ...prev,
        {
          id: Date.now(),
          name: clientName,
          registeredAt: newSale.date || getToday(),
        },
      ]);
    }

    const saleData = {
      clientName,
      date: newSale.date || getToday(),
      time: newSale.time || getCurrentTime(),
      category: newSale.category,
      id: selectedSale?.id || Date.now(),
      items: isSalonServicesSale
        ? (newSale.items || []).map((item) => ({ ...item }))
        : [],
      manualIncome:
        isSalonServicesSale || isPayrollSale
          ? ""
          : Number(newSale.manualIncome || 0),
      tips:
        isSalonServicesSale || isPayrollSale ? Number(newSale.tips || 0) : 0,
      notes: newSale.notes?.trim() || "",
      isDeferred: Boolean(newSale.isDeferred),
      payrollType: isPayrollSale
        ? newSale.payrollType || PAYROLL_TYPES[0].id
        : "",
      salonExtraType: "tips",
    };

    setSales((prev) =>
      selectedSale
        ? prev.map((sale) => (sale.id === selectedSale.id ? saleData : sale))
        : [saleData, ...prev],
    );

    setIsModalOpen(false);
    setSaleDetailsId(null);
    resetSaleForm();
  };

  const handleAddManualService = () => {
    const name = manualService.name.trim();
    if (!name || !manualService.price) return;

    let priceStr = String(manualService.price).replace(/,/g, ".");
    let parsedPrice = Number(priceStr);

    let incomeStr = manualService.income
      ? String(manualService.income).replace(/,/g, ".")
      : priceStr;
    let parsedIncome = Number(incomeStr);

    if (isNaN(parsedPrice) || parsedPrice <= 0) parsedPrice = 0;
    if (isNaN(parsedIncome) || parsedIncome <= 0) parsedIncome = parsedPrice;

    if (
      !procedures.some((proc) => proc.name.toLowerCase() === name.toLowerCase())
    ) {
      const today = getToday();
      setProcedures((prev) => [
        ...prev,
        {
          id: Date.now(),
          name,
          price: parsedPrice,
          income: parsedIncome,
          createdAt: today,
          updatedAt: today,
        },
      ]);
    }

    const item = {
      id: `manual-${Date.now()}`,
      instanceId: Date.now() + Math.random(),
      name,
      price: parsedPrice,
      income: parsedIncome,
      actualPrice: "",
    };

    setNewSale((prev) => ({
      ...prev,
      items: [...(prev.items || []), item],
    }));

    setManualService({
      name: "",
      price: "",
      income: "",
      active: false,
    });
  };

  const updateItemActualPrice = (instanceId, value) => {
    setNewSale((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.instanceId === instanceId ? { ...item, actualPrice: value } : item,
      ),
    }));
  };

  const { handleExport, handleImport } = useBackupIO({
    sales,
    procedures,
    clients,
    setSales,
    setProcedures,
    setClients,
    notify: (payload) =>
      setConfirmData({
        isOpen: true,
        variant: payload.variant,
        title: payload.title,
        message: payload.message,
      }),
  });

  const handleRecalcDateChange = (e) => {
    let val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length > 2) val = val.slice(0, 2) + '.' + val.slice(2);
    if (val.length > 5) val = val.slice(0, 5) + '.' + val.slice(5, 7);
    setProcRecalcDate(val);
  };

  const handleSaveProcedure = () => {
    const name = (
      editingProc ? editingProc.name : newSale.tempProcName
    )?.trim();
    const price = editingProc ? editingProc.price : newSale.tempProcPrice;
    const income = editingProc ? editingProc.income : newSale.tempProcIncome;

    if (!name) return;

    const today = getToday();
    const isEdit = !!editingProc;

    const commit = () => {
      const procData = {
        id: editingProc?.id || Date.now(),
        name,
        price: Number(price || 0),
        income: Number(income || 0),
        createdAt: editingProc?.createdAt || today,
        updatedAt: today,
      };

      setProcedures((prev) =>
        isEdit
          ? prev.map((proc) => (proc.id === editingProc.id ? procData : proc))
          : [...prev, procData],
      );

      setEditingProc(null);
      setIsProcModalOpen(false);
      setNewSale((prev) => ({
        ...prev,
        tempProcName: "",
        tempProcPrice: "",
        tempProcIncome: "",
      }));
    };

    if (isEdit) {
      setConfirmData({
        isOpen: true,
        message: `Сохранить изменения услуги "${name}"?`,
        variant: "save",
        onConfirm: commit,
      });
    } else {
      commit();
    }
  };

  const openNewSaleModal = () => {
    setSaleDetailsId(null);
    resetSaleForm(searchQuery.trim());
    setIsModalOpen(true);
  };

  const openNewProcedureModal = () => {
    setEditingProc(null);
    setNewSale((prev) => ({
      ...prev,
      tempProcName: "",
      tempProcPrice: "",
      tempProcIncome: "",
    }));
    setIsProcModalOpen(true);
  };

  const isPayrollSale = newSale.category === SALON_PAYROLL_CATEGORY;
  const isSalonServicesSale = newSale.category === SALON_SERVICES_CATEGORY;
  const selectedPayrollType = getPayrollType(newSale.payrollType);

  
  const uiContextValue = useMemo(() => ({
    showStatsClientSuggestions,
    setShowStatsClientSuggestions,
    isModalOpen,
    setIsModalOpen,
    isClientModalOpen,
    setIsClientModalOpen,
    isProcModalOpen,
    setIsProcModalOpen,
    isStatsOpen,
    setIsStatsOpen,
    isStatsChartOpen,
    setIsStatsChartOpen,
    reportRange,
    setReportRange,
    reportRangeEditing,
    setReportRangeEditing,
    reportClients,
    setReportClients,
    reportClientSearch,
    setReportClientSearch,
    reportCategories,
    setReportCategories,
    reportServices,
    setReportServices,
    reportServiceSearch,
    setReportServiceSearch,
    reportShowFilters,
    setReportShowFilters,
    reportFilterPanel,
    setReportFilterPanel,
    reportChartType,
    setReportChartType,
    reportGroupBy,
    setReportGroupBy,
    reportDrillItem,
    setReportDrillItem,
    reportDrillSort,
    setReportDrillSort,
    isStatsBreakdownOpen,
    setIsStatsBreakdownOpen,
    isTimePickerOpen,
    setIsTimePickerOpen,
    isDatePickerOpen,
    setIsDatePickerOpen,
    calendarScreenMode,
    setCalendarScreenMode,
    calendarScreenTextValue,
    setCalendarScreenTextValue,
    calendarScreenTextError,
    setCalendarScreenTextError,
    statsBreakdownType,
    setStatsBreakdownType,
    isClientHistoryOpen,
    setIsClientHistoryOpen,
    isCalendarScreenOpen,
    setIsCalendarScreenOpen,
    showClientSuggestions,
    setShowClientSuggestions,
    backHint,
    setBackHint,
    showScrollTop,
    setShowScrollTop,
    selectedSale,
    setSelectedSale,
    saleDetailsId,
    setSaleDetailsId,
    selectedClient,
    setSelectedClient,
    selectedCategories,
    setSelectedCategories,
    searchQuery,
    setSearchQuery,
    statsPeriod,
    setStatsPeriod,
    statsClient,
    setStatsClient,
    statsClientSearch,
    setStatsClientSearch,
    statsDay,
    setStatsDay,
    statsDayMonth,
    setStatsDayMonth,
    calendarScreenMonth,
    setCalendarScreenMonth,
    customRangeEditing,
    setCustomRangeEditing,
    customRange,
    setCustomRange,
    editingProc,
    setEditingProc,
    editingClient,
    setEditingClient,
    procSearch,
    setProcSearch,
    isNotifMenuOpen,
    setIsNotifMenuOpen,
    dashPeriodEnabled,
    setDashPeriodEnabled,
    dashPeriod,
    setDashPeriod,
    isDashPeriodMenuOpen,
    setIsDashPeriodMenuOpen,
    recentProcIds,
    setRecentProcIds,
    procedureListSearch,
    setProcedureListSearch,
    clientListSearch,
    setClientListSearch,
    clientSortMode,
      setClientSortMode,
      procSortMode,
      setProcSortMode,
    clientPinNotes,
    setClientPinNotes,
    salesPinNotes,
    setSalesPinNotes,
    notifEnabled,
    setNotifEnabled,
    notifMinutes,
    setNotifMinutes,
    notifPendingId,
    setNotifPendingId,
    prevFiredSaleId,
    newClientName,
    setNewClientName,
    newClientNotes,
    setNewClientNotes,
    isCalendarOpen,
    setIsCalendarOpen,
    newSale,
    setNewSale,
    manualService,
    setManualService,
    confirmData,
    setConfirmData,
    fileInputRef,
    saleClientWrapRef,
    statsClientWrapRef,
    reportFilterWrapRef,
    saleClientRef,
    saleDateRef,
    saleTimeRef,
    manualNameRef,
    manualPriceRef,
    manualIncomeRef,
    manualSaleIncomeRef,
    clientInputRef,
    clientDateRef,
    procNameRef,
    procPriceRef,
    procIncomeRef,
    backHandlerRef,
    lastBackAtRef,
    backHintTimerRef,
    lastLayerCloseAtRef,
    lastPopstateAtRef,
    closeTopLayerForBack,
    handleBackNavigation,
    filteredSales,
    filteredClients,
    clientSuggestions,
    filteredProcedures,
    filteredStatsClients,
    selectedClientSales,
    calculateStats,
    dashboardMonthSales,
    dashboardStats,
    statsFilteredSales,
    periodStats,
    reportFilteredSales,
    reportServiceStats,
    getReportSaleAmount,
    reportChartData,
    reportPeriodLabel,
    exportReportCsv,
    reportDrillSales,
    statsPeriodLabel,
    statsBreakdownSales,
    statsCalendarMarkedDates,
    saleDetails,
    calendarMarkedDates,
    calendarScreenSales,
    resetSaleForm,
    resetClientForm,
    toggleCategory,
    handleNextFocus,
    isSaleFormValid,
    requestSaveSale,
    handleSaleEnterKey,
    handleSelectClient,
    handleClientNameChange,
    openNewClientModal,
    openEditClientModal,
    openClientHistory,
    openSaleDetails,
    openStatsBreakdown,
    handleSelectStatsClient,
    handleSelectPayrollType,
    openEditSale,
    repeatSale,
    requestDeleteSale,
    conductSale,
    openCalendarScreen,
    handleDashboardNav,
    SWIPE_TABS,
    swipeStartRef,
    tabDirection,
    setTabDirection,
    goToTab,
    handleMainTouchStart,
    handleMainTouchEnd,
    handleClientsNav,
    handleProceduresNav,
    handleStatsNav,
    handleStatsClose,
    handlePrimaryAction,
    handleSaveClient,
    saveSale,
    handleAddManualService,
    updateItemActualPrice,
    handleExport,
    handleImport,
    handleSaveProcedure,
    openNewSaleModal,
    openNewProcedureModal,
    isPayrollSale,
    isSalonServicesSale,
    selectedPayrollType
  }), [
    showStatsClientSuggestions,
    isModalOpen,
    setIsModalOpen,
    isClientModalOpen,
    setIsClientModalOpen,
    isProcModalOpen,
    setIsProcModalOpen,
    isStatsOpen,
    setIsStatsOpen,
    isStatsChartOpen,
    setIsStatsChartOpen,
    reportRange,
    setReportRange,
    reportRangeEditing,
    setReportRangeEditing,
    reportClients,
    setReportClients,
    reportClientSearch,
    setReportClientSearch,
    reportCategories,
    setReportCategories,
    reportServices,
    setReportServices,
    reportServiceSearch,
    setReportServiceSearch,
    reportShowFilters,
    setReportShowFilters,
    reportFilterPanel,
    setReportFilterPanel,
    reportChartType,
    setReportChartType,
    reportGroupBy,
    setReportGroupBy,
    reportDrillItem,
    setReportDrillItem,
    reportDrillSort,
    setReportDrillSort,
    isStatsBreakdownOpen,
    setIsStatsBreakdownOpen,
    isTimePickerOpen,
    setIsTimePickerOpen,
    isDatePickerOpen,
    setIsDatePickerOpen,
    calendarScreenMode,
    setCalendarScreenMode,
    calendarScreenTextValue,
    setCalendarScreenTextValue,
    calendarScreenTextError,
    setCalendarScreenTextError,
    statsBreakdownType,
    setStatsBreakdownType,
    isClientHistoryOpen,
    setIsClientHistoryOpen,
    isCalendarScreenOpen,
    setIsCalendarScreenOpen,
    showClientSuggestions,
    setShowClientSuggestions,
    backHint,
    setBackHint,
    showScrollTop,
    setShowScrollTop,
    selectedSale,
    setSelectedSale,
    saleDetailsId,
    setSaleDetailsId,
    selectedClient,
    setSelectedClient,
    selectedCategories,
    setSelectedCategories,
    searchQuery,
    setSearchQuery,
    statsPeriod,
    setStatsPeriod,
    statsClient,
    setStatsClient,
    statsClientSearch,
    setStatsClientSearch,
    statsDay,
    setStatsDay,
    statsDayMonth,
    setStatsDayMonth,
    calendarScreenMonth,
    setCalendarScreenMonth,
    customRangeEditing,
    setCustomRangeEditing,
    customRange,
    setCustomRange,
    editingProc,
    setEditingProc,
    editingClient,
    setEditingClient,
    procSearch,
    setProcSearch,
    isNotifMenuOpen,
    setIsNotifMenuOpen,
    recentProcIds,
    setRecentProcIds,
    procedureListSearch,
    setProcedureListSearch,
    clientListSearch,
    setClientListSearch,
    clientSortMode,
    setClientSortMode,
    clientPinNotes,
    setClientPinNotes,
    salesPinNotes,
    setSalesPinNotes,
    notifEnabled,
    setNotifEnabled,
    notifMinutes,
    setNotifMinutes,
    notifPendingId,
    setNotifPendingId,
    prevFiredSaleId,
    newClientName,
    setNewClientName,
    newClientNotes,
    setNewClientNotes,
    isCalendarOpen,
    setIsCalendarOpen,
    newSale,
    setNewSale,
    manualService,
    setManualService,
    confirmData,
    setConfirmData,
    fileInputRef,
    saleClientWrapRef,
    statsClientWrapRef,
    reportFilterWrapRef,
    saleClientRef,
    saleDateRef,
    saleTimeRef,
    manualNameRef,
    manualPriceRef,
    manualIncomeRef,
    manualSaleIncomeRef,
    clientInputRef,
    clientDateRef,
    procNameRef,
    procPriceRef,
    procIncomeRef,
    backHandlerRef,
    lastBackAtRef,
    backHintTimerRef,
    lastLayerCloseAtRef,
    lastPopstateAtRef,
    closeTopLayerForBack,
    handleBackNavigation,
    filteredSales,
    filteredClients,
    clientSuggestions,
    filteredProcedures,
    filteredStatsClients,
    selectedClientSales,
    calculateStats,
    dashboardMonthSales,
    dashboardStats,
    statsFilteredSales,
    periodStats,
    reportFilteredSales,
    reportServiceStats,
    getReportSaleAmount,
    reportChartData,
    reportPeriodLabel,
    exportReportCsv,
    reportDrillSales,
    statsPeriodLabel,
    statsBreakdownSales,
    statsCalendarMarkedDates,
    saleDetails,
    calendarMarkedDates,
    calendarScreenSales,
    resetSaleForm,
    resetClientForm,
    toggleCategory,
    handleNextFocus,
    isSaleFormValid,
    requestSaveSale,
    handleSaleEnterKey,
    handleSelectClient,
    handleClientNameChange,
    openNewClientModal,
    openEditClientModal,
    openClientHistory,
    openSaleDetails,
    openStatsBreakdown,
    handleSelectStatsClient,
    handleSelectPayrollType,
    openEditSale,
    repeatSale,
    requestDeleteSale,
    conductSale,
    openCalendarScreen,
    handleDashboardNav,
    SWIPE_TABS,
    swipeStartRef,
    tabDirection,
    setTabDirection,
    goToTab,
    handleMainTouchStart,
    handleMainTouchEnd,
    handleClientsNav,
    handleProceduresNav,
    handleStatsNav,
    handleStatsClose,
    handlePrimaryAction,
    handleSaveClient,
    saveSale,
    handleAddManualService,
    updateItemActualPrice,
    handleExport,
    handleImport,
    handleSaveProcedure,
    openNewSaleModal,
    openNewProcedureModal,
    isPayrollSale,
    isSalonServicesSale,
    selectedPayrollType
  ]);

    if (!isStoreReady) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#181A20] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#6B5BAE] border-t-transparent"></div>
          <p className="text-sm text-gray-400 font-medium">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <AppUIContext.Provider value={uiContextValue}>
    <div className="min-h-screen overflow-x-hidden bg-[#0F1115] pb-32 font-sans text-white">
      {storageFailed && (
        <div className="mx-auto w-full max-w-2xl px-3 pt-3">
          <div className="rounded-xl border border-red-500/40 bg-red-900/40 px-3 py-2 text-xs text-red-200">
            Хранилище недоступно: данные не загружены и не будут
            перезаписаны. Перезапусти приложение.
          </div>
        </div>
      )}
      <header className="mx-auto flex w-full max-w-2xl items-center justify-between px-3 pt-5 pb-4">
        <div>
          <h1 className="text-2xl font-black italic tracking-tighter text-[#6B5BAE]">
            KAS-БУХГАЛТЕРИЯ
          </h1>
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-40">
            Smart Beauty Finance
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              setActiveTab(
                activeTab === "settings" ? "dashboard" : "settings",
              )
            }
            className="rounded-2xl bg-white/5 p-3 text-gray-400 transition-all active:scale-95"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      <main
        className="mx-auto max-w-2xl space-y-6 px-2"
        onTouchStart={handleMainTouchStart}
        onTouchEnd={handleMainTouchEnd}
      >
        <div
          key={activeTab}
          className={
            tabDirection === "left"
              ? "tab-slide-left"
              : tabDirection === "right"
                ? "tab-slide-right"
                : ""
          }
        >
      {activeTab === "dashboard" && <DashboardScreen />}
      {activeTab === "clients" && <ClientsScreen />}
      {activeTab === "procedures" && <ProceduresScreen />}
      {activeTab === "settings" && <SettingsScreen />}
      {activeTab === "stats" && <StatsScreen />}
        </div>
      </main>
      {!isCalendarScreenOpen && (
        <AppNav
          activeTab={activeTab}
          onDashboard={handleDashboardNav}
          onClients={handleClientsNav}
          onPrimary={handlePrimaryAction}
          onProcedures={handleProceduresNav}
          onStats={handleStatsNav}
        />
      )}

      <BottomSheet
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedSale ? "Правка чека" : "Новый чек"}
        layerClass="z-[150]"
      >
        <div className="space-y-5 pb-8">
          <div className="relative z-20" ref={saleClientWrapRef}>
            <input
              data-form-type="other"
              data-lpignore="true"
              data-1p-ignore="true"
              ref={saleClientRef}
              placeholder={
                isPayrollSale ? "Клиент не требуется" : "Имя клиента"
              }
              className={`w-full rounded-2xl border py-2.5 px-3 font-bold outline-none ${
                isPayrollSale
                  ? "border-white/5 bg-white/0 text-white/35"
                  : "border-white/10 bg-white/5 focus:border-[#6B5BAE]/50"
              }`}
              value={newSale.clientName || ""}
              onChange={handleClientNameChange}
              onFocus={() => {
                if (!isPayrollSale) {
                  setShowClientSuggestions(true);
                  setNewSale((prev) => ({ ...prev, clientName: "" }));
                }
              }}
              onBlur={() => setShowClientSuggestions(false)}
              onKeyDown={(e) => handleNextFocus(e, saleDateRef)}
              enterKeyHint="next"
              autoComplete="off"
              disabled={isPayrollSale}
            />

            {!isPayrollSale &&
              showClientSuggestions &&
              newSale.clientName.trim() &&
              clientSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] max-h-44 overflow-y-auto rounded-2xl border border-white/10 bg-[#15181E] shadow-2xl">
                  {clientSuggestions.slice(0, 20).map((client) => (
                    <button
                      key={client.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelectClient(client.name)}
                      className="flex w-full items-center border-b border-white/5 px-4 py-3 text-left text-sm font-bold text-white last:border-0 active:bg-white/5"
                    >
                      {client.name}
                    </button>
                  ))}
                </div>
              )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              ref={saleDateRef}
              type="button"
              onClick={() => setIsDatePickerOpen(true)}
              className="rounded-2xl border border-white/10 bg-white/5 py-2.5 px-3 text-left text-sm font-bold outline-none"
            >
              {newSale.date ? formatHeaderDate(newSale.date) : "Выберите дату"}
            </button>
            <button
              ref={saleTimeRef}
              type="button"
              onClick={() => setIsTimePickerOpen(true)}
              className="rounded-2xl border border-white/10 bg-white/5 py-2.5 px-3 text-left text-sm font-bold outline-none"
            >
              {newSale.time || "--:--"}
            </button>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
            <div>
              <div className="text-[9px] font-black uppercase tracking-widest text-gray-500">
                Отсроченный платёж
              </div>
              <div className="mt-1 text-[11px] font-bold text-white/60">
                Включить подтверждение оплаты
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setNewSale((prev) => {
                  const nextDeferred = !prev.isDeferred;
                  localStorage.setItem("kas_default_isDeferred", String(nextDeferred));
                  return { ...prev, isDeferred: nextDeferred };
                })
              }
              className={`relative h-5 w-9 rounded-full transition ${
                newSale.isDeferred ? "bg-sky-400" : "bg-white/10"
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
                  newSale.isDeferred ? "left-[18px]" : "left-0.5"
                }`}
              />
            </button>
          </div>

          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: `repeat(${CATEGORIES.length}, 1fr)` }}
          >
            {CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => {
                  setNewSale((prev) => {
                    const nextIsServices = category === SALON_SERVICES_CATEGORY;
                    const nextIsPayroll = category === SALON_PAYROLL_CATEGORY;

                    return {
                      ...prev,
                      category,
                      clientName: nextIsPayroll ? "" : prev.clientName,
                      items: nextIsServices ? prev.items : [],
                      tips: nextIsServices || nextIsPayroll ? prev.tips : "",
                      manualIncome:
                        nextIsServices || nextIsPayroll
                          ? ""
                          : prev.manualIncome,
                      payrollType: prev.payrollType || PAYROLL_TYPES[0].id,
                    };
                  });
                  if (category === SALON_PAYROLL_CATEGORY) {
                    setShowClientSuggestions(false);
                    setProcSearch("");
                  }
                }}
                className={`rounded-xl py-3 text-[10px] font-bold uppercase leading-tight transition-all ${
                  newSale.category === category
                    ? "bg-[#6B5BAE] text-white"
                    : "bg-[#6B5BAE]/20 text-gray-400"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {isSalonServicesSale ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                    Выбор услуг
                  </p>

                  <button
                    type="button"
                    onClick={(e) => {
                      setManualService((prev) => ({
                        ...prev,
                        name: !prev.active && procSearch.trim() ? procSearch.trim() : prev.name,
                        active: !prev.active,
                      }));
                    }}
                    className="flex items-center gap-1 text-[10px] font-black uppercase text-[#6B5BAE]"
                  >
                    {manualService.active ? "Отмена" : "Своя услуга"}
                  </button>
                </div>

                {manualService.active ? (
                  <div
                    className="space-y-3 rounded-xl border border-[#6B5BAE]/20 bg-[#6B5BAE]/5 p-3"
                  >
                    <input
                      data-form-type="other"
                      data-lpignore="true"
                      data-1p-ignore="true"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="sentences"
                      spellCheck={false}
                      ref={manualNameRef}
                      type="text"
                      inputMode="text"
                      placeholder="Название"
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs outline-none"
                      value={manualService.name}
                      onChange={(e) =>
                        setManualService((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      onFocus={handleManualServiceFocus}
                      onKeyDown={(e) => handleNextFocus(e, manualPriceRef)}
                      enterKeyHint="next"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        data-form-type="other"
                        data-lpignore="true"
                        data-1p-ignore="true"
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                        ref={manualPriceRef}
                        type="text"
                        inputMode="decimal"
                        placeholder="Цена"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs outline-none"
                        value={manualService.price}
                        onChange={(e) =>
                          setManualService((prev) => ({
                            ...prev,
                            price: e.target.value,
                          }))
                        }
                        onFocus={handleManualServiceFocus}
                        onKeyDown={(e) => handleNextFocus(e, manualIncomeRef)}
                        enterKeyHint="next"
                      />

                      <input
                        data-form-type="other"
                        data-lpignore="true"
                        data-1p-ignore="true"
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                        ref={manualIncomeRef}
                        type="text"
                        inputMode="decimal"
                        placeholder="Начисление"
                        className="w-full rounded-lg border border-[#6B5BAE]/20 bg-white/5 px-3 py-2 text-xs outline-none"
                        value={manualService.income}
                        onChange={(e) =>
                          setManualService((prev) => ({
                            ...prev,
                            income: e.target.value,
                          }))
                        }
                        onFocus={handleManualServiceFocus}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || (e.keyCode === 13 && e.keyCode !== 229) || e.which === 13) {
                            e.preventDefault();
                            handleAddManualService();
                            manualIncomeRef.current?.blur();
                          }
                        }}
                        enterKeyHint="done"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddManualService();
                        manualIncomeRef.current?.blur();
                      }}
                      className="w-full rounded-lg bg-[#6B5BAE] py-2 text-[10px] font-black uppercase text-white active:scale-95"
                    >
                      Добавить
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      data-form-type="other"
                      data-lpignore="true"
                      data-1p-ignore="true"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="sentences"
                      spellCheck={false}
                      placeholder="Поиск в прайсе..."
                      className="mb-3 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs outline-none"
                      value={procSearch}
                      onChange={(e) => setProcSearch(e.target.value)}
                      onFocus={(e) => {
                        const container = e.target.closest('[class*="overflow-y-auto"]');
                        const block = e.target.closest('.rounded-2xl');
                        if (container && block) {
                          setTimeout(() => {
                            const cRect = container.getBoundingClientRect();
                            const bRect = block.getBoundingClientRect();
                            const targetScrollTop = container.scrollTop + (bRect.top - cRect.top) - 4;
                            container.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
                          }, 400);
                        }
                      }}
                      onClick={(e) => {
                        const container = e.target.closest('[class*="overflow-y-auto"]');
                        const block = e.target.closest('.rounded-2xl');
                        if (container && block) {
                          setTimeout(() => {
                            const cRect = container.getBoundingClientRect();
                            const bRect = block.getBoundingClientRect();
                            const targetScrollTop = container.scrollTop + (bRect.top - cRect.top) - 4;
                            container.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
                          }, 400);
                        }
                      }}
                      onKeyDown={(e) => handleNextFocus(e, null)}
                      enterKeyHint="done"
                    />

                    <div
                      className="flex flex-wrap gap-2 overflow-hidden"
                      style={{ maxHeight: "76px" }}
                    >
                      {[...procedures]
                        .sort((a, b) => {
                          const ai = recentProcIds.indexOf(a.id);
                          const bi = recentProcIds.indexOf(b.id);
                          if (ai === -1 && bi === -1) return 0;
                          if (ai === -1) return 1;
                          if (bi === -1) return -1;
                          return ai - bi;
                        })
                        .filter((procedure) =>
                          procedure.name
                            .toLowerCase()
                            .includes(procSearch.toLowerCase()),
                        )
                        .map((procedure) => (
                          <button
                            key={procedure.id}
                            type="button"
                            onClick={() => {
                              setNewSale((prev) => ({
                                ...prev,
                                items: [
                                  ...prev.items,
                                  {
                                    ...procedure,
                                    instanceId: Date.now() + Math.random(),
                                    actualPrice: "",
                                  },
                                ],
                              }));
                              setProcSearch("");
                              setRecentProcIds((prev) => [
                                procedure.id,
                                ...prev.filter((id) => id !== procedure.id),
                              ]);
                            }}
                            className="rounded-xl bg-white/10 px-3 py-2 text-[10px] font-bold active:scale-95"
                          >
                            {procedure.name}
                          </button>
                        ))}
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-3">
                {(newSale.items || []).map((item, idx) => (
                  <div
                    key={item.instanceId || idx}
                    className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black uppercase tracking-tight text-[#6B5BAE]">
                        {item.name}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setNewSale((prev) => ({
                            ...prev,
                            items: prev.items.filter(
                              (_, itemIdx) => itemIdx !== idx,
                            ),
                          }))
                        }
                        className="p-1 text-red-500/50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-xl border border-white/5 bg-black/20 p-2">
                        <p className="mb-1 text-[7px] font-bold uppercase text-gray-500">
                          База
                        </p>
                        <p className="font-mono text-xs font-bold">
                          {item.price}
                        </p>
                      </div>

                      <div className="rounded-xl border border-[#6B5BAE]/20 bg-black/20 p-2">
                        <p className="mb-1 text-[7px] font-bold uppercase text-[#6B5BAE]">
                          Начисление
                        </p>
                        <p className="font-mono text-xs font-bold">
                          {item.income}
                        </p>
                      </div>

                      <div className="rounded-xl border border-[#6B5BAE]/30 bg-[#6B5BAE]/10 p-2">
                        <p className="mb-1 text-[7px] font-bold uppercase text-white">
                          Фактическая
                        </p>
                        <input
                          data-form-type="other"
                          data-lpignore="true"
                          data-1p-ignore="true"
                          autoComplete="off"
                          autoCorrect="off"
                          autoCapitalize="off"
                          spellCheck={false}
                          type="number"
                          inputMode="decimal"
                          placeholder="---"
                          className="w-full bg-transparent font-mono text-xs font-bold text-white outline-none placeholder:text-white/20"
                          value={item.actualPrice || ""}
                          onChange={(e) =>
                            updateItemActualPrice(
                              item.instanceId,
                              e.target.value,
                            )
                          }
                          onKeyDown={(e) => handleNextFocus(e, null)}
                          enterKeyHint="done"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                    Чаевые
                  </p>
                  <input
                    data-form-type="other"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    type="number"
                    inputMode="decimal"
                    placeholder="0"
                    className="min-w-0 flex-1 bg-transparent text-right text-lg font-black text-emerald-400 outline-none placeholder:text-emerald-400/30"
                    style={{
                      width: `${Math.max(4, String(newSale.tips || "").length + 2)}ch`,
                    }}
                    value={newSale.tips || ""}
                    onChange={(e) =>
                      setNewSale((prev) => ({
                        ...prev,
                        tips: e.target.value,
                      }))
                    }
                    onFocus={(e) => { const el = e.target.closest('[class*="overflow-y-auto"]'); if(el) setTimeout(() => el.scrollTo({ top: el.scrollHeight - el.clientHeight - 44, behavior: 'smooth' }), 150); }} onClick={(e) => { const el = e.target.closest('[class*="overflow-y-auto"]'); if(el) setTimeout(() => el.scrollTo({ top: el.scrollHeight - el.clientHeight - 44, behavior: 'smooth' }), 150); }}
                    onKeyDown={handleSaleEnterKey}
                    enterKeyHint={selectedSale ? "done" : "send"}
                  />
                </div>

                <div className="relative rounded-[2rem] border border-white/10 bg-white/5 p-3">
                  <p className="-mb-0.5 text-[10px] font-black uppercase tracking-widest text-gray-500">
                    Заметки
                  </p>
                  {(newSale.notes || "").length > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setNewSale((prev) => ({ ...prev, notes: "" }))
                      }
                      className="absolute right-2 top-2 z-10 rounded-full bg-white/10 p-0.5 text-white/50 hover:bg-white/20 hover:text-white"
                      tabIndex={-1}
                      aria-label="Очистить заметку"
                    >
                      <X size={12} />
                    </button>
                  )}
                  <textarea
                    data-form-type="other"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="sentences"
                    spellCheck={false}
                    rows={2}
                    placeholder="Комментарий к чеку"
                    className="min-h-[44px] w-full resize-none bg-transparent text-sm font-bold outline-none placeholder:text-white/20"
                    value={newSale.notes || ""}
                    onChange={(e) =>
                      setNewSale((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    onFocus={(e) => { const el = e.target.closest('[class*="overflow-y-auto"]'); if(el) setTimeout(() => el.scrollTo({ top: el.scrollHeight - el.clientHeight - 44, behavior: 'smooth' }), 150); }} onClick={(e) => { const el = e.target.closest('[class*="overflow-y-auto"]'); if(el) setTimeout(() => el.scrollTo({ top: el.scrollHeight - el.clientHeight - 44, behavior: 'smooth' }), 150); }}
                    tabIndex={-1}
                  />
                </div>
              </div>
            </div>
          ) : isPayrollSale ? (
            <div className="space-y-4">
              <div className="rounded-[2rem] border border-sky-400/20 bg-sky-500/10 px-4 py-2.5">
                <p className="mb-1.5 text-[10px] font-black uppercase leading-tight tracking-widest text-sky-300">
                  Подкатегория
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {PAYROLL_TYPES.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => handleSelectPayrollType(type.id)}
                      className={`rounded-2xl px-3 py-2 text-[10px] font-black uppercase leading-tight tracking-widest transition active:scale-95 ${
                        newSale.payrollType === type.id
                          ? "bg-sky-400 text-[#0F1115]"
                          : "bg-white/5 text-sky-100/70"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-sky-400/20 bg-sky-500/10 px-4 py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-sky-300">
                    {selectedPayrollType.label} ({CURRENCY})
                  </p>
                  <input
                    data-form-type="other"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    type="number"
                    inputMode="decimal"
                    className="min-w-0 flex-1 bg-transparent text-right font-black text-sky-100 outline-none placeholder:text-sky-100/20"
                    style={{
                      fontSize: `clamp(1.1rem, ${Math.max(1.5, 3.5 - String(newSale.tips || "").length * 0.22)}rem, 2.5rem)`,
                    }}
                    value={newSale.tips || ""}
                    onChange={(e) =>
                      setNewSale((prev) => ({
                        ...prev,
                        tips: e.target.value,
                      }))
                    }
                    onFocus={(e) => { const el = e.target.closest('[class*="overflow-y-auto"]'); if(el) setTimeout(() => el.scrollTo({ top: el.scrollHeight - el.clientHeight - 44, behavior: 'smooth' }), 150); }} onClick={(e) => { const el = e.target.closest('[class*="overflow-y-auto"]'); if(el) setTimeout(() => el.scrollTo({ top: el.scrollHeight - el.clientHeight - 44, behavior: 'smooth' }), 150); }}
                    onKeyDown={handleSaleEnterKey}
                    enterKeyHint={selectedSale ? "done" : "send"}
                  />
                </div>
              </div>

              <div className="relative rounded-[2rem] border border-white/10 bg-white/5 p-3">
                <p className="-mb-0.5 text-[10px] font-black uppercase tracking-widest text-gray-500">
                  Заметки
                </p>
                {(newSale.notes || "").length > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      setNewSale((prev) => ({ ...prev, notes: "" }))
                    }
                    className="absolute right-2 top-2 z-10 rounded-full bg-white/10 p-0.5 text-white/50 hover:bg-white/20 hover:text-white"
                    tabIndex={-1}
                    aria-label="Очистить заметку"
                  >
                    <X size={12} />
                  </button>
                )}
                <textarea
                  data-form-type="other"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="sentences"
                  spellCheck={false}
                  rows={2}
                  placeholder="Комментарий к чеку"
                  className="min-h-[44px] w-full resize-none bg-transparent text-sm font-bold outline-none placeholder:text-white/20"
                  value={newSale.notes || ""}
                  onChange={(e) =>
                    setNewSale((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  onFocus={(e) => { const el = e.target.closest('[class*="overflow-y-auto"]'); if(el) setTimeout(() => el.scrollTo({ top: el.scrollHeight - el.clientHeight - 44, behavior: 'smooth' }), 150); }} onClick={(e) => { const el = e.target.closest('[class*="overflow-y-auto"]'); if(el) setTimeout(() => el.scrollTo({ top: el.scrollHeight - el.clientHeight - 44, behavior: 'smooth' }), 150); }}
                  tabIndex={-1}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-[3rem] border border-emerald-500/20 bg-emerald-500/10 px-5 py-2 text-center">
                <p className="mb-0.5 text-xs font-bold uppercase leading-tight text-emerald-500">
                  Доход ({CURRENCY})
                </p>

                <input
                  data-form-type="other"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  ref={manualSaleIncomeRef}
                  type="number"
                  inputMode="decimal"
                  className="w-full bg-transparent text-center text-5xl font-black leading-tight outline-none"
                  value={newSale.manualIncome || ""}
                  onChange={(e) =>
                    setNewSale((prev) => ({
                      ...prev,
                      manualIncome: e.target.value,
                    }))
                  }
                  onKeyDown={handleSaleEnterKey}
                  enterKeyHint={selectedSale ? "done" : "send"}
                />
              </div>

              <div className="relative rounded-[2rem] border border-white/10 bg-white/5 p-3">
                <p className="-mb-0.5 text-[10px] font-black uppercase tracking-widest text-gray-500">
                  Заметки
                </p>
                {(newSale.notes || "").length > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      setNewSale((prev) => ({ ...prev, notes: "" }))
                    }
                    className="absolute right-2 top-2 z-10 rounded-full bg-white/10 p-0.5 text-white/50 hover:bg-white/20 hover:text-white"
                    tabIndex={-1}
                    aria-label="Очистить заметку"
                  >
                    <X size={12} />
                  </button>
                )}
                <textarea
                  data-form-type="other"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="sentences"
                  spellCheck={false}
                  rows={2}
                  placeholder="Комментарий к чеку"
                  className="min-h-[44px] w-full resize-none bg-transparent text-sm font-bold outline-none placeholder:text-white/20"
                  value={newSale.notes || ""}
                  onChange={(e) =>
                    setNewSale((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  tabIndex={-1}
                />
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={requestSaveSale}
            disabled={!isPayrollSale && !newSale.clientName?.trim()}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-[2rem] bg-[#6B5BAE] py-3.5 font-black uppercase tracking-widest transition-transform disabled:opacity-50 active:scale-95"
          >
            <CheckCircle2 size={20} /> {selectedSale ? "Обновить" : "Создать"}
          </button>
        </div>
      </BottomSheet>

      <BottomSheet
        isOpen={isProcModalOpen}
        onClose={() => setIsProcModalOpen(false)}
        title={editingProc ? "Правка услуги" : "Новая услуга"}
      >
        <div className="space-y-4 pb-8">
          <input
            data-form-type="other"
            data-lpignore="true"
            data-1p-ignore="true"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="sentences"
            spellCheck={false}
            ref={procNameRef}
            type="text"
            inputMode="text"
            placeholder="Название"
            className="w-full rounded-2xl border border-white/10 bg-white/5 py-2.5 px-3 font-bold outline-none"
            value={editingProc ? editingProc.name : newSale.tempProcName}
            onChange={(e) =>
              editingProc
                ? setEditingProc((prev) => ({ ...prev, name: e.target.value }))
                : setNewSale((prev) => ({
                    ...prev,
                    tempProcName: e.target.value,
                  }))
            }
            onKeyDown={(e) => handleNextFocus(e, procPriceRef)}
            enterKeyHint="next"
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              data-form-type="other"
              data-lpignore="true"
              data-1p-ignore="true"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              ref={procPriceRef}
              type="number"
              inputMode="decimal"
              placeholder="Цена"
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-2.5 px-3 font-bold outline-none"
              value={editingProc ? editingProc.price : newSale.tempProcPrice}
              onChange={(e) =>
                editingProc
                  ? setEditingProc((prev) => ({
                      ...prev,
                      price: e.target.value,
                    }))
                  : setNewSale((prev) => ({
                      ...prev,
                      tempProcPrice: e.target.value,
                    }))
              }
              onKeyDown={(e) => handleNextFocus(e, procIncomeRef)}
              enterKeyHint="next"
            />

            <input
              data-form-type="other"
              data-lpignore="true"
              data-1p-ignore="true"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              ref={procIncomeRef}
              type="number"
              inputMode="decimal"
              placeholder="Начисление"
              className="w-full rounded-2xl border border-[#6B5BAE]/20 bg-white/5 py-2.5 px-3 font-bold outline-none"
              value={editingProc ? editingProc.income : newSale.tempProcIncome}
              onChange={(e) =>
                editingProc
                  ? setEditingProc((prev) => ({
                      ...prev,
                      income: e.target.value,
                    }))
                  : setNewSale((prev) => ({
                      ...prev,
                      tempProcIncome: e.target.value,
                    }))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.keyCode === 13 || e.which === 13) {
                  e.preventDefault();
                  if (!procRecalcEnabled) {
                    handleSaveProcedure();
                    procIncomeRef.current?.blur();
                  }
                }
              }}
              enterKeyHint={procRecalcEnabled ? "next" : "done"}
            />
            
            {editingProc && (
              <div className="mt-4 space-y-3 rounded-2xl border border-white/5 bg-white/5 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest opacity-50">
                    Перерасчёт чеков
                  </span>
                  <button
                    type="button"
                    onClick={() => setProcRecalcEnabled(!procRecalcEnabled)}
                    className={`px-4 py-1.5 rounded-xl font-bold text-xs uppercase transition-colors ${
                      procRecalcEnabled 
                        ? 'bg-green-500 text-white' 
                        : 'bg-white/10 text-gray-400'
                    }`}
                  >
                    {procRecalcEnabled ? 'Вкл' : 'Выкл'}
                  </button>
                </div>
                {procRecalcEnabled && (
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="ДД.ММ.ГГ"
                    className="w-full rounded-xl border border-white/10 bg-[#1E222A] px-3 py-2 text-sm font-bold text-center outline-none focus:border-green-500/50"
                    value={procRecalcDate}
                    onChange={handleRecalcDateChange}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.keyCode === 13 || e.which === 13) {
                         e.preventDefault();
                         handleSaveProcedure();
                      }
                    }}
                  />
                )}
              </div>
            )}
            
          </div>

          <button
            type="button"
            onClick={handleSaveProcedure}
            className="mt-4 w-full rounded-[2rem] bg-[#6B5BAE] py-3.5 font-black uppercase tracking-widest"
          >
            Сохранить
          </button>
        </div>
      </BottomSheet>

      <BottomSheet
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        title={editingClient ? "Правка клиента" : "Новый клиент"}
      >
        <div className="space-y-4 pb-8">
          <input
            data-form-type="other"
            data-lpignore="true"
            data-1p-ignore="true"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            ref={clientInputRef}
            placeholder="ФИО"
            className="w-full rounded-2xl border border-white/10 bg-white/5 py-2.5 px-3 font-bold outline-none focus:border-[#6B5BAE]/50"
            value={newClientName}
            onChange={(e) => setNewClientName(e.target.value)}
            onKeyDown={(e) => handleNextFocus(e, clientDateRef)}
            enterKeyHint="next"
          />

          <div className="space-y-2">
            <p className="px-1 text-[10px] font-black uppercase tracking-widest text-gray-500">
              Дата регистрации
            </p>
            <button
              type="button"
              onClick={() => setIsCalendarOpen(true)}
              className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 py-2.5 px-3 font-bold text-left outline-none"
            >
              <span>
                {newClientRegistrationDate
                  ? (() => {
                      const [y, m, d] = newClientRegistrationDate.split("-");
                      return `${d}.${m}.${y}`;
                    })()
                  : "Выберите дату"}
              </span>
              <Calendar size={16} className="text-white/40" />
            </button>
          </div>

          {isCalendarOpen && (
            <CalendarPicker
              value={newClientRegistrationDate}
              onChange={(v) => setNewClientRegistrationDate(v)}
              onClose={() => setIsCalendarOpen(false)}
            />
          )}

          <div className="relative rounded-[2rem] border border-white/10 bg-white/5 p-3">
            <p className="-mb-0.5 text-[10px] font-black uppercase tracking-widest text-gray-500">
              Заметки
            </p>
            {newClientNotes.length > 0 && (
              <button
                type="button"
                onClick={() => setNewClientNotes("")}
                className="absolute right-2 top-2 z-10 rounded-full bg-white/10 p-0.5 text-white/50 hover:bg-white/20 hover:text-white"
                tabIndex={-1}
                aria-label="Очистить заметку"
              >
                <X size={12} />
              </button>
            )}
            <textarea
              data-form-type="other"
              data-lpignore="true"
              data-1p-ignore="true"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="sentences"
              spellCheck={false}
              rows={2}
              placeholder="Комментарий к клиенту"
              className="min-h-[44px] w-full resize-none bg-transparent text-sm font-bold outline-none placeholder:text-white/20"
              value={newClientNotes}
              onChange={(e) => setNewClientNotes(e.target.value)}
              onFocus={(e) => { const el = e.target.closest('[class*="overflow-y-auto"]'); if(el) setTimeout(() => el.scrollTo({ top: el.scrollHeight - el.clientHeight - 44, behavior: 'smooth' }), 150); }} onClick={(e) => { const el = e.target.closest('[class*="overflow-y-auto"]'); if(el) setTimeout(() => el.scrollTo({ top: el.scrollHeight - el.clientHeight - 44, behavior: 'smooth' }), 150); }}
              tabIndex={-1}
            />
          </div>

          <button
            type="button"
            onClick={() => {
              if (editingClient) {
                setConfirmData({
                  isOpen: true,
                  message: "Сохранить изменения клиента?",
                  variant: "save",
                  onConfirm: handleSaveClient,
                });
              } else {
                handleSaveClient();
              }
            }}
            disabled={!newClientName.trim()}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-[2rem] bg-[#6B5BAE] py-3.5 font-black uppercase tracking-widest disabled:opacity-50"
          >
            <UserPlus size={20} />{" "}
            {editingClient ? "Сохранить клиента" : "Добавить клиента"}
          </button>
        </div>
      </BottomSheet>

      <BottomSheet
        isOpen={isClientHistoryOpen}
        onClose={() => setIsClientHistoryOpen(false)}
        title={
          selectedClient ? `История: ${selectedClient.name}` : "История клиента"
        }
      >
        <div className="space-y-4 pb-8">
          {selectedClient && (
            <div className="rounded-[2rem] border border-white/5 bg-white/5 p-4">
              <div className="text-lg font-bold text-white">
                {selectedClient.name}
              </div>
              <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-gray-400">
                <Calendar size={13} />
                Дата регистрации: {formatDate(selectedClient.registeredAt)}
              </div>
              <div className="mt-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
                Визитов: {selectedClientSales.length}
              </div>
            </div>
          )}

          {selectedClientSales.length === 0 ? (
            <div className="rounded-[2rem] bg-white/5 p-10 text-center text-sm italic text-white/40">
              У клиента пока нет чеков
            </div>
          ) : (
            <div className="space-y-[3px]">
              {selectedClientSales.map((sale) => (
                <button
                  key={sale.id}
                  type="button"
                  onClick={() => openSaleDetails(sale)}
                  className="w-full rounded-[2rem] border border-white/5 bg-[#15181E] p-4 text-left active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-black uppercase text-white">
                        {sale.category}
                      </div>
                      <div className="mt-1 text-sm font-bold text-white/80">
                        {getSaleDisplayName(sale)}
                      </div>
                      <div className="mt-1 text-[10px] font-black uppercase tracking-wider text-gray-500">
                        {formatDate(sale.date)} • {sale.time}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xs font-black text-white/70">
                        {getSaleTurnover(sale) > 0
                          ? (<><Num value={getSaleTurnover(sale)} /> {CURRENCY}</>)
                          : "—"}
                      </div>
                      <div className="font-mono text-sm font-black text-[#6B5BAE]">
                        <Num value={getSaleCardAmount(sale)} /> {CURRENCY}
                      </div>
                    </div>
                  </div>

                  {((sale.items || []).length > 0 ||
                    getSaleSalonCleanIncome(sale) > 0) && (
                    <div className="mt-3 space-y-2 border-t border-white/5 pt-3">
                      {sale.items.map((item, idx) => (
                        <div
                          key={item.instanceId || idx}
                          className="flex items-center justify-between text-[11px] font-bold"
                        >
                          <span className="truncate pr-2 text-gray-400">
                            {item.name}
                          </span>
                          <div className="flex gap-3">
                            <span className="font-mono text-white/40">
                              <Num value={Number(
                                item.actualPrice || item.price || 0,
                              )} />
                            </span>
                            <span className="font-mono text-[#6B5BAE]">
                              <Num value={Number(item.income || 0)} />
                            </span>
                          </div>
                        </div>
                      ))}
                      {getSaleSalonCleanIncome(sale) > 0 && (
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="text-gray-400">
                            {sale.category === SALON_PAYROLL_CATEGORY
                              ? getPayrollType(
                                  sale.payrollType || sale.salonExtraType,
                                ).label
                              : "Чаевые"}
                          </span>
                          <span className="font-mono text-emerald-400">
                            <Num value={getSaleSalonCleanIncome(sale)} />{" "}
                            {CURRENCY}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </BottomSheet>

      

      <BottomSheet
        isOpen={isStatsChartOpen}
        onClose={() => setIsStatsChartOpen(false)}
        title="Отчёт"
        layerClass="z-[55]"
        headerActions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setReportShowFilters((prev) => !prev);
                if (!reportShowFilters) setReportFilterPanel(null);
              }}
              className={`rounded-full p-2 transition ${
                reportShowFilters
                  ? "bg-[#6B5BAE] text-white"
                  : "bg-[#6B5BAE]/15 text-[#C4B5FD] hover:bg-[#6B5BAE]/25"
              }`}
              aria-label="Фильтр"
            >
              <Filter className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() =>
                setReportChartType((prev) => (prev === "bar" ? "donut" : "bar"))
              }
              className="rounded-full bg-[#6B5BAE]/15 p-2 text-[#C4B5FD] transition hover:bg-[#6B5BAE]/25"
              aria-label="Диаграмма"
            >
              {reportChartType === "bar" ? (
                <PieChart className="h-5 w-5" />
              ) : (
                <BarChart3 className="h-5 w-5" />
              )}
            </button>
          </div>
        }
      >
        <div className="space-y-4 pb-10">
          <div className="space-y-2">
            <p className="px-2 text-[9px] font-black uppercase tracking-widest text-gray-500">
              Период
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setReportRangeEditing("start")}
                className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-left text-xs font-bold outline-none active:scale-[0.99]"
              >
                {isoToDDMMYYYY(reportRange.start)}
              </button>
              <button
                type="button"
                onClick={() => setReportRangeEditing("end")}
                className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-left text-xs font-bold outline-none active:scale-[0.99]"
              >
                {isoToDDMMYYYY(reportRange.end)}
              </button>
            </div>
          </div>

          {reportShowFilters && (
            <div
              ref={reportFilterWrapRef}
              className="space-y-2 rounded-[2rem] border border-white/5 bg-white/5 p-3"
            >
              <div className="rounded-2xl bg-black/20 p-2">
                <p className="px-2 pb-2 text-[9px] font-black uppercase tracking-widest text-gray-500">
                  Сгруппировать
                </p>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    type="button"
                    onClick={() => setReportGroupBy("category")}
                    className={`rounded-xl py-2 text-[10px] font-black uppercase tracking-wider transition ${
                      reportGroupBy === "category"
                        ? "bg-[#6B5BAE] text-white"
                        : "bg-white/5 text-white/60"
                    }`}
                  >
                    Категория
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportGroupBy("client")}
                    className={`rounded-xl py-2 text-[10px] font-black uppercase tracking-wider transition ${
                      reportGroupBy === "client"
                        ? "bg-[#6B5BAE] text-white"
                        : "bg-white/5 text-white/60"
                    }`}
                  >
                    Клиент
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportGroupBy("service")}
                    className={`rounded-xl py-2 text-[10px] font-black uppercase tracking-wider transition ${
                      reportGroupBy === "service"
                        ? "bg-[#6B5BAE] text-white"
                        : "bg-white/5 text-white/60"
                    }`}
                  >
                    Услуга
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setReportFilterPanel((prev) =>
                    prev === "client" ? null : "client",
                  )
                }
                className="flex w-full items-center justify-between rounded-2xl bg-white/5 px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-white/80 active:scale-[0.99]"
              >
                <span>
                  Клиент
                  {reportClients !== "all" && (
                    <span className="ml-2 text-[#C4B5FD]">
                      ({reportClients.size})
                    </span>
                  )}
                </span>
                <ChevronDown
                  size={16}
                  className={`text-white/40 transition-transform ${
                    reportFilterPanel === "client" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {reportFilterPanel === "client" && (
                <div className="space-y-2 rounded-2xl bg-black/20 p-3">
                  <div className="relative">
                    <Search
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B5BAE]"
                      size={16}
                    />
                    <input
                      data-form-type="other"
                      data-lpignore="true"
                      data-1p-ignore="true"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="sentences"
                      spellCheck={false}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 py-2.5 pl-11 pr-3 text-xs font-bold outline-none"
                      placeholder="Поиск клиента..."
                      value={reportClientSearch}
                      onChange={(e) => setReportClientSearch(e.target.value)}
                    />
                  </div>

                  <div className="max-h-72 space-y-1 overflow-y-auto">
                    {(() => {
                      const q = reportClientSearch.trim().toLowerCase();
                      const list = [...clients]
                        .sort((a, b) => a.name.localeCompare(b.name, "ru"))
                        .filter((c) => c.name.toLowerCase().includes(q));
                      const allNames = list.map((c) => c.name);
                      const allSelected =
                        reportClients === "all" ||
                        (allNames.length > 0 &&
                          allNames.every((n) => reportClients.has(n)));

                      const toggleAll = () => {
                        if (allSelected) {
                          setReportClients(new Set());
                        } else {
                          setReportClients(new Set(allNames));
                        }
                      };

                      const toggleOne = (name) => {
                        setReportClients((prev) => {
                          const base =
                            prev === "all" ? new Set(allNames) : new Set(prev);
                          if (base.has(name)) base.delete(name);
                          else base.add(name);
                          return base;
                        });
                      };

                      const isSelected = (name) =>
                        reportClients === "all" || reportClients.has(name);

                      return (
                        <>
                          <button
                            type="button"
                            onClick={toggleAll}
                            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-black uppercase tracking-widest ${
                              allSelected
                                ? "bg-[#6B5BAE] text-white"
                                : "bg-white/5 text-white/70"
                            }`}
                          >
                            <span>Все</span>
                            <span className="text-[10px] opacity-70">
                              {allNames.length}
                            </span>
                          </button>
                          {list.length === 0 ? (
                            <div className="px-3 py-4 text-center text-xs italic text-white/40">
                              Клиенты не найдены
                            </div>
                          ) : (
                            list.map((client) => (
                              <button
                                key={client.id}
                                type="button"
                                onClick={() => toggleOne(client.name)}
                                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-bold ${
                                  isSelected(client.name)
                                    ? "bg-[#6B5BAE]/30 text-white"
                                    : "bg-white/5 text-white/70"
                                }`}
                              >
                                <span>{client.name}</span>
                                {isSelected(client.name) && (
                                  <CheckCircle2
                                    size={14}
                                    className="text-[#C4B5FD]"
                                  />
                                )}
                              </button>
                            ))
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() =>
                  setReportFilterPanel((prev) =>
                    prev === "category" ? null : "category",
                  )
                }
                className="flex w-full items-center justify-between rounded-2xl bg-white/5 px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-white/80 active:scale-[0.99]"
              >
                <span>
                  Категория
                  {reportCategories !== "all" && (
                    <span className="ml-2 text-[#C4B5FD]">
                      ({reportCategories.size})
                    </span>
                  )}
                </span>
                <ChevronDown
                  size={16}
                  className={`text-white/40 transition-transform ${
                    reportFilterPanel === "category" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {reportFilterPanel === "category" && (
                <div className="space-y-1 rounded-2xl bg-black/20 p-3">
                  {(() => {
                    const allSelected =
                      reportCategories === "all" ||
                      CATEGORIES.every((c) => reportCategories.has(c));

                    const toggleAll = () => {
                      if (allSelected) setReportCategories(new Set());
                      else setReportCategories(new Set(CATEGORIES));
                    };
                    const toggleCat = (cat) => {
                      setReportCategories((prev) => {
                        const base =
                          prev === "all" ? new Set(CATEGORIES) : new Set(prev);
                        if (base.has(cat)) base.delete(cat);
                        else base.add(cat);
                        return base;
                      });
                    };
                    const isSelected = (cat) =>
                      reportCategories === "all" || reportCategories.has(cat);

                    return (
                      <>
                        <button
                          type="button"
                          onClick={toggleAll}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-black uppercase tracking-widest transition-all ${
                            allSelected
                              ? "bg-[#6B5BAE] text-white"
                              : "bg-[#6B5BAE]/20 text-gray-400"
                          }`}
                        >
                          <span>Все</span>
                          <span className="text-[10px] opacity-70">
                            {CATEGORIES.length}
                          </span>
                        </button>
                        {CATEGORIES.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => toggleCat(cat)}
                            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-bold transition-all ${
                              isSelected(cat)
                                ? "bg-[#6B5BAE] text-white"
                                : "bg-[#6B5BAE]/20 text-gray-400"
                            }`}
                          >
                            <span>{cat}</span>
                            {isSelected(cat) && (
                              <CheckCircle2
                                size={14}
                                className="text-[#C4B5FD]"
                              />
                            )}
                          </button>
                        ))}
                      </>
                    );
                  })()}
                </div>
              )}

              <button
                type="button"
                onClick={() =>
                  setReportFilterPanel((prev) =>
                    prev === "service" ? null : "service",
                  )
                }
                className="flex w-full items-center justify-between rounded-2xl bg-white/5 px-4 py-3 text-left text-xs font-black uppercase tracking-widest text-white/80 active:scale-[0.99]"
              >
                <span>
                  Услуга
                  {reportServices !== "all" && (
                    <span className="ml-2 text-[#C4B5FD]">
                      ({reportServices.size})
                    </span>
                  )}
                </span>
                <ChevronDown
                  size={16}
                  className={`text-white/40 transition-transform ${
                    reportFilterPanel === "service" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {reportFilterPanel === "service" && (
                <div className="space-y-2 rounded-2xl bg-black/20 p-3">
                  <div className="relative">
                    <Search
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B5BAE]"
                      size={16}
                    />
                    <input
                      data-form-type="other"
                      data-lpignore="true"
                      data-1p-ignore="true"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="sentences"
                      spellCheck={false}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 py-2.5 pl-11 pr-3 text-xs font-bold outline-none"
                      placeholder="Поиск услуги..."
                      value={reportServiceSearch}
                      onChange={(e) => setReportServiceSearch(e.target.value)}
                    />
                  </div>

                  <div className="max-h-72 space-y-1 overflow-y-auto">
                    {(() => {
                      const q = reportServiceSearch.trim().toLowerCase();
                      const names = Array.from(reportServiceStats.keys())
                        .filter((n) => n.toLowerCase().includes(q))
                        .sort((a, b) => {
                          const sa = reportServiceStats.get(a) || { sum: 0 };
                          const sb = reportServiceStats.get(b) || { sum: 0 };
                          if (sb.sum !== sa.sum) return sb.sum - sa.sum;
                          return a.localeCompare(b, "ru");
                        });

                      const totalCount = names.reduce(
                        (s, n) => s + (reportServiceStats.get(n)?.count || 0),
                        0,
                      );
                      const totalSum = names.reduce(
                        (s, n) => s + (reportServiceStats.get(n)?.sum || 0),
                        0,
                      );

                      const allSelected =
                        reportServices === "all" ||
                        (names.length > 0 &&
                          names.every((n) => reportServices.has(n)));

                      const toggleAll = () => {
                        if (allSelected) setReportServices(new Set());
                        else setReportServices(new Set(names));
                      };

                      const toggleOne = (name) => {
                        setReportServices((prev) => {
                          const base =
                            prev === "all" ? new Set(names) : new Set(prev);
                          if (base.has(name)) base.delete(name);
                          else base.add(name);
                          return base;
                        });
                      };

                      const isSelected = (name) =>
                        reportServices === "all" || reportServices.has(name);

                      return (
                        <>
                          <button
                            type="button"
                            onClick={toggleAll}
                            className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-black uppercase tracking-widest ${
                              allSelected
                                ? "bg-[#6B5BAE] text-white"
                                : "bg-white/5 text-white/70"
                            }`}
                          >
                            <span>Все</span>
                            <span className="flex items-center gap-2 text-[10px] opacity-80">
                              <span>{totalCount} шт</span>
                              <span className="font-mono">
                                <Num value={totalSum} />
                              </span>
                            </span>
                          </button>
                          {names.length === 0 ? (
                            <div className="px-3 py-4 text-center text-xs italic text-white/40">
                              Услуги не найдены
                            </div>
                          ) : (
                            names.map((name) => {
                              const st = reportServiceStats.get(name) || {
                                count: 0,
                                sum: 0,
                              };
                              return (
                                <button
                                  key={name}
                                  type="button"
                                  onClick={() => toggleOne(name)}
                                  className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold ${
                                    isSelected(name)
                                      ? "bg-[#6B5BAE]/30 text-white"
                                      : "bg-white/5 text-white/70"
                                  }`}
                                >
                                  <span className="flex min-w-0 items-center gap-2">
                                    <span className="truncate">{name}</span>
                                    {isSelected(name) && (
                                      <CheckCircle2
                                        size={12}
                                        className="flex-shrink-0 text-[#C4B5FD]"
                                      />
                                    )}
                                  </span>
                                  <span className="flex flex-shrink-0 items-center gap-2 text-[10px] opacity-80">
                                    <span>{st.count} шт</span>
                                    <span className="font-mono">
                                      <Num value={st.sum} />
                                    </span>
                                  </span>
                                </button>
                              );
                            })
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="rounded-[2rem] border border-white/5 bg-[#15181E] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-[9px] font-black uppercase tracking-widest text-gray-500">
                  Период
                </div>
                <div className="mt-1 text-xs font-bold text-white/80">
                  {reportPeriodLabel}
                </div>
              </div>
              
            </div>

            {reportChartData.items.length === 0 ||
            reportChartData.total === 0 ? (
              <div className="rounded-2xl bg-white/5 p-8 text-center text-sm italic text-white/40">
                Нет данных для отчёта
              </div>
            ) : reportChartType === "bar" ? (
              <div className="space-y-3">
                {(() => {
                  const max = Math.max(
                    ...reportChartData.items.map((i) => i.value),
                    1,
                  );
                  return reportChartData.items.map((item) => {
                    const isEmpty = item.value <= 0;
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => !isEmpty && setReportDrillItem(item)}
                        disabled={isEmpty}
                        className={`block w-full space-y-1 rounded-xl p-1 text-left transition ${
                          isEmpty ? "opacity-40" : "active:scale-[0.99]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 text-[11px] font-bold">
                          <span
                            className="flex min-w-0 items-baseline gap-2 uppercase tracking-wider"
                            style={{ color: item.color }}
                          >
                            <span className="truncate">{item.label}</span>
                            {typeof item.count === "number" && (
                                <span className="flex-shrink-0 font-mono text-[10px] tracking-normal text-white/50">
                                  {item.count}{" "}
                                  {reportGroupBy !== "service" ? "чек" : "шт"}
                                </span>
                              )}
                          </span>
                          <span className="flex-shrink-0 font-mono text-white/80">
                            <Num value={item.value} /> {CURRENCY}
                          </span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-white/5">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: isEmpty
                                ? "100%"
                                : `${(item.value / max) * 100}%`,
                              backgroundColor: isEmpty
                                ? "rgba(255,255,255,0.05)"
                                : item.color,
                            }}
                          />
                        </div>
                      </button>
                    );
                  });
                })()}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <svg viewBox="0 0 200 200" className="h-56 w-56">
                  {(() => {
                    const total = reportChartData.total || 1;
                    const radius = 80;
                    const inner = 50;
                    const cx = 100;
                    const cy = 100;
                    let acc = 0;
                    return reportChartData.items.map((item, idx) => {
                      const startAngle =
                        (acc / total) * Math.PI * 2 - Math.PI / 2;
                      acc += item.value;
                      const endAngle =
                        (acc / total) * Math.PI * 2 - Math.PI / 2;
                      const large = endAngle - startAngle > Math.PI ? 1 : 0;
                      const x1 = cx + radius * Math.cos(startAngle);
                      const y1 = cy + radius * Math.sin(startAngle);
                      const x2 = cx + radius * Math.cos(endAngle);
                      const y2 = cy + radius * Math.sin(endAngle);
                      const x3 = cx + inner * Math.cos(endAngle);
                      const y3 = cy + inner * Math.sin(endAngle);
                      const x4 = cx + inner * Math.cos(startAngle);
                      const y4 = cy + inner * Math.sin(startAngle);
                      const d =
                        reportChartData.items.length === 1
                          ? `M ${cx - radius} ${cy} A ${radius} ${radius} 0 1 1 ${cx + radius} ${cy} A ${radius} ${radius} 0 1 1 ${cx - radius} ${cy} Z M ${cx - inner} ${cy} A ${inner} ${inner} 0 1 0 ${cx + inner} ${cy} A ${inner} ${inner} 0 1 0 ${cx - inner} ${cy} Z`
                          : `M ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${inner} ${inner} 0 ${large} 0 ${x4} ${y4} Z`;
                      return (
                        <path
                          key={idx}
                          d={d}
                          fill={item.color}
                          fillRule="evenodd"
                          onClick={() => setReportDrillItem(item)}
                          style={{ cursor: "pointer" }}
                        />
                      );
                    });
                  })()}
                  
                </svg>
                <div
                  className="grid w-full gap-2 self-stretch"
                  style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}
                >
                  {reportChartData.items.map((item) => {
                    const countSuffix =
                      reportGroupBy !== "service" ? "чек" : "шт";
                    const showCount = typeof item.count === "number";
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => setReportDrillItem(item)}
                        className="flex w-full items-start gap-2 rounded-xl bg-white/5 px-3 py-2 text-left transition active:scale-[0.99]"
                      >
                        <span
                          className="mt-0.5 h-3 w-3 flex-shrink-0 rounded-sm"
                          style={{ backgroundColor: item.color }}
                        />
                        <div className="flex min-w-0 flex-1 flex-col leading-tight">
                          <div className="line-clamp-1 text-[10px] font-bold uppercase text-white/70">
                            {item.label}
                          </div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-mono text-[11px] font-black text-white">
                              <Num value={item.value} />
                            </span>
                            {showCount && (
                              <span className="font-mono text-[10px] font-bold text-white/55">
                                · {item.count} {countSuffix}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </BottomSheet>

      {reportRangeEditing && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setReportRangeEditing(null)}
        >
          <div className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <InlineDatePickerCard
              label={
                reportRangeEditing === "start"
                  ? "Начало периода"
                  : "Конец периода"
              }
              value={
                reportRangeEditing === "start"
                  ? reportRange.start
                  : reportRange.end
              }
              onChange={(d) =>
                setReportRange((prev) => {
                  if (reportRangeEditing === "start") {
                    return { start: d, end: prev.end < d ? d : prev.end };
                  }
                  return { start: prev.start > d ? d : prev.start, end: d };
                })
              }
            />
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setReportRangeEditing(null)}
                className="rounded-full bg-[#6B5BAE] px-6 py-2 text-sm font-bold uppercase tracking-wider text-white active:scale-95"
              >
                Готово
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomSheet
        isOpen={!!reportDrillItem}
        onClose={() => setReportDrillItem(null)}
        title={reportDrillItem ? reportDrillItem.label : ""}
        layerClass="z-[60]"
      >
        <div className="space-y-3 pb-8">
          <div className="rounded-[2rem] border border-white/5 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <span
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: reportDrillItem?.color }}
              />
              <div className="flex-1">
                <div className="text-[9px] font-black uppercase tracking-widest text-gray-500">
                  Сумма
                </div>
                <div className="mt-1 font-mono text-xl font-black text-white">
                  <Num value={(reportDrillItem?.value || 0)} /> {CURRENCY}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[9px] font-black uppercase tracking-widest text-gray-500">
                  Чеков
                </div>
                <div className="mt-1 font-mono text-xl font-black text-[#C4B5FD]">
                  {reportDrillSales.length}
                </div>
              </div>
            </div>
            <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
              Период: {reportPeriodLabel}
            </div>
          </div>

          <div className="rounded-2xl bg-black/20 p-2">
            <p className="px-2 pb-2 text-[9px] font-black uppercase tracking-widest text-gray-500">
              Сортировка
            </p>
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setReportDrillSort("date")}
                className={`rounded-xl py-2 text-[11px] font-black uppercase tracking-widest transition ${
                  reportDrillSort === "date"
                    ? "bg-[#6B5BAE] text-white"
                    : "bg-white/5 text-white/60"
                }`}
              >
                По дате
              </button>
              <button
                type="button"
                onClick={() => setReportDrillSort("amount")}
                className={`rounded-xl py-2 text-[11px] font-black uppercase tracking-widest transition ${
                  reportDrillSort === "amount"
                    ? "bg-[#6B5BAE] text-white"
                    : "bg-white/5 text-white/60"
                }`}
              >
                По сумме
              </button>
            </div>
          </div>

          {reportDrillSales.length === 0 ? (
            <div className="rounded-[2rem] bg-white/5 p-12 text-center text-xs italic text-white/40">
              Чеков нет
            </div>
          ) : (
            reportDrillSales.map((sale) => (
              <SaleCard
                key={sale.id}
                sale={sale}
                customAmount={
                  reportDrillItem?.label === "Чаевые"
                    ? Number(sale.tips || 0)
                    : reportDrillItem?.label === "Начисление"
                    ? getSaleAccrual(sale)
                    : undefined
                }
                onOpen={(s) => {
                  setReportDrillItem(null);
                  setIsStatsChartOpen(false);
                  openSaleDetails(s);
                }}
              />
            ))
          )}
        </div>
      </BottomSheet>

      <BottomSheet
        isOpen={isStatsBreakdownOpen}
        onClose={() => {
          setIsStatsBreakdownOpen(false);
          setStatsBreakdownFilter("all");
        }}
        title={
          statsBreakdownType === "turnover"
            ? "Чеки по услугам"
            : "Чеки по доходу"
        }
        endActions={
          statsBreakdownType === "turnover" ? (
            <button
              onClick={() => setStatsBreakdownFilter(prev => prev === "all" ? "tips" : "all")}
              className={`mr-3 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors border ${
                statsBreakdownFilter === "tips"
                  ? "bg-[#f472b6]/20 text-[#f472b6] border-[#f472b6]/30"
                  : "bg-white/5 text-gray-400 border-white/10"
              }`}
            >
              {statsBreakdownFilter === "all" ? "Все" : "Чаевые"}
            </button>
          ) : statsBreakdownType === "income" ? (
            <button
              onClick={() => {
                const cycle = ["all", "home", "salary", "tips", "kalym"];
                const nextIndex = (cycle.indexOf(statsBreakdownFilter) + 1) % cycle.length;
                setStatsBreakdownFilter(cycle[nextIndex]);
              }}
              className={`mr-3 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors border ${
                statsBreakdownFilter === "home" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                statsBreakdownFilter === "salary" ? "bg-sky-500/20 text-sky-400 border-sky-500/30" :
                statsBreakdownFilter === "tips" ? "bg-pink-500/20 text-pink-400 border-pink-500/30" :
                statsBreakdownFilter === "kalym" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
                "bg-white/5 text-gray-400 border-white/10"
              }`}
            >
              {statsBreakdownFilter === "all" ? "Все" :
               statsBreakdownFilter === "home" ? "Домашние" :
               statsBreakdownFilter === "salary" ? "Салон ЗП" :
               statsBreakdownFilter === "tips" ? "Чаевые" : "Калым"}
            </button>
          ) : null
        }
      >
        <div className="space-y-4 pb-8">
          <div className="rounded-[2rem] border border-white/5 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
              <span>Итого</span>
              <span>чеков {statsBreakdownSales.length} шт</span>
            </div>
            <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
              Период: {statsPeriodLabel}
            </div>
            {(() => {
              const breakdownTotal = statsBreakdownSales.reduce(
                (acc, sale) => {
                  acc.turnover += getSaleTurnover(sale);
                  acc.accrual += getSaleAccrual(sale);
                  acc.income += getSaleAnalyticsIncome(sale);
                  return acc;
                },
                { turnover: 0, accrual: 0, income: 0 }
              );

              return statsBreakdownType === "turnover" ? (
                <div className="mt-2 flex items-end justify-between gap-2">
                  <AutoFitText
                    text={`${formatNumber(breakdownTotal.turnover)} ${CURRENCY}`}
                    baseFontSize={24}
                    minFontSize={12}
                    className="min-w-0 flex-1 font-mono font-black text-white leading-none"
                  />
                  <AutoFitText
                    text={`${formatNumber(breakdownTotal.accrual)} ${CURRENCY}`}
                    baseFontSize={22}
                    minFontSize={12}
                    className="min-w-0 flex-1 text-right font-mono font-black text-[#6B5BAE] leading-none"
                  />
                </div>
              ) : (
                <AutoFitText
                  text={`${formatNumber(breakdownTotal.income)} ${CURRENCY}`}
                  baseFontSize={24}
                  minFontSize={12}
                  className="mt-2 w-full font-mono font-black text-[#6B5BAE]"
                />
              );
            })()}
          </div>

          {statsBreakdownSales.length === 0 ? (
            <div className="rounded-[2rem] bg-white/5 p-10 text-center text-sm italic text-white/40">
              Нет чеков для выбранного показателя
            </div>
          ) : (
            <div className="space-y-[2px]">
              {statsBreakdownSales.map((sale) => {
                const metricValue =
                  statsBreakdownType === "turnover"
                    ? getSaleTurnover(sale)
                    : getSaleAnalyticsIncome(sale);
                const accrualValue = getSaleAccrual(sale);

                const leftColor = CATEGORY_DOT_COLOR[sale.category] || "#4b5563";
                const hasTips = sale.category === SALON_SERVICES_CATEGORY && Number(sale.tips || 0) > 0;
                const rightColor = hasTips ? "#f472b6" : leftColor;

                return (
                  <button
                    key={sale.id}
                    type="button"
                    onClick={() => openSaleDetails(sale)}
                    className="w-full rounded-[2rem] border-y border-y-white/5 border-l-4 border-r-4 bg-[#15181E] px-4 py-2.5 text-left active:scale-[0.99] transition-colors"
                    style={{
                      borderLeftColor: leftColor,
                      borderRightColor: rightColor
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-black leading-tight text-white">
                          {getSaleDisplayName(sale)}
                        </div>
                        <div className="mt-0.5 text-[10px] font-black uppercase leading-tight tracking-wider text-gray-500">
                          {formatDate(sale.date)} • {sale.time}
                        </div>
                        <div className="mt-0.5 text-[10px] font-black uppercase leading-tight tracking-widest text-gray-600">
                          {sale.category}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-baseline justify-end gap-2">
                          <span className="text-[10px] font-bold uppercase leading-tight text-white/35">
                            {statsBreakdownType === "turnover"
                              ? "Оборот чека"
                              : "Доход чека"}
                          </span>
                          <span
                            className={`whitespace-nowrap font-mono text-lg font-black leading-tight ${
                              statsBreakdownType === "turnover"
                                ? "text-white"
                                : "text-[#6B5BAE]"
                            }`}
                          >
                            <Num value={metricValue} /> {CURRENCY}
                          </span>
                        </div>
                        {statsBreakdownType === "turnover" && (
                          <div className="mt-1 flex items-baseline justify-end gap-2 border-t border-white/5 pt-1">
                            <span className="text-[10px] font-bold uppercase leading-tight text-white/35">
                              Начисление
                            </span>
                            <span className="whitespace-nowrap font-mono text-lg font-black leading-tight text-[#6B5BAE]">
                              <Num value={accrualValue} /> {CURRENCY}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </BottomSheet>

      {customRangeEditing && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setCustomRangeEditing(null)}
        >
          <div className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <InlineDatePickerCard
              label={
                customRangeEditing === "start"
                  ? "Начало периода"
                  : "Конец периода"
              }
              value={
                customRangeEditing === "start"
                  ? customRange.start
                  : customRange.end
              }
              onChange={(d) =>
                setCustomRange((prev) => {
                  if (customRangeEditing === "start") {
                    return { start: d, end: prev.end < d ? d : prev.end };
                  }
                  return { start: prev.start > d ? d : prev.start, end: d };
                })
              }
              markedDates={statsCalendarMarkedDates}
            />
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setCustomRangeEditing(null)}
                className="rounded-full bg-[#6B5BAE] px-6 py-2 text-sm font-bold uppercase tracking-wider text-white active:scale-95"
              >
                Готово
              </button>
            </div>
          </div>
        </div>
      )}

      {isCalendarScreenOpen && (
        <div className="fixed inset-0 z-[60] bg-[#0F1115] text-white">
          <div className="flex h-full flex-col">
            <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-3 pt-5 pb-4">
              <div className="flex-1">
                <div className="text-sm font-bold text-white/80">
                  Выберите дату
                </div>
                <div className="mt-1 text-3xl font-light text-white">
                  {calendarScreenSelectedDate
                    ? formatHeaderDate(calendarScreenSelectedDate)
                    : "Все чеки"}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (calendarScreenMode === "calendar") {
                      setCalendarScreenTextValue(
                        isoToDDMMYYYY(calendarScreenSelectedDate || getToday()),
                      );
                      setCalendarScreenTextError(false);
                      setCalendarScreenMode("text");
                    } else {
                      setCalendarScreenMode("calendar");
                    }
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-[#C8B6FF] hover:bg-white/5"
                >
                  {calendarScreenMode === "calendar" ? (
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                    </svg>
                  ) : (
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <path d="M16 2v4M8 2v4M3 10h18" />
                    </svg>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsCalendarScreenOpen(false)}
                  className="rounded-2xl bg-white/5 p-3 text-gray-400 transition active:scale-95"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-2 pb-32">
              <div className="mx-auto max-w-2xl space-y-6">
                <div className="space-y-4">
                  {calendarScreenMode === "calendar" ? (
                    <MonthCalendar
                      monthDate={calendarScreenMonth}
                      onMonthChange={(diff) =>
                        setCalendarScreenMonth((prev) => shiftMonth(prev, diff))
                      }
                      selectedDate={calendarScreenSelectedDate}
                      onSelectDate={setCalendarScreenSelectedDate}
                      markedDates={calendarMarkedDates}
                      allowClear
                    />
                  ) : (
                    <div className="rounded-[2.5rem] bg-[#22202A] p-5">
                      <div
                        className={`relative rounded-md border-2 px-4 pb-3 pt-5 ${
                          calendarScreenTextError
                            ? "border-red-400"
                            : "border-[#C8B6FF]"
                        }`}
                      >
                        <span
                          className={`absolute -top-2.5 left-3 bg-[#22202A] px-1 text-xs ${
                            calendarScreenTextError
                              ? "text-red-400"
                              : "text-[#C8B6FF]"
                          }`}
                        >
                          Дата
                        </span>
                        <input
                          data-form-type="other"
                          data-lpignore="true"
                          data-1p-ignore="true"
                          autoComplete="off"
                          autoCorrect="off"
                          autoCapitalize="off"
                          spellCheck={false}
                          type="text"
                          inputMode="numeric"
                          placeholder="ДД.ММ.ГГГГ"
                          value={calendarScreenTextValue}
                          onChange={(e) => {
                            const v = e.target.value;
                            setCalendarScreenTextValue(v);
                            const iso = ddmmyyyyToIso(v);
                            if (iso) {
                              setCalendarScreenTextError(false);
                              setCalendarScreenSelectedDate(iso);
                              const [y, m] = iso
                                .split("-")
                                .map((n) => parseInt(n, 10));
                              setCalendarScreenMonth(new Date(y, m - 1, 1));
                            } else if (v.trim()) {
                              setCalendarScreenTextError(true);
                            } else {
                              setCalendarScreenTextError(false);
                            }
                          }}
                          className="w-full bg-transparent text-2xl font-light text-white outline-none"
                          autoFocus
                        />
                      </div>
                      {calendarScreenTextError && (
                        <div className="mt-2 text-xs text-red-400">
                          Неверный формат даты
                        </div>
                      )}
                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          disabled={!ddmmyyyyToIso(calendarScreenTextValue)}
                          onClick={() => {
                            const iso = ddmmyyyyToIso(calendarScreenTextValue);
                            if (!iso) {
                              setCalendarScreenTextError(true);
                              return;
                            }
                            setCalendarScreenSelectedDate(iso);
                            const [y, m] = iso
                              .split("-")
                              .map((n) => parseInt(n, 10));
                            setCalendarScreenMonth(new Date(y, m - 1, 1));
                            setCalendarScreenMode("calendar");
                          }}
                          className="rounded-full px-5 py-2 text-sm font-bold uppercase tracking-wider text-[#C8B6FF] hover:bg-white/5 disabled:opacity-40"
                        >
                          Ок
                        </button>
                      </div>
                    </div>
                  )}

                  {calendarScreenSelectedDate && (
                    <button
                      type="button"
                      onClick={() => setCalendarScreenSelectedDate(null)}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 text-[10px] font-black uppercase tracking-widest text-white/70 active:scale-[0.99]"
                    >
                      Показать все чеки
                    </button>
                  )}
                </div>

                <div className="space-y-3 pb-8">
                  <div className="px-1 text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">
                    {calendarScreenSelectedDate
                      ? `Чеки за ${formatDate(calendarScreenSelectedDate)} ${calendarScreenSales.length} шт.`
                      : `Все чеки ${calendarScreenSales.length} шт.`}
                  </div>

                  {calendarScreenSales.length === 0 ? (
                    <div className="rounded-[3rem] bg-white/5 p-12 text-center text-xs italic opacity-30">
                      За выбранный день чеков нет
                    </div>
                  ) : (
                    <div className="space-y-[3px]">
                      {calendarScreenSales.map((sale) => (
                        <SaleCard
                          key={sale.id}
                          sale={sale}
                          onOpen={openSaleDetails}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <AppNav
              activeTab={activeTab}
              onDashboard={handleDashboardNav}
              onClients={handleClientsNav}
              onPrimary={handlePrimaryAction}
              onProcedures={handleProceduresNav}
              onStats={handleStatsNav}
            />
          </div>
        </div>
      )}

      {backHint && (
        <div className="fixed bottom-32 left-1/2 z-[120] -translate-x-1/2 rounded-full border border-white/10 bg-[#1E222A]/95 px-5 py-3 text-center text-[10px] font-black uppercase tracking-widest text-white shadow-2xl backdrop-blur">
          Нажмите назад ещё раз для выхода
        </div>
      )}

      {activeTab === "dashboard" && showScrollTop && (
        <button
          type="button"
          aria-label="Наверх"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-28 right-4 z-[110] flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#1E222A]/95 text-[#A89AE0] shadow-2xl backdrop-blur-md transition active:scale-90"
        >
          <ChevronUp size={22} strokeWidth={2.5} />
        </button>
      )}



      <SaleDetailsSheet
        sale={saleDetails}
        isOpen={Boolean(saleDetails)}
        onClose={() => setSaleDetailsId(null)}
        onEdit={openEditSale}
        onDelete={requestDeleteSale}
        onRepeat={repeatSale}
        onConduct={conductSale}
      />

      <ConfirmDialog
        isOpen={confirmData.isOpen}
        onClose={() =>
          setConfirmData((prev) => ({
            ...prev,
            isOpen: false,
          }))
        }
        onConfirm={() => {
          if (typeof confirmData.onConfirm === "function") {
            confirmData.onConfirm();
          }

          setConfirmData((prev) => ({
            ...prev,
            isOpen: false,
          }));
        }}
        message={confirmData.message}
        variant={confirmData.variant}
        title={confirmData.title}
      />

      <TimePickerDialog
        isOpen={isTimePickerOpen}
        value={newSale.id && newSale.time === selectedSale?.time ? getCurrentTime() : newSale.time}
        onClose={() => setIsTimePickerOpen(false)}
        onConfirm={(time) =>
          setNewSale((prev) => ({
            ...prev,
            time,
          }))
        }
      />

      <DatePickerDialog
        isOpen={isDatePickerOpen}
        value={newSale.date}
        onClose={() => setIsDatePickerOpen(false)}
        onConfirm={(date) =>
          setNewSale((prev) => ({
            ...prev,
            date,
          }))
        }
      />
    </div>
    </AppUIContext.Provider>
  );
}
