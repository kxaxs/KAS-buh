// Reminder notifications: scheduling + opening a sale when a reminder fired
// (extracted from App.tsx)

import { useEffect, useState } from "react";
import type { Sale } from "../types";

interface UseRemindersArgs {
  sales: Sale[];
  notifEnabled: boolean;
  notifMinutes: number;
  onOpenSale: (saleId: string | number) => void;
}

export function useReminders({
  sales,
  notifEnabled,
  notifMinutes,
  onOpenSale,
}: UseRemindersArgs): { prevFiredSaleId: string | number | null } {
  const [prevFiredSaleId, setPrevFiredSaleId] = useState<string | number | null>(null);
  const [pendingSaleId, setPendingSaleId] = useState<string | number | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem("kas_notif_enabled", notifEnabled ? "1" : "0");
    } catch {}
  }, [notifEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem("kas_notif_minutes", String(notifMinutes));
    } catch {}
  }, [notifMinutes]);

  useEffect(() => {
    const _isNative = (window as any).Capacitor?.isNativePlatform?.();
    const _KasPlugin =
      _isNative && (window as any).Capacitor?.Plugins?.KasNotification;

    if (_KasPlugin && typeof _KasPlugin.cancel === "function") {
      try {
        const prevIdsStr = localStorage.getItem("kas_notif_ids");
        if (prevIdsStr) {
          const prevIds = JSON.parse(prevIdsStr);
          if (Array.isArray(prevIds)) {
            prevIds.forEach((id) => _KasPlugin.cancel({ id }).catch(() => {}));
          }
        }
      } catch (e) {}
    }

    if (!notifEnabled || notifMinutes <= 0) {
      try {
        localStorage.removeItem("kas_notif_ids");
      } catch {}
      return;
    }

    const _now = Date.now();
    const _trigMs = notifMinutes * 60 * 1000;
    const _toSched = sales
      .filter((sale) => sale.date && sale.time && !sale.isCompleted)
      .map((sale) => {
        try {
          return { ...sale, _dt: new Date(sale.date + "T" + sale.time) };
        } catch {
          return null;
        }
      })
      .filter(
        (sale): sale is NonNullable<typeof sale> =>
          !!sale &&
          Number.isFinite(sale._dt.getTime()) &&
          sale._dt.getTime() > _now &&
          sale._dt.getTime() - _now >= _trigMs,
      )
      .sort((a, b) => a._dt.getTime() - b._dt.getTime())
      .slice(0, 50);

    const timers: ReturnType<typeof setTimeout>[] = [];
    const newScheduledIds: number[] = [];

    for (const sale of _toSched) {
      const _fireAt = sale._dt.getTime() - _trigMs;
      if (_fireAt <= _now) continue;
      const _id =
        (Math.abs(
          String(sale.id)
            .split("")
            .reduce((h, ch) => ((h << 5) - h + ch.charCodeAt(0)) | 0, 0),
        ) %
          999000) +
        1;
      const _name = (sale.clientName || "").trim() || sale.category || "Чек";

      if (_KasPlugin && typeof _KasPlugin.schedule === "function") {
        _KasPlugin.schedule({
          id: _id,
          title: "⏰ Напоминание",
          body: "Через " + notifMinutes + " мин: " + _name,
          fireAt: _fireAt,
          saleId: String(sale.id),
        }).catch(() => {});
        newScheduledIds.push(_id);
      } else {
        const delay = _fireAt - _now;
        const t = setTimeout(() => {
          if (notifEnabled && notifMinutes > 0) {
            try {
              new Notification("⏰ Напоминание", {
                body: "Через " + notifMinutes + " мин: " + _name,
                icon: "./app-icon-192.png",
                tag: "kas-" + sale.id,
              });
            } catch {}
          }
        }, delay);
        timers.push(t);
      }
    }

    if (_KasPlugin) {
      try {
        localStorage.setItem("kas_notif_ids", JSON.stringify(newScheduledIds));
      } catch {}
    }

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [notifEnabled, notifMinutes, sales]);

  // Opening a sale from a notification tap: the native side puts the saleId
  // into the activity intent ("kas_sale_id" extra). Consume it on mount
  // (cold start from a tap) and whenever the app returns to the foreground
  // (warm start from a tap).
  useEffect(() => {
    const consume = async () => {
      const KN = (window as any).Capacitor?.Plugins?.KasNotification;
      if (!KN || typeof KN.consumePendingSale !== "function") return;
      try {
        const r = await KN.consumePendingSale();
        const saleId = r && r.saleId ? r.saleId : "";
        if (saleId) setPendingSaleId(saleId);
      } catch {}
    };

    consume(); // cold start

    const onVisible = () => {
      if (document.visibilityState === "visible") consume();
    };
    document.addEventListener("visibilitychange", onVisible);

    let appSub: { remove?: () => void } | undefined;
    let disposed = false;
    try {
      const CapApp = (window as any).Capacitor?.Plugins?.App;
      if (CapApp && typeof CapApp.addListener === "function") {
        CapApp.addListener("appStateChange", (s: { isActive?: boolean }) => {
          if (s && s.isActive) consume();
        })
          .then((sub: { remove?: () => void }) => {
            if (disposed) {
              try {
                sub?.remove?.();
              } catch {}
            } else {
              appSub = sub;
            }
          })
          .catch(() => {});
      }
    } catch {}

    return () => {
      disposed = true;
      document.removeEventListener("visibilitychange", onVisible);
      try {
        appSub?.remove?.();
      } catch {}
    };
  }, []);

  // Open the pending sale as soon as it appears in the store (on cold start
  // the sales may still be loading when the intent extra is read).
  useEffect(() => {
    if (pendingSaleId === null || pendingSaleId === "") return;
    const sale = sales.find((s) => String(s.id) === String(pendingSaleId));
    if (sale && sale.id !== undefined) {
      setPrevFiredSaleId(sale.id);
      onOpenSale(sale.id);
      setPendingSaleId(null);
    }
  }, [pendingSaleId, sales, onOpenSale]);

  return { prevFiredSaleId };
}
