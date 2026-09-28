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

  useEffect(() => {
    const _check = async () => {
      const _KN = (window as any).Capacitor?.Plugins?.KasNotification;
      if (!_KN) return;
      try {
        const r = await _KN.getLastFired();
        if (r && r.ts > 0) {
          const _ago = Math.round((Date.now() - r.ts) / 1000);
          if (_ago < 5 && prevFiredSaleId !== r.saleId) {
            setPrevFiredSaleId(r.saleId);
            // App is open — dismiss the visible notification
            if (r.id && typeof _KN.clear === "function") {
              try {
                _KN.clear({ id: r.id }).catch(() => {});
              } catch {}
            }
            const sale = sales.find((s) => String(s.id) === String(r.saleId));
            if (sale && sale.id !== undefined) {
              onOpenSale(sale.id);
            }
          }
        }
      } catch {}
    };
    _check();
    const interval = setInterval(_check, 3000);
    return () => clearInterval(interval);
  }, [sales, prevFiredSaleId, onOpenSale]);

  return { prevFiredSaleId };
}
