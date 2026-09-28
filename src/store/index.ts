// Global app store: Zustand + IndexedDB (with localStorage migration)

import { create } from "zustand";
import { get, set } from "idb-keyval";
import {
  STORAGE_KEYS,
  normalizeSales,
  normalizeProcedures,
  normalizeClients,
} from "../lib/app-core";
import type { Sale, Procedure, Client, TabId } from "../types";

const IDB_TIMEOUT_MS = 2000;

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
  Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("IndexedDB timeout")), ms),
    ),
  ]);

export interface AppState {
  isStoreReady: boolean;
  /** true when data could not be loaded: writes are blocked to avoid clobbering real data */
  storageFailed: boolean;
  sales: Sale[];
  procedures: Procedure[];
  clients: Client[];
  activeTab: TabId;
  initStore: () => Promise<void>;
  setActiveTab: (tab: TabId) => void;
  setSales: (updater: Sale[] | ((prev: Sale[]) => Sale[])) => void;
  setProcedures: (
    updater: Procedure[] | ((prev: Procedure[]) => Procedure[]),
  ) => void;
  setClients: (updater: Client[] | ((prev: Client[]) => Client[])) => void;
}

const loadInitialData = async (): Promise<{
  sales: Sale[];
  procedures: Procedure[];
  clients: Client[];
}> => {
  // 1. Попытка загрузить из LocalStorage (Миграция)
  const lsSales = localStorage.getItem(STORAGE_KEYS.SALES);
  const lsProcedures = localStorage.getItem(STORAGE_KEYS.PROCEDURES);
  const lsClients = localStorage.getItem(STORAGE_KEYS.CLIENTS);

  if (lsSales || lsProcedures || lsClients) {
    console.log("Migrating data from localStorage to IndexedDB...");

    const parsedSales = normalizeSales(lsSales ? JSON.parse(lsSales) : []);
    const parsedProcedures = normalizeProcedures(
      lsProcedures ? JSON.parse(lsProcedures) : [],
    );
    const parsedClients = lsClients ? JSON.parse(lsClients) : [];
    const finalClients = normalizeClients(parsedClients, parsedSales);

    await set(STORAGE_KEYS.SALES, parsedSales);
    await set(STORAGE_KEYS.PROCEDURES, parsedProcedures);
    await set(STORAGE_KEYS.CLIENTS, finalClients);

    localStorage.removeItem(STORAGE_KEYS.SALES);
    localStorage.removeItem(STORAGE_KEYS.PROCEDURES);
    localStorage.removeItem(STORAGE_KEYS.CLIENTS);

    return {
      sales: parsedSales,
      procedures: parsedProcedures,
      clients: finalClients,
    };
  }

  // Обычная загрузка из IDB
  const [idbSales, idbProcedures, idbClients] = await Promise.all([
    get<Sale[]>(STORAGE_KEYS.SALES),
    get<Procedure[]>(STORAGE_KEYS.PROCEDURES),
    get<Client[]>(STORAGE_KEYS.CLIENTS),
  ]);

  return {
    sales: idbSales || [],
    procedures: idbProcedures || [],
    clients: idbClients || [],
  };
};

export const useAppStore = create<AppState>((setStore, getStore) => ({
  isStoreReady: false,
  storageFailed: false,
  sales: [],
  procedures: [],
  clients: [],
  activeTab: "dashboard",

  initStore: async () => {
    if (getStore().isStoreReady) return;

    try {
      const data = await withTimeout(loadInitialData(), IDB_TIMEOUT_MS);
      setStore({ ...data, isStoreReady: true, storageFailed: false });
    } catch (error) {
      console.error("Data load error:", error);
      // One retry before giving up
      try {
        const data = await withTimeout(loadInitialData(), IDB_TIMEOUT_MS);
        setStore({ ...data, isStoreReady: true, storageFailed: false });
      } catch (retryError) {
        console.error("Data load retry failed:", retryError);
        // Storage is unusable: unlock the UI but block all writes so we
        // never overwrite real data with an empty state.
        setStore({ isStoreReady: true, storageFailed: true });
      }
    }
  },

  setActiveTab: (tab: TabId) => setStore({ activeTab: tab }),

  setSales: (updater) => {
    if (getStore().storageFailed) {
      console.error("[KAS] Storage unavailable — sales write skipped");
      return;
    }
    setStore((state) => {
      const updatedSales =
        typeof updater === "function" ? updater(state.sales) : updater;

      set(STORAGE_KEYS.SALES, updatedSales).catch(console.error);
      return { sales: updatedSales };
    });
  },

  setProcedures: (updater) => {
    if (getStore().storageFailed) {
      console.error("[KAS] Storage unavailable — procedures write skipped");
      return;
    }
    setStore((state) => {
      const updatedProcedures =
        typeof updater === "function" ? updater(state.procedures) : updater;

      set(STORAGE_KEYS.PROCEDURES, updatedProcedures).catch(console.error);
      return { procedures: updatedProcedures };
    });
  },

  setClients: (updater) => {
    if (getStore().storageFailed) {
      console.error("[KAS] Storage unavailable — clients write skipped");
      return;
    }
    setStore((state) => {
      const updatedClients =
        typeof updater === "function" ? updater(state.clients) : updater;

      set(STORAGE_KEYS.CLIENTS, updatedClients).catch(console.error);
      return { clients: updatedClients };
    });
  },
}));
