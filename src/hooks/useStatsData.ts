// Stats & report aggregations (extracted from App.tsx)

import { useMemo } from "react";
import {
  CATEGORIES,
  CURRENCY,
  MARKED_CATEGORIES,
  SALON_SERVICES_CATEGORY,
  SALON_PAYROLL_CATEGORY,
  HOME_CATEGORY,
  KALYM_CATEGORY,
  parseDateKey,
  sortSalesByDateTimeDesc,
  getPeriodRangeLabel,
  formatDate,
  getSaleAccrual,
  getSaleAnalyticsIncome,
} from "../lib/app-core";
import { calculateStats, getReportSaleAmount } from "../lib/stats";
import type { Sale, Client, Procedure } from "../types";

export type SetFilter = "all" | Set<string>;

interface UseStatsDataArgs {
  sales: Sale[];
  clients: Client[];
  procedures: Procedure[];
  selectedClient: Client | null;
  selectedCategories: string[];
  statsClient: string;
  statsClientSearch: string;
  statsPeriod: string;
  statsDay: string;
  statsDayMonth: Date;
  customRange: { start: string; end: string };
  reportRange: { start: string; end: string };
  reportCategories: SetFilter;
  reportClients: SetFilter;
  reportServices: SetFilter;
  reportGroupBy: string;
  reportDrillItem: { label: string; value: number; color: string; count?: number } | null;
  reportDrillSort: string;
  statsBreakdownType: string;
  statsBreakdownFilter: string;
}

export function useStatsData(args: UseStatsDataArgs) {
  const {
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
  } = args;

  const filteredStatsClients = useMemo(() => {
    const q = statsClientSearch.trim().toLowerCase();

    return [...clients]
      .sort((a, b) => a.name.localeCompare(b.name, "ru"))
      .filter((client) => client.name.toLowerCase().includes(q));
  }, [clients, statsClientSearch]);

  const selectedClientSales = useMemo(() => {
    if (!selectedClient) return [];

    return sortSalesByDateTimeDesc(
      sales.filter((sale) => sale.clientName === selectedClient.name),
    );
  }, [sales, selectedClient]);

  const statsFilteredSales = useMemo(() => {
    return sales.filter((sale) => {
      if (sale.isDeferred) return false;
      if (!selectedCategories.includes(sale.category)) return false;
      if (statsClient !== "all" && sale.clientName !== statsClient)
        return false;

      const saleDate = parseDateKey(sale.date);
      if (!saleDate) return false;
      saleDate.setHours(0, 0, 0, 0);

      if (statsPeriod === "day") {
        return sale.date === statsDay;
      }

      if (statsPeriod === "month") {
        return (
          saleDate.getMonth() === statsDayMonth.getMonth() &&
          saleDate.getFullYear() === statsDayMonth.getFullYear()
        );
      }

      if (statsPeriod === "year") {
        return saleDate.getFullYear() === statsDayMonth.getFullYear();
      }

      if (statsPeriod === "custom") {
        if (!customRange.start || !customRange.end) return true;

        const start = parseDateKey(customRange.start);
        const end = parseDateKey(customRange.end);
        if (!start || !end) return true;
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        return saleDate >= start && saleDate <= end;
      }

      return true;
    });
  }, [
    sales,
    selectedCategories,
    statsClient,
    statsPeriod,
    customRange,
    statsDay,
    statsDayMonth,
  ]);

  const periodStats = useMemo(
    () => calculateStats(statsFilteredSales),
    [statsFilteredSales],
  );

  const reportFilteredSales = useMemo(() => {
    return sales.filter((sale) => {
      if (sale.isDeferred) return false;

      const cats = reportCategories;
      if (cats !== "all" && cats.size > 0 && !cats.has(sale.category))
        return false;
      if (cats !== "all" && cats.size === 0) return false;

      const cls = reportClients;
      if (cls !== "all") {
        if (cls.size === 0) return false;
        if (sale.category === SALON_PAYROLL_CATEGORY) return false;
        if (!cls.has(sale.clientName)) return false;
      }

      const svcs = reportServices;
      if (svcs !== "all") {
        if (svcs.size === 0) return false;
        if (sale.category !== SALON_SERVICES_CATEGORY) return false;
        const items = Array.isArray(sale.items) ? sale.items : [];
        if (!items.some((it) => svcs.has(it.name))) return false;
      }

      const saleDate = parseDateKey(sale.date);
      if (!saleDate) return false;
      saleDate.setHours(0, 0, 0, 0);

      if (reportRange.start && reportRange.end) {
        const start = parseDateKey(reportRange.start);
        const end = parseDateKey(reportRange.end);
        if (start && end) {
          start.setHours(0, 0, 0, 0);
          end.setHours(0, 0, 0, 0);
          if (saleDate < start || saleDate > end) return false;
        }
      }

      return true;
    });
  }, [sales, reportCategories, reportClients, reportServices, reportRange]);

  const reportServiceStats = useMemo(() => {
    const map = new Map<string, { count: number; sum: number }>();
    sales.forEach((sale) => {
      if (sale.isDeferred) return;
      if (sale.category !== SALON_SERVICES_CATEGORY) return;

      const cats = reportCategories;
      if (cats !== "all" && !cats.has(sale.category)) return;

      const cls = reportClients;
      if (cls !== "all" && !cls.has(sale.clientName)) return;

      const saleDate = parseDateKey(sale.date);
      if (!saleDate) return;
      saleDate.setHours(0, 0, 0, 0);
      if (reportRange.start && reportRange.end) {
        const start = parseDateKey(reportRange.start);
        const end = parseDateKey(reportRange.end);
        if (start && end) {
          start.setHours(0, 0, 0, 0);
          end.setHours(0, 0, 0, 0);
          if (saleDate < start || saleDate > end) return;
        }
      }

      const items = Array.isArray(sale.items) ? sale.items : [];
      items.forEach((it) => {
        const name = it.name || "Без названия";
        const cur = map.get(name) || { count: 0, sum: 0 };
        cur.count += 1;
        cur.sum += Number(it.actualPrice || it.price || 0);
        map.set(name, cur);
      });
    });
    procedures.forEach((p) => {
      if (!map.has(p.name)) map.set(p.name, { count: 0, sum: 0 });
    });
    return map;
  }, [sales, procedures, reportCategories, reportClients, reportRange]);

  const reportChartData = useMemo(() => {
    const categoryPalette: Record<string, string> = {
      [SALON_SERVICES_CATEGORY]: "#6B5BAE",
      [SALON_PAYROLL_CATEGORY]: "#38BDF8",
      [HOME_CATEGORY]: "#10B981",
      [KALYM_CATEGORY]: "#F59E0B",
    };
    const clientPalette = [
      "#6B5BAE",
      "#38BDF8",
      "#10B981",
      "#F59E0B",
      "#EF4444",
      "#EC4899",
      "#8B5CF6",
      "#14B8A6",
      "#F97316",
      "#A3E635",
      "#22D3EE",
      "#F472B6",
    ];

    if (reportGroupBy === "service") {
      const map = new Map<string, { sum: number; count: number }>();
      reportFilteredSales.forEach((sale) => {
        if (sale.category !== SALON_SERVICES_CATEGORY) return;
        const items = Array.isArray(sale.items) ? sale.items : [];
        items.forEach((it) => {
          if (reportServices !== "all" && !reportServices.has(it.name)) return;
          const name = it.name || "Без названия";
          const amount = Number(it.actualPrice || it.price || 0);
          const prev = map.get(name) || { sum: 0, count: 0 };
          map.set(name, { sum: prev.sum + amount, count: prev.count + 1 });
        });
      });
      const items = Array.from(map.entries())
        .map(([label, st]) => ({ label, value: st.sum, count: st.count }))
        .filter((item) => item.value > 0)
        .sort((a, b) => b.value - a.value)
        .map((item, idx) => ({
          ...item,
          color: clientPalette[idx % clientPalette.length],
        }));
      const total = items.reduce((sum, item) => sum + item.value, 0);
      return { items, total };
    }

    if (reportGroupBy === "client") {
      const map = new Map<string, { sum: number; count: number }>();
      reportFilteredSales.forEach((sale) => {
        const amount = getReportSaleAmount(sale);
        const key =
          sale.category === SALON_PAYROLL_CATEGORY
            ? "Салон зп"
            : sale.clientName || "Без клиента";
        const prev = map.get(key) || { sum: 0, count: 0 };
        map.set(key, { sum: prev.sum + amount, count: prev.count + 1 });
      });
      const items = Array.from(map.entries())
        .map(([label, st]) => ({
          label,
          value: st.sum,
          count: st.count,
        }))
        .filter((item) => item.value > 0)
        .sort((a, b) => b.value - a.value)
        .map((item, idx) => ({
          ...item,
          color: clientPalette[idx % clientPalette.length],
        }));
      const total = items.reduce((sum, item) => sum + item.value, 0);
      return { items, total };
    }

    const map = new Map<string, { sum: number; count: number }>();
    let accrualSum = 0;
    let tipsSum = 0;
    let accrualCount = 0;
    let tipsCount = 0;
    const allowedCats =
      reportCategories === "all"
        ? CATEGORIES
        : CATEGORIES.filter((c) => reportCategories.has(c));
    allowedCats.forEach((cat) => map.set(cat, { sum: 0, count: 0 }));
    reportFilteredSales.forEach((sale) => {
      if (!map.has(sale.category)) return;
      const amount = getReportSaleAmount(sale);
      const prev = map.get(sale.category);
      map.set(sale.category, {
        sum: (prev?.sum || 0) + amount,
        count: (prev?.count || 0) + 1,
      });

      if (sale.category === SALON_SERVICES_CATEGORY) {
        if (getSaleAccrual(sale) > 0) accrualCount++;
        accrualSum += getSaleAccrual(sale) || 0;

        if (Number(sale.tips || 0) > 0) tipsCount++;
        tipsSum += Number(sale.tips || 0);
      }
    });
    const items: { label: string; value: number; count: number; color: string }[] = [];
    allowedCats.forEach((cat) => {
      items.push({
        label: cat,
        value: map.get(cat)?.sum || 0,
        count: map.get(cat)?.count || 0,
        color: categoryPalette[cat] || "#6B5BAE",
      });
      if (cat === SALON_SERVICES_CATEGORY) {
        items.push({
          label: "Начисление",
          value: accrualSum,
          count: accrualCount,
          color: "#A89AE0",
        });
      }
    });
    if (tipsSum > 0) {
      items.push({
        label: "Чаевые",
        value: tipsSum,
        count: tipsCount,
        color: "#EC4899",
      });
    }
    const total = items.reduce((sum, item) => sum + item.value, 0);
    return { items, total };
  }, [reportFilteredSales, reportGroupBy, reportServices, reportCategories]);

  const reportPeriodLabel = useMemo(() => {
    if (!reportRange.start || !reportRange.end) return "Период не выбран";
    return `${formatDate(reportRange.start)} - ${formatDate(reportRange.end)}`;
  }, [reportRange]);

  const exportReportCsv = () => {
    const groupName =
      reportGroupBy === "service"
        ? "Услуга"
        : reportGroupBy === "client"
          ? "Клиент"
          : "Категория";
    const showCount = reportGroupBy !== "category";
    const escape = (val: unknown) => {
      const str = String(val ?? "");
      if (/[;"\n\r]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };
    const lines: string[] = [];
    lines.push(`Период: ${reportPeriodLabel}`);
    lines.push(`Группировка: ${groupName}`);
    lines.push(`Итого: ${reportChartData.total} ${CURRENCY}`);
    lines.push("");
    const headers = [groupName, `Сумма (${CURRENCY})`];
    if (showCount) headers.push("Кол-во");
    lines.push(headers.map(escape).join(";"));
    reportChartData.items.forEach((item) => {
      const row: (string | number)[] = [item.label, item.value];
      if (showCount) row.push(item.count ?? "");
      lines.push(row.map(escape).join(";"));
    });
    const csv = "\uFEFF" + lines.join("\r\n");
    const safePeriod =
      reportRange.start && reportRange.end
        ? `${reportRange.start}_${reportRange.end}`
        : "all";
    const filename = `Отчёт_${groupName}_${safePeriod}.csv`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const file =
      typeof File !== "undefined"
        ? new File([blob], filename, { type: "text/csv;charset=utf-8" })
        : null;

    const triggerDownload = () => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    };

    if (
      file &&
      typeof navigator !== "undefined" &&
      typeof navigator.canShare === "function" &&
      navigator.canShare({ files: [file] }) &&
      typeof navigator.share === "function"
    ) {
      navigator
        .share({
          title: `Отчёт ${reportPeriodLabel}`,
          text: `Группировка: ${groupName}\nИтого: ${reportChartData.total} ${CURRENCY}`,
          files: [file],
        })
        .catch(triggerDownload);
      return;
    }

    triggerDownload();
  };

  const reportDrillSales = useMemo(() => {
    if (!reportDrillItem) return [];
    const label = reportDrillItem.label;
    const matches = reportFilteredSales.filter((sale) => {
      if (reportGroupBy === "service") {
        if (sale.category !== SALON_SERVICES_CATEGORY) return false;
        const items = Array.isArray(sale.items) ? sale.items : [];
        return items.some((it) => (it.name || "Без названия") === label);
      }
      if (reportGroupBy === "category") {
        if (label === "Начисление") {
          return (
            sale.category === SALON_SERVICES_CATEGORY && getSaleAccrual(sale) > 0
          );
        }
        if (label === "Чаевые") {
          return (
            sale.category === SALON_SERVICES_CATEGORY &&
            Number(sale.tips || 0) > 0
          );
        }
        return sale.category === label;
      }
      if (label === "Салон зп") return sale.category === SALON_PAYROLL_CATEGORY;
      if (label === "Без клиента")
        return sale.category !== SALON_PAYROLL_CATEGORY && !sale.clientName;
      return sale.clientName === label;
    });
    if (reportDrillSort === "amount") {
      return [...matches].sort(
        (a, b) => getReportSaleAmount(b) - getReportSaleAmount(a),
      );
    }
    return sortSalesByDateTimeDesc(matches);
  }, [reportDrillItem, reportFilteredSales, reportGroupBy, reportDrillSort]);

  const statsPeriodLabel = useMemo(
    () => getPeriodRangeLabel(statsPeriod, customRange, statsDay),
    [statsPeriod, customRange, statsDay],
  );

  const statsBreakdownSales = useMemo(() => {
    let list: Sale[] = [];
    if (statsBreakdownType === "turnover") {
      list = statsFilteredSales.filter(
        (sale) => sale.category === SALON_SERVICES_CATEGORY && sale.items && sale.items.length > 0,
      );
    } else {
      list = statsFilteredSales.filter((sale) => getSaleAnalyticsIncome(sale) > 0);
    }
    if (statsBreakdownType === "turnover" && statsBreakdownFilter === "tips") {
      return sortSalesByDateTimeDesc(
        list.filter((sale) => Number(sale.tips || 0) > 0),
      );
    }
    if (statsBreakdownType === "income") {
      if (statsBreakdownFilter === "home") {
        return sortSalesByDateTimeDesc(
          list.filter((sale) => sale.category === HOME_CATEGORY),
        );
      }
      if (statsBreakdownFilter === "salary") {
        return sortSalesByDateTimeDesc(
          list.filter((sale) => sale.category === SALON_PAYROLL_CATEGORY),
        );
      }
      if (statsBreakdownFilter === "tips") {
        return sortSalesByDateTimeDesc(
          list.filter(
            (sale) =>
              sale.category === SALON_SERVICES_CATEGORY &&
              Number(sale.tips || 0) > 0,
          ),
        );
      }
      if (statsBreakdownFilter === "kalym") {
        return sortSalesByDateTimeDesc(
          list.filter((sale) => sale.category === KALYM_CATEGORY),
        );
      }
    }
    return sortSalesByDateTimeDesc(list);
  }, [statsFilteredSales, statsBreakdownType, statsBreakdownFilter]);

  const statsCalendarMarkedDates = useMemo(() => {
    const map = new Map<string, Set<string>>();
    sales.forEach((sale) => {
      if (sale.isDeferred) return;
      if (!selectedCategories.includes(sale.category)) return;
      if (statsClient !== "all" && sale.clientName !== statsClient) return;
      if (!sale.date) return;
      if (!MARKED_CATEGORIES.includes(sale.category)) return;
      if (!map.has(sale.date)) map.set(sale.date, new Set());
      map.get(sale.date)!.add(sale.category);
    });
    return map;
  }, [sales, selectedCategories, statsClient]);

  return {
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
  };
}
