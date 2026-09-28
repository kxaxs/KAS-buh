// Daily autosave of app data to Documents/KAS-БУХГАЛТЕРИЯ (extracted from App.tsx)

import { useEffect, useRef } from "react";
import { App as CapApp } from "@capacitor/app";
import { getToday, padNumber } from "../lib/app-core";
import type { Sale, Procedure, Client } from "../types";

interface UseAutosaveArgs {
  isStoreReady: boolean;
  storageFailed: boolean;
  sales: Sale[];
  procedures: Procedure[];
  clients: Client[];
}

export function useAutosave({
  isStoreReady,
  storageFailed,
  sales,
  procedures,
  clients,
}: UseAutosaveArgs): void {
  const storeDataRef = useRef({ sales, procedures, clients });
  const storageFailedRef = useRef(storageFailed);

  useEffect(() => {
    storeDataRef.current = { sales, procedures, clients };
  }, [sales, procedures, clients]);

  useEffect(() => {
    storageFailedRef.current = storageFailed;
  }, [storageFailed]);

  useEffect(() => {
    if (!isStoreReady) return;

    const performAutosave = async () => {
      try {
        // Never write backups from an empty state when storage failed to load
        if (storageFailedRef.current) return;

        const isCapacitorNative =
          typeof window !== "undefined" &&
          (window as any).Capacitor?.isNativePlatform?.();
        if (!isCapacitorNative) return;

        const today = getToday();
        const lastAutosave = localStorage.getItem("kas_last_autosave");
        if (lastAutosave === today) return; // Уже сохраняли сегодня

        const [{ Filesystem, Directory, Encoding }] = await Promise.all([
          import("@capacitor/filesystem"),
        ]);

        const data = JSON.stringify(storeDataRef.current, null, 2);

        const d = new Date();
        const yy = String(d.getFullYear()).slice(-2);
        const mm = padNumber(d.getMonth() + 1);
        const dd = padNumber(d.getDate());
        const hh = padNumber(d.getHours());
        const min = padNumber(d.getMinutes());
        const fileName = `auto${yy}.${mm}.${dd}-${hh}.${min}.json`;

        const dirPath = "KAS-БУХГАЛТЕРИЯ";

        try {
          await Filesystem.mkdir({
            path: dirPath,
            directory: Directory.Documents,
            recursive: true,
          });
        } catch (e) {
          // Игнорируем, если папка уже существует
        }

        await Filesystem.writeFile({
          path: `${dirPath}/${fileName}`,
          data,
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
        });

        const result = await Filesystem.readdir({
          path: dirPath,
          directory: Directory.Documents,
        });

        const backups = result.files
          .filter((f) => f.name.startsWith("auto") && f.name.endsWith(".json"))
          .sort((a, b) => b.name.localeCompare(a.name));

        if (backups.length > 3) {
          for (let i = 3; i < backups.length; i++) {
            await Filesystem.deleteFile({
              path: `${dirPath}/${backups[i].name}`,
              directory: Directory.Documents,
            });
          }
        }

        localStorage.setItem("kas_last_autosave", today);
        console.log("Autosave completed:", fileName);
      } catch (err) {
        console.error("Autosave failed:", err);
      }
    };

    performAutosave();

    const appStateListener = CapApp.addListener("appStateChange", ({ isActive }) => {
      if (isActive) {
        performAutosave();
      }
    });

    return () => {
      appStateListener.then((l) => l.remove()).catch(() => {});
    };
  }, [isStoreReady]);
}
