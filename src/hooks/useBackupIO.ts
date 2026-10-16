// Export/import of JSON backups (extracted from App.tsx)

import { useCallback } from "react";
import {
  getExportFileName,
  normalizeSales,
  normalizeProcedures,
  normalizeClients,
  STORAGE_KEYS,
} from "../lib/app-core";
import { set } from "idb-keyval";
import type { Sale, Procedure, Client } from "../types";

export interface BackupNotifyPayload {
  variant: string;
  title: string;
  message: string;
}

interface UseBackupIOArgs {
  sales: Sale[];
  procedures: Procedure[];
  clients: Client[];
  setSales: (updater: Sale[] | ((prev: Sale[]) => Sale[])) => void;
  setProcedures: (
    updater: Procedure[] | ((prev: Procedure[]) => Procedure[]),
  ) => void;
  setClients: (updater: Client[] | ((prev: Client[]) => Client[])) => void;
  replaceData?: (data: { sales: Sale[]; procedures: Procedure[]; clients: Client[] }) => Promise<void>;
  notify: (payload: BackupNotifyPayload) => void;
}

export function useBackupIO({
  sales,
  procedures,
  clients,
  setSales,
  setProcedures,
  setClients,
  replaceData,
  notify,
}: UseBackupIOArgs): {
  handleExport: () => Promise<void>;
  handleImport: (event: any) => Promise<void>;
} {
  const handleExport = useCallback(async () => {
    const data = JSON.stringify({ sales, procedures, clients }, null, 2);
    const fileName = getExportFileName();
    const blob = new Blob([data], { type: "application/json;charset=utf-8" });

    try {
      const isCapacitorNative =
        typeof window !== "undefined" &&
        (window as any).Capacitor?.isNativePlatform?.();

      if (isCapacitorNative) {
        try {
          const [{ Filesystem, Directory, Encoding }, shareLib] =
            await Promise.all([
              import("@capacitor/filesystem"),
              import("@capacitor/share").catch(() => null),
            ]);

          const result = await Filesystem.writeFile({
            path: fileName,
            data,
            directory: Directory.Cache,
            encoding: Encoding.UTF8,
            recursive: true,
          });

          if (shareLib?.Share && result?.uri) {
            try {
              await shareLib.Share.share({
                title: "KAS-Бухгалтерия — резервная копия",
                text: `Файл: ${fileName}`,
                url: result.uri,
                dialogTitle: "Сохранить резервную копию",
              });
            } catch (shareErr: any) {
              if (shareErr?.message && /cancel/i.test(shareErr.message)) {
                // user cancelled the share sheet
                return;
              } else {
                console.warn("Share fallback:", shareErr);
              }
            }
          }

          notify({
            variant: "info",
            title: "Готово",
            message: "Резервная копия успешно выгружена.",
          });
          return;
        } catch (capError: any) {
          console.error("Capacitor export error:", capError);
          notify({
            variant: "error",
            title: "Не удалось сохранить",
            message:
              capError?.message ||
              "Не получилось записать файл в память телефона.",
          });
          return;
        }
      }

      if (typeof (window as any).showSaveFilePicker === "function") {
        try {
          const handle = await (window as any).showSaveFilePicker({
            suggestedName: fileName,
            types: [
              {
                description: "Резервная копия KAS",
                accept: { "application/json": [".json"] },
              },
            ],
          });
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
          return;
        } catch (pickerError: any) {
          if (pickerError?.name === "AbortError") return;
          console.warn("Save picker fallback:", pickerError);
        }
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Export error:", error);
      notify({
        variant: "error",
        title: "Не удалось сохранить",
        message: error?.message || "Неизвестная ошибка при выгрузке.",
      });
    }
  }, [sales, procedures, clients, notify]);

  const handleImport = useCallback(async (event: any) => {
    const showError = (msg: string) =>
      notify({
        variant: "error",
        title: "Не удалось загрузить",
        message: msg,
      });

    try {
      const file = event?.target?.files?.[0];
      if (!file) return;

       const MAX_IMPORT_BYTES = 20 * 1024 * 1024;
       if (file.size === 0) {
        showError("Выбранный файл пустой.");
        event.target.value = "";
        return;
      }
      if (file.size > MAX_IMPORT_BYTES) {
        showError("Файл слишком большой. Максимальный размер резервной копии — 20 МБ.");
        event.target.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onerror = () => {
        showError("Не удалось прочитать файл. Попробуй ещё раз.");
      };
       reader.onload = async (loadEvent) => {
        try {
          const raw = (loadEvent.target as any)?.result;
          if (!raw || typeof raw !== "string") {
            showError("Файл повреждён или пуст.");
            return;
          }
          let data;
          try {
            data = JSON.parse(raw);
          } catch {
            showError(
              "Файл не является резервной копией KAS-Бухгалтерии. Выбери JSON-файл, созданный через «Выгрузка данных».",
            );
            return;
          }
           if (
             !data ||
             typeof data !== "object" ||
             !Array.isArray(data.sales) ||
             !Array.isArray(data.clients) ||
             !Array.isArray(data.procedures)
           ) {
             showError("Резервная копия должна содержать чеки, клиентов и услуги.");
             return;
           }
           if (data.sales.length > 100000 || data.clients.length > 10000 || data.procedures.length > 10000) {
             showError("В резервной копии слишком много записей.");
             return;
           }
          const importedSales = normalizeSales(
            Array.isArray(data.sales) ? data.sales : [],
          );
          const importedProcedures = normalizeProcedures(
            Array.isArray(data.procedures) ? data.procedures : [],
          );
          const importedClients = Array.isArray(data.clients)
            ? data.clients
            : [];

           const finalClients = normalizeClients(importedClients, importedSales);
           await set(STORAGE_KEYS.ROLLBACK, { sales, procedures, clients, createdAt: new Date().toISOString() });
           if (replaceData) {
             await replaceData({
               sales: importedSales,
               procedures: importedProcedures,
               clients: finalClients,
             });
           } else {
             setSales(importedSales);
             setProcedures(importedProcedures);
             setClients(finalClients);
           }

          notify({
            variant: "info",
            title: "Готово",
            message: `Данные загружены.\nЧеки: ${importedSales.length}\nКлиенты: ${importedClients.length}\nУслуги: ${importedProcedures.length}`,
          });
        } catch (error: any) {
          console.error("Import error:", error);
          showError(error?.message || "Не удалось обработать файл.");
        }
      };

      reader.readAsText(file);
      event.target.value = "";
    } catch (error: any) {
      console.error("Import error:", error);
      showError(error?.message || "Неизвестная ошибка.");
    }
  }, [notify, setSales, setProcedures, setClients, replaceData]);

  return { handleExport, handleImport };
}
