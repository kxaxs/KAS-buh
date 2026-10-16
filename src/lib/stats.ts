// Pure stats/aggregation helpers for KAS-buh (extracted from App.tsx)

import {
  SALON_SERVICES_CATEGORY,
  SALON_PAYROLL_CATEGORY,
  HOME_CATEGORY,
  KALYM_CATEGORY,
  getSaleTurnover,
  getSaleAccrual,
  getSaleAnalyticsIncome,
  getSaleIncome,
} from "./app-core";
import type { Sale } from "../types";
import { parseNonNegativeMoney } from "./app-core";

export interface StatsTotals {
  turnover: number;
  income: number;
  accrual: number;
  salonCleanIncome: number;
  homeIncome: number;
  kalymIncome: number;
  salonCount: number;
  tipsAmount: number;
}

export const calculateStats = (data: Sale[] | null | undefined): StatsTotals => {
  if (!Array.isArray(data)) {
    return {
      turnover: 0,
      income: 0,
      accrual: 0,
      salonCleanIncome: 0,
      homeIncome: 0,
      kalymIncome: 0,
      salonCount: 0,
      tipsAmount: 0,
    } as StatsTotals;
  }

  return data.reduce(
    (acc, sale) =>
      sale.isDeferred
        ? acc
        : {
            turnover: acc.turnover + getSaleTurnover(sale),
            income: acc.income + getSaleAnalyticsIncome(sale),
            accrual: acc.accrual + getSaleAccrual(sale),
            salonCleanIncome:
              acc.salonCleanIncome +
              (sale.category === SALON_PAYROLL_CATEGORY
                ? Number(sale.tips || 0)
                : 0),
            homeIncome:
              acc.homeIncome +
              (sale.category === HOME_CATEGORY ? getSaleIncome(sale) : 0),
            kalymIncome:
              acc.kalymIncome +
              (sale.category === KALYM_CATEGORY ? getSaleIncome(sale) : 0),
            salonCount:
              acc.salonCount +
              (sale.category === SALON_SERVICES_CATEGORY ? 1 : 0),
            tipsAmount:
              acc.tipsAmount +
              (sale.category === SALON_SERVICES_CATEGORY
                ? Number(sale.tips || 0)
                : 0),
          },
    {
      turnover: 0,
      income: 0,
      accrual: 0,
      salonCleanIncome: 0,
      homeIncome: 0,
      kalymIncome: 0,
      salonCount: 0,
      tipsAmount: 0,
    },
  );
};

export const getReportSaleAmount = (sale: Sale): number => {
  if (sale.category === SALON_SERVICES_CATEGORY) {
    return (
      getSaleTurnover(sale) ||
      getSaleAccrual(sale) ||
      (parseNonNegativeMoney(sale.tips) ?? 0) ||
      (parseNonNegativeMoney(sale.manualIncome) ?? 0)
    );
  }
  if (sale.category === SALON_PAYROLL_CATEGORY) {
    return parseNonNegativeMoney(sale.tips) || parseNonNegativeMoney(sale.manualIncome) || 0;
  }
  return parseNonNegativeMoney(sale.manualIncome) || getSaleTurnover(sale);
};
