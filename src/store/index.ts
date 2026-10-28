// Global app store: Zustand + IndexedDB (with localStorage migration)

import { create } from "zustand";
import { del, get, set } from "idb-keyval";
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
  replaceData: (data: { sales: Sale[]; procedures: Procedure[]; clients: Client[] }) => Promise<void>;
  mergeData: (data: { sales: Sale[]; procedures: Procedure[]; clients: Client[] }) => Promise<void>;
  clearAllData: () => Promise<void>;
}

let writeQueue = Promise.resolve();
let writeRevision = 0;

/**
 * Если прошлый импорт прервался (приложение убили между записью ROLLBACK
 * и удалением ключа после успеха) — восстанавливаем снапшот «до импорта».
 * Возвращает восстановленные данные или null, если откатывать нечего.
 */
const restorePendingRollback = async (): Promise<{
  sales: Sale[];
  procedures: Procedure[];
  clients: Client[];
} | null> => {
  try {
    const rollback = await get<{
      sales?: Sale[];
      procedures?: Procedure[];
      clients?: Client[];
    }>(STORAGE_KEYS.ROLLBACK);
    if (!rollback) return null;
    if (
      !Array.isArray(rollback.sales) ||
      !Array.isArray(rollback.procedures) ||
      !Array.isArray(rollback.clients)
    ) {
      // Битый снапшот — просто убираем мусор
      await del(STORAGE_KEYS.ROLLBACK);
      return null;
    }
    const restoredSales = normalizeSales(rollback.sales);
    const restored = {
      sales: restoredSales,
      procedures: normalizeProcedures(rollback.procedures),
      clients: normalizeClients(rollback.clients, restoredSales),
    };
    await set(STORAGE_KEYS.SNAPSHOT, { ...restored, revision: ++writeRevision });
    await del(STORAGE_KEYS.ROLLBACK);
    console.warn("[KAS] Прерванный импорт обнаружен — данные восстановлены из снапшота отката");
    return restored;
  } catch (error) {
    console.error("Rollback restore failed:", error);
    return null;
  }
};

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
  const snapshot = await get<{ sales?: Sale[]; procedures?: Procedure[]; clients?: Client[] }>(
    STORAGE_KEYS.SNAPSHOT,
  );
  if (snapshot) {
    return {
      sales: normalizeSales(snapshot.sales || []),
      procedures: normalizeProcedures(snapshot.procedures || []),
      clients: normalizeClients(snapshot.clients || [], normalizeSales(snapshot.sales || [])),
    };
  }

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

    const loadWithRollback = async () => {
      const data = await withTimeout(loadInitialData(), IDB_TIMEOUT_MS);
      const rollback = await restorePendingRollback();
      return rollback || data;
    };

    try {
      const data = await loadWithRollback();
      setStore({ ...data, isStoreReady: true, storageFailed: false });
    } catch (error) {
      console.error("Data load error:", error);
      // One retry before giving up
      try {
        const data = await loadWithRollback();
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

  replaceData: async (data) => {
    const snapshot = {
      sales: data.sales,
      procedures: data.procedures,
      clients: data.clients,
      revision: ++writeRevision,
    };
    writeQueue = writeQueue.then(() => set(STORAGE_KEYS.SNAPSHOT, snapshot));
    await writeQueue;
    setStore(data);
  },

  mergeData: async (data) => {
    const current = getStore();
    const usedSales = new Set(current.sales.map((item) => String(item.id)));
    const usedClients = new Set(current.clients.map((item) => String(item.id)));
    const usedProcedures = new Set(current.procedures.map((item) => String(item.id)));
    const renameIfNeeded = (value: string | number | undefined, used: Set<string>) => {
      let result = value || crypto.randomUUID();
      while (used.has(String(result))) result = crypto.randomUUID();
      used.add(String(result));
      return result;
    };

    const clientIds = new Map<string, string | number>();
    const procedureIds = new Map<string, string | number>();
    const importedClients = data.clients.map((item) => {
      const nextId = renameIfNeeded(item.id, usedClients);
      if (item.id !== undefined) clientIds.set(String(item.id), nextId);
      return { ...item, id: nextId };
    });
    const importedProcedures = data.procedures.map((item) => {
      const nextId = renameIfNeeded(item.id, usedProcedures);
      if (item.id !== undefined) procedureIds.set(String(item.id), nextId);
      return { ...item, id: nextId };
    });
    const merged = {
      sales: [
        ...current.sales,
        ...data.sales.map((item) => ({
          ...item,
          id: renameIfNeeded(item.id, usedSales),
          clientId:
            item.clientId === undefined
              ? item.clientId
              : clientIds.get(String(item.clientId)) || item.clientId,
          items: (item.items || []).map((saleItem) => ({
            ...saleItem,
            procedureId:
              saleItem.procedureId === undefined
                ? saleItem.procedureId
                : procedureIds.get(String(saleItem.procedureId)) || saleItem.procedureId,
          })),
        })),
      ],
      clients: [...current.clients, ...importedClients],
      procedures: [...current.procedures, ...importedProcedures],
    };
    await getStore().replaceData(merged);
  },

  setSales: (updater) => {
    if (getStore().storageFailed) {
      console.error("[KAS] Storage unavailable — sales write skipped");
      return;
    }
    setStore((state) => {
      const updatedSales =
        typeof updater === "function" ? updater(state.sales) : updater;

      const revision = ++writeRevision;
      const snapshot = { ...state, sales: updatedSales };
      writeQueue = writeQueue
        .then(() => set(STORAGE_KEYS.SNAPSHOT, {
          sales: snapshot.sales,
          procedures: snapshot.procedures,
          clients: snapshot.clients,
          revision,
        }))
        .catch(console.error);
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

      const revision = ++writeRevision;
      const snapshot = { ...state, procedures: updatedProcedures };
      writeQueue = writeQueue
        .then(() => set(STORAGE_KEYS.SNAPSHOT, {
          sales: snapshot.sales,
          procedures: snapshot.procedures,
          clients: snapshot.clients,
          revision,
        }))
        .catch(console.error);
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

      const revision = ++writeRevision;
      const snapshot = { ...state, clients: updatedClients };
      writeQueue = writeQueue
        .then(() => set(STORAGE_KEYS.SNAPSHOT, {
          sales: snapshot.sales,
          procedures: snapshot.procedures,
          clients: snapshot.clients,
          revision,
        }))
        .catch(console.error);
      return { clients: updatedClients };
    });
  },

  clearAllData: async () => {
    await writeQueue;
    await Promise.all([
      del(STORAGE_KEYS.SNAPSHOT),
      del(STORAGE_KEYS.SALES),
      del(STORAGE_KEYS.PROCEDURES),
      del(STORAGE_KEYS.CLIENTS),
      del(STORAGE_KEYS.ROLLBACK),
    ]);
    setStore({ sales: [], procedures: [], clients: [] });
  },
}));
