// @ts-nocheck
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAppStore } from '../store';
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

import { APP_ID, SALON_SERVICES_CATEGORY, SALON_PAYROLL_CATEGORY, LEGACY_SALON_CATEGORY, HOME_CATEGORY, KALYM_CATEGORY, CATEGORIES, MARKED_CATEGORIES, CATEGORY_DOT_COLOR, CURRENCY, WEEK_DAYS, PAYROLL_TYPES, BACK_EXIT_DELAY, BACK_LAYER_COOLDOWN, BACK_DEBOUNCE, STORAGE_KEYS, setCapacitorAppRef, exitApp, padNumber, toDateKey, parseDateKey, getToday, getCurrentTime, getExportFileName, formatDate, formatLongDate, formatMonthLabel, shiftMonth, getMonthDays, getSaleDateTime, sortSalesByDateTimeDesc, getPeriodRangeLabel, inferRegisteredAt, normalizeSaleCategory, getPayrollType, normalizeSales, getSaleDisplayName, normalizeClients, normalizeProcedures, getInitialSaleState, getSaleTurnover, getSaleAccrual, getSaleSalonCleanIncome, getSaleIncome, getSaleAnalyticsIncome, getSaleCardAmount, RU_MONTHS_FULL, RU_MONTHS_SHORT, RU_WEEKDAYS, formatHeaderDate, isoToDDMMYYYY, ddmmyyyyToIso, formatNumber } from '../lib/app-core';
import { Num } from "./Num";
import { useSwipeNavigation } from "../hooks/useSwipeNavigation";
export function DatePickerDialog({ isOpen, value, onClose, onConfirm }) {
  const [selectedIso, setSelectedIso] = useState(value || "");
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [mode, setMode] = useState("calendar");
  const [textValue, setTextValue] = useState("");
  const [textError, setTextError] = useState(false);

  // листание месяца горизонтальным свайпом (как кнопками-стрелками)
  const swipe = useSwipeNavigation({
    onSwipeLeft: () => goNext(),
    onSwipeRight: () => goPrev(),
  });

  useEffect(() => {
    if (!isOpen) return;
    const iso = value || new Date().toISOString().slice(0, 10);
    setSelectedIso(iso);
    const [y, m] = iso.split("-").map((n) => parseInt(n, 10));
    setViewYear(y);
    setViewMonth(m - 1);
    setMode("calendar");
    setTextValue(isoToDDMMYYYY(iso));
    setTextError(false);
  }, [isOpen, value]);

  if (!isOpen) return null;

  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  // Week starts Monday: convert getDay() (0=Sun) -> 0=Mon..6=Sun
  const startOffset = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const goPrev = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else setViewMonth(viewMonth - 1);
  };
  const goNext = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else setViewMonth(viewMonth + 1);
  };

  const handlePickDay = (d) => {
    const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    setSelectedIso(iso);
    setTextValue(isoToDDMMYYYY(iso));
  };

  const handleEnterText = () => {
    setTextValue(isoToDDMMYYYY(selectedIso));
    setTextError(false);
    setMode("text");
  };

  const handleEnterCalendar = () => {
    const iso = ddmmyyyyToIso(textValue);
    if (iso) {
      setSelectedIso(iso);
      const [y, m] = iso.split("-").map((n) => parseInt(n, 10));
      setViewYear(y);
      setViewMonth(m - 1);
      setTextError(false);
    } else if (textValue.trim()) {
      setTextError(true);
      return;
    }
    setMode("calendar");
  };

  const handleOk = () => {
    let iso = selectedIso;
    if (mode === "text") {
      const parsed = ddmmyyyyToIso(textValue);
      if (!parsed) {
        setTextError(true);
        return;
      }
      iso = parsed;
    }
    if (iso) onConfirm(iso);
    onClose();
  };

  const selectedDay = (() => {
    if (!selectedIso) return null;
    const [y, m, d] = selectedIso.split("-").map((n) => parseInt(n, 10));
    if (y === viewYear && m - 1 === viewMonth) return d;
    return null;
  })();

  return (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-[2rem] bg-[#22202A] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        {...(mode === "calendar" ? swipe : {})}
      >
        <div className="mb-2 text-sm font-bold text-white/80">
          Выберите дату
        </div>

        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="text-3xl font-light text-white">
            {formatHeaderDate(selectedIso)}
          </div>
          <button
            type="button"
            onClick={
              mode === "calendar" ? handleEnterText : handleEnterCalendar
            }
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#C8B6FF] hover:bg-white/5"
          >
            {mode === "calendar" ? (
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
        </div>

        {mode === "calendar" ? (
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-bold text-white/85">
                {RU_MONTHS_FULL[viewMonth]} {viewYear} г.
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={goPrev}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-white/85 hover:bg-white/5"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-white/85 hover:bg-white/5"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-7 gap-y-0.5 text-center text-xs font-bold text-white/55">
              {RU_WEEKDAYS.map((w, i) => (
                <div key={i} className="py-2">
                  {w}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-y-0.5 text-center">
              {cells.map((d, i) => {
                if (d === null) return <div key={i} className="h-11" />;
                const isSelected = d === selectedDay;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handlePickDay(d)}
                    className={`mx-auto flex h-11 w-11 items-center justify-center rounded-full text-base transition ${
                      isSelected
                        ? "bg-[#C8B6FF] font-bold text-[#1A1620]"
                        : "text-white hover:bg-white/5"
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mt-6">
            <div
              className={`relative rounded-md border-2 px-4 pb-3 pt-5 ${
                textError ? "border-red-400" : "border-[#C8B6FF]"
              }`}
            >
              <span
                className={`absolute -top-2.5 left-3 bg-[#22202A] px-1 text-xs ${
                  textError ? "text-red-400" : "text-[#C8B6FF]"
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
                value={textValue}
                onChange={(e) => {
                  setTextValue(e.target.value);
                  setTextError(false);
                }}
                className="w-full bg-transparent text-2xl font-light text-white outline-none"
                autoFocus
              />
            </div>
            {textError && (
              <div className="mt-2 text-xs text-red-400">
                Неверный формат даты
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-6">
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-bold uppercase tracking-wider text-[#C8B6FF]"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleOk}
            className="text-sm font-bold uppercase tracking-wider text-[#C8B6FF]"
          >
            Ок
          </button>
        </div>
      </div>
    </div>
  );
}

export function TimePickerDialog({ isOpen, value, onClose, onConfirm }) {
  const [mode, setMode] = useState("hour");
  const [hour, setHour] = useState(0);
  const [minute, setMinute] = useState(0);
  const dialRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const [h, m] = (value || "00:00")
      .split(":")
      .map((n) => parseInt(n, 10) || 0);
    setHour(h);
    setMinute(m);
    setMode("hour");
  }, [isOpen, value]);

  if (!isOpen) return null;

  const dialSize = 280;
  const center = dialSize / 2;
  const outerRadius = 118;
  const innerRadius = 78;

  const hourPositions = Array.from({ length: 24 }, (_, i) => {
    const isInner = i >= 12;
    const r = isInner ? innerRadius : outerRadius;
    const angle = ((i % 12) / 12) * Math.PI * 2 - Math.PI / 2;
    return {
      value: i,
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  });

  const minutePositions = Array.from({ length: 12 }, (_, i) => {
    const v = i * 5;
    const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
    return {
      value: v,
      x: center + outerRadius * Math.cos(angle),
      y: center + outerRadius * Math.sin(angle),
    };
  });

  const positions = mode === "hour" ? hourPositions : minutePositions;
  const selectedValue = mode === "hour" ? hour : minute;
  const selected =
    mode === "hour"
      ? hourPositions.find((p) => p.value === hour) || hourPositions[0]
      : (() => {
          const exact = minutePositions.find((p) => p.value === minute);
          if (exact) return exact;
          const angle = (minute / 60) * Math.PI * 2 - Math.PI / 2;
          return {
            value: minute,
            x: center + outerRadius * Math.cos(angle),
            y: center + outerRadius * Math.sin(angle),
          };
        })();

  const handleDialPointer = (clientX, clientY) => {
    const node = dialRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const x = clientX - rect.left - center;
    const y = clientY - rect.top - center;
    const angle = Math.atan2(y, x) + Math.PI / 2;
    const normalized = (angle + Math.PI * 2) % (Math.PI * 2);
    if (mode === "hour") {
      const dist = Math.hypot(x, y);
      const ringOffset = dist < (innerRadius + outerRadius) / 2 ? 12 : 0;
      const idx = Math.round((normalized / (Math.PI * 2)) * 12) % 12;
      setHour((ringOffset + idx) % 24);
    } else {
      const idx = Math.round((normalized / (Math.PI * 2)) * 60) % 60;
      setMinute(idx);
    }
  };

  const onPointerDown = (e) => {
    e.preventDefault();
    handleDialPointer(e.clientX, e.clientY);
  };
  const onPointerMove = (e) => {
    if (e.buttons !== 1) return;
    handleDialPointer(e.clientX, e.clientY);
  };
  const onPointerUp = () => {
    if (mode === "hour") setMode("minute");
  };

  const handleConfirm = () => {
    const formatted = `${padNumber(hour)}:${padNumber(minute)}`;
    onConfirm(formatted);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-[2rem] bg-[#22202A] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 text-sm font-bold text-white/80">Время</div>

        <div className="mb-6 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode("hour")}
            className={`flex h-20 flex-1 items-center justify-center rounded-2xl text-5xl font-light tabular-nums transition ${
              mode === "hour"
                ? "bg-[#6B5BAE] text-white shadow-lg"
                : "bg-white/10 text-white/85"
            }`}
          >
            {padNumber(hour)}
          </button>
          <span className="text-4xl font-light text-white/70">:</span>
          <button
            type="button"
            onClick={() => setMode("minute")}
            className={`flex h-20 flex-1 items-center justify-center rounded-2xl text-5xl font-light tabular-nums transition ${
              mode === "minute"
                ? "bg-[#6B5BAE] text-white shadow-lg"
                : "bg-white/10 text-white/85"
            }`}
          >
            {padNumber(minute)}
          </button>
        </div>

        <div className="flex justify-center">
          <div
            ref={dialRef}
            className="relative touch-none select-none rounded-full bg-white/5"
            style={{ width: dialSize, height: dialSize }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <svg
              className="pointer-events-none absolute inset-0"
              width={dialSize}
              height={dialSize}
            >
              <circle cx={center} cy={center} r={3} fill="#C8B6FF" />
              <line
                x1={center}
                y1={center}
                x2={selected.x}
                y2={selected.y}
                stroke="#C8B6FF"
                strokeWidth={2}
              />
              <circle cx={selected.x} cy={selected.y} r={22} fill="#C8B6FF" />
            </svg>
            {positions.map((pos) => {
              const isSelected = pos.value === selectedValue;
              return (
                <div
                  key={`${mode}-${pos.value}`}
                  className={`pointer-events-none absolute flex items-center justify-center text-base tabular-nums ${
                    isSelected ? "font-bold text-[#1A1620]" : "text-white/85"
                  }`}
                  style={{
                    width: 36,
                    height: 36,
                    left: pos.x - 18,
                    top: pos.y - 18,
                  }}
                >
                  {mode === "hour" ? pos.value : padNumber(pos.value)}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-6">
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-bold uppercase tracking-wider text-[#C8B6FF]"
          >
            Отменить
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="text-sm font-bold uppercase tracking-wider text-[#C8B6FF]"
          >
            Ок
          </button>
        </div>
      </div>
    </div>
  );
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  layerClass = "z-50",
  headerActions = null,
  endActions = null,
}) {
  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 ${layerClass} flex flex-col bg-[#0F1115]`}>
      <div className="flex-shrink-0 flex items-center justify-between gap-3 px-6 pt-5 pb-2 border-b border-white/5">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-black uppercase tracking-wider text-white">
            {title}
          </h2>
          {headerActions}
        </div>
        <div className="flex items-center" style={{ gap: "5mm" }}>
          {endActions}
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/5 p-2 transition hover:bg-white/10"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
    </div>
  );
}

const MONTHS_RU = [
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
const DAYS_RU_SHORT = ["П", "В", "С", "Ч", "П", "С", "В"];

export function CalendarPicker({ value, onChange, onClose }) {
  const todayStr = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })();
  const parse = (s) =>
    s
      ? {
          y: parseInt(s.split("-")[0]),
          m: parseInt(s.split("-")[1]) - 1,
          d: parseInt(s.split("-")[2]),
        }
      : null;
  const initial = parse(value) || parse(todayStr);
  const [viewYear, setViewYear] = useState(initial.y);
  const [viewMonth, setViewMonth] = useState(initial.m);
  const [selected, setSelected] = useState(value || todayStr);

  // листание месяца горизонтальным свайпом (как кнопками-стрелками)
  const swipe = useSwipeNavigation({
    onSwipeLeft: () => nextMonth(),
    onSwipeRight: () => prevMonth(),
  });

  const firstWeekDay = (y, m) => {
    const d = new Date(y, m, 1).getDay();
    return d === 0 ? 6 : d - 1;
  };
  const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const toStr = (y, m, d) =>
    `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const cells = [];
  for (let i = 0; i < firstWeekDay(viewYear, viewMonth); i++) cells.push(null);
  for (let i = 1; i <= daysInMonth(viewYear, viewMonth); i++) cells.push(i);

  const prevMonth = () =>
    viewMonth === 0
      ? (setViewMonth(11), setViewYear((y) => y - 1))
      : setViewMonth((m) => m - 1);
  const nextMonth = () =>
    viewMonth === 11
      ? (setViewMonth(0), setViewYear((y) => y + 1))
      : setViewMonth((m) => m + 1);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 px-5"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-[#1E222A] p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        {...swipe}
      >
        <div className="mb-5 flex items-center justify-between">
          <span className="flex items-center gap-1 text-base font-semibold text-white">
            {MONTHS_RU[viewMonth]} {viewYear} г.
            <ChevronDown size={16} className="text-white/50" />
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={prevMonth}
              className="text-white/60 hover:text-white"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={nextMonth}
              className="text-white/60 hover:text-white"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-y-0.5 text-center text-xs font-bold text-white/55">
          {DAYS_RU_SHORT.map((d, i) => (
            <div key={i} className="py-2">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-0.5">
          {cells.map((day, i) => {
            if (!day) return <div key={i} className="h-11" />;
            const dateStr = toStr(viewYear, viewMonth, day);
            const isToday = dateStr === todayStr;
            const isSel = dateStr === selected;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelected(dateStr)}
                className={`mx-auto flex h-11 w-11 items-center justify-center rounded-full text-base font-medium transition-colors
                  ${isSel ? "bg-[#9B8CD5] text-[#0F1115] font-bold" : isToday ? "bg-[#6B5BAE]/40 text-[#C4B5FD]" : "text-white hover:bg-white/10"}`}
              >
                {day}
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex justify-end gap-8">
          <button
            type="button"
            onClick={onClose}
            className="text-[#A89AE0] text-sm font-semibold"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={() => {
              onChange(selected);
              onClose();
            }}
            className="text-[#A89AE0] text-sm font-semibold"
          >
            Ok
          </button>
        </div>
      </div>
    </div>
  );
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  message,
  variant = "delete",
  title,
}) {
  if (!isOpen) return null;

  const isSave = variant === "save";
  const isInfo = variant === "info";
  const isError = variant === "error";
  const accent = isSave
    ? {
        bg: "bg-emerald-500/10",
        text: "text-emerald-400",
        solid: "bg-emerald-500",
      }
    : isInfo
      ? { bg: "bg-[#6B5BAE]/15", text: "text-[#A89BD9]", solid: "bg-[#6B5BAE]" }
      : { bg: "bg-red-500/10", text: "text-red-500", solid: "bg-red-500" };
  const heading =
    title ||
    (isSave
      ? "Сохранение"
      : isInfo
        ? "Внимание"
        : isError
          ? "Ошибка"
          : "Удаление");

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 p-6 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xs rounded-[2.5rem] border border-white/10 bg-[#1E222A] p-8 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${accent.bg} ${accent.text}`}
        >
          {isSave ? (
            <CheckCircle2 size={32} />
          ) : isInfo ? (
            <Info size={32} />
          ) : (
            <AlertTriangle size={32} />
          )}
        </div>
        <h3 className="mb-2 text-lg font-black uppercase text-white">
          {heading}
        </h3>
        <p className="mb-8 whitespace-pre-line text-sm leading-relaxed text-gray-400">
          {message}
        </p>
        <div className="space-y-3">
          {isInfo || isError ? (
            <button
              type="button"
              onClick={onClose}
              className={`w-full rounded-2xl py-4 font-black uppercase tracking-widest text-white transition active:scale-95 ${accent.solid}`}
            >
              ОК
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onConfirm}
                className={`w-full rounded-2xl py-4 font-black uppercase tracking-widest text-white transition active:scale-95 ${accent.solid}`}
              >
                {isSave ? "Сохранить" : "Удалить"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-2xl bg-white/5 py-4 font-black uppercase tracking-widest text-gray-400 transition active:scale-95"
              >
                Отмена
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function NavBtn({ active, icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl p-4 transition-all active:scale-90 ${
        active ? "bg-[#6B5BAE]/20 text-[#6B5BAE]" : "text-gray-500"
      }`}
    >
      {React.cloneElement(icon, { size: 22 })}
    </button>
  );
}

export function AppNav({
  activeTab,
  onDashboard,
  onClients,
  onPrimary,
  onProcedures,
  onStats,
}) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex h-20 items-center justify-around rounded-t-[2rem] border-t border-white/10 bg-[#1E222A]/90 px-2 shadow-2xl backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <NavBtn
        active={activeTab === "dashboard"}
        onClick={onDashboard}
        icon={<LayoutDashboard />}
      />
      <NavBtn
        active={activeTab === "clients"}
        onClick={onClients}
        icon={<Users />}
      />

      <button
        type="button"
        onClick={onPrimary}
        className="-mt-12 flex h-16 w-16 items-center justify-center rounded-full border-8 border-[#0F1115] bg-[#6B5BAE] shadow-xl transition-all active:scale-90"
      >
        <Plus className="h-8 w-8 text-white" />
      </button>

      <NavBtn
        active={activeTab === "procedures"}
        onClick={onProcedures}
        icon={<Scissors />}
      />
      <NavBtn
        active={activeTab === "stats"}
        onClick={onStats}
        icon={<BarChart3 />}
      />
    </nav>
  );
}

export function MonthCalendar({
  monthDate,
  onMonthChange,
  selectedDate,
  onSelectDate,
  markedDates,
  allowClear = false,
  compact = false,
}) {
  const monthDays = useMemo(() => getMonthDays(monthDate), [monthDate]);
  const today = getToday();
  const monthYear = monthDate instanceof Date ? monthDate : new Date(monthDate);
  const monthLabel = `${RU_MONTHS_FULL[monthYear.getMonth()]} ${monthYear.getFullYear()} г.`;

  const cellSize = compact ? "h-8 w-8" : "h-11 w-11";
  const cellText = compact ? "text-xs" : "text-base";
  const emptySize = compact ? "h-8" : "h-11";

  // листание месяца горизонтальным свайпом (как кнопками-стрелками)
  const swipe = useSwipeNavigation({
    onSwipeLeft: () => onMonthChange(1),
    onSwipeRight: () => onMonthChange(-1),
  });

  return (
    <div
      {...swipe}
      className={
        compact
          ? "rounded-2xl bg-[#22202A] p-3"
          : "rounded-[2.5rem] bg-[#22202A] p-5"
      }
    >
      <div className="flex items-center justify-between px-1">
        <div
          className={`font-bold text-white/85 ${compact ? "text-xs" : "text-sm"}`}
        >
          {monthLabel}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMonthChange(-1)}
            className={`flex items-center justify-center rounded-full text-white/85 transition hover:bg-white/5 active:scale-95 ${compact ? "h-7 w-7" : "h-9 w-9"}`}
          >
            <ChevronLeft size={compact ? 14 : 18} />
          </button>
          <button
            type="button"
            onClick={() => onMonthChange(1)}
            className={`flex items-center justify-center rounded-full text-white/85 transition hover:bg-white/5 active:scale-95 ${compact ? "h-7 w-7" : "h-9 w-9"}`}
          >
            <ChevronRight size={compact ? 14 : 18} />
          </button>
        </div>
      </div>

      <div
        className={`grid grid-cols-7 gap-y-0.5 text-center text-xs font-bold text-white/55 ${compact ? "mt-2" : "mt-3"}`}
      >
        {RU_WEEKDAYS.map((day, i) => (
          <div key={i} className={compact ? "py-1" : "py-2"}>
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-0.5 text-center">
        {monthDays.map((dateKey, idx) => {
          if (!dateKey) {
            return <div key={`empty-${idx}`} className={emptySize} />;
          }

          const isSelected = selectedDate === dateKey;
          const isToday = today === dateKey;
          const dayNum = Number(dateKey.slice(-2));
          const markedCats =
            markedDates instanceof Map
              ? MARKED_CATEGORIES.filter((c) =>
                  markedDates.get(dateKey)?.has(c),
                )
              : [];

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() =>
                onSelectDate(allowClear && isSelected ? null : dateKey)
              }
              className={`relative mx-auto flex items-center justify-center rounded-full transition active:scale-95 ${cellSize} ${cellText} ${
                isSelected
                  ? "bg-[#C8B6FF] font-bold text-[#1A1620]"
                  : isToday
                    ? "border border-[#C8B6FF] text-white"
                    : "text-white hover:bg-white/5"
              }`}
            >
              {dayNum}
              {markedCats.length > 0 && (
                <div
                  className={`absolute flex gap-[2px] ${compact ? "bottom-0" : "bottom-0.5"}`}
                >
                  {markedCats.map((cat) => (
                    <span
                      key={cat}
                      className={`rounded-full ${compact ? "h-1 w-1" : "h-1.5 w-1.5"}`}
                      style={{
                        backgroundColor: isSelected
                          ? "#1A1620"
                          : CATEGORY_DOT_COLOR[cat],
                      }}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function SaleCard({ sale, onOpen, customAmount }) {
  const clients = useAppStore(s => s.clients);
  const client = clients.find(c => c.name === sale.clientName);
  const clientNote = client?.notes?.trim();
  const hasClientNote = !!clientNote;

  const amount = customAmount !== undefined ? customAmount : getSaleCardAmount(sale);
  const turnover = getSaleTurnover(sale);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!sale.isDeferred) return;
    
    const updateNow = () => setNow(Date.now());
    const handleVisibility = () => {
      if (document.visibilityState === "visible") updateNow();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    
    let appListener;
    const CapacitorApp = window.Capacitor?.Plugins?.App;
    if (CapacitorApp?.addListener) {
      CapacitorApp.addListener('appStateChange', ({ isActive }) => {
        if (isActive) updateNow();
      }).then(l => { appListener = l; }).catch(() => {});
    }

    const target = getSaleDateTime(sale).getTime();
    if (now >= target) {
      return () => {
        document.removeEventListener("visibilitychange", handleVisibility);
        if (appListener) appListener.remove();
      };
    }

    const delay = target - Date.now();
    let timer;
    if (delay <= 0) {
      updateNow();
    } else {
      timer = setTimeout(updateNow, delay + 100);
    }

    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (appListener) appListener.remove();
    };
  }, [sale, now]);

  const isOverdue = sale.isDeferred && getSaleDateTime(sale).getTime() < now;
  const accentClass = sale.isDeferred
    ? isOverdue ? "border-red-400/20 bg-red-500/10" : "border-sky-400/20 bg-sky-500/10"
    : "border-white/5 bg-[#1E222A]";

  const hasNote = !!sale.notes?.trim();
  const [showNoteTip, setShowNoteTip] = useState(false);
  const longPressTimer = useRef(null);
  const longPressTriggered = useRef(false);

  const startLongPress = (e) => {
    if (!hasNote && !hasClientNote) return;
    longPressTriggered.current = false;
    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      setShowNoteTip(true);
    }, 450);
  };
  const endLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setShowNoteTip(false);
  };
  const handleClick = (e) => {
    if (longPressTriggered.current) {
      e.preventDefault();
      e.stopPropagation();
      longPressTriggered.current = false;
      return;
    }
    onOpen(sale);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onPointerDown={startLongPress}
      onPointerUp={endLongPress}
      onPointerLeave={endLongPress}
      onPointerCancel={endLongPress}
      onContextMenu={(e) => e.preventDefault()}
      className={`relative w-full rounded-[2rem] border px-4 py-2.5 text-left transition-all active:scale-[0.99] ${accentClass}`}
      style={{
        touchAction: "manipulation",
        WebkitUserSelect: "none",
        userSelect: "none",
      }}
    >

      {(hasNote || hasClientNote) && showNoteTip && (
        <div className="pointer-events-none absolute bottom-full left-1/2 z-[500] mb-2 w-[min(28rem,92vw)] -translate-x-1/2">
          <div className="flex flex-col gap-3 rounded-2xl border border-amber-300/40 bg-[#1E222A]/95 px-5 py-4 text-left shadow-2xl backdrop-blur-md note-peek-anim">
            {hasNote && (
              <div>
                <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-300/90">
                  <StickyNote size={12} />
                  Заметка к чеку • {getSaleDisplayName(sale)}
                </div>
                <div className="whitespace-pre-wrap break-words text-[13px] font-medium leading-snug text-white/95">
                  {sale.notes}
                </div>
              </div>
            )}
            {hasNote && hasClientNote && <div className="h-px bg-white/10" />}
            {hasClientNote && (
              <div>
                <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                  <StickyNote size={12} />
                  Заметка к клиенту • {sale.clientName}
                </div>
                <div className="whitespace-pre-wrap break-words text-[13px] font-medium leading-snug text-white/95">
                  {clientNote}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`h-10 w-1.5 rounded-full ${
              sale.category === SALON_SERVICES_CATEGORY
                ? "bg-[#6B5BAE]"
                : sale.category === SALON_PAYROLL_CATEGORY
                  ? "bg-sky-400"
                  : sale.category === HOME_CATEGORY
                    ? "bg-emerald-500"
                    : "bg-amber-500"
            }`}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-sm font-bold leading-tight text-white">
              <span className="truncate">{getSaleDisplayName(sale)}</span>
              {hasNote && <StickyNote size={14} className="shrink-0 text-amber-400" />}
              {hasClientNote && <StickyNote size={14} className="shrink-0 text-emerald-400" />}
            </div>
            <div className="mt-0.5 text-[10px] font-black uppercase tracking-tight leading-tight text-gray-400">
              {formatDate(sale.date)} • {sale.time}
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider leading-tight text-gray-500">
                {sale.category}
              </span>
              {sale.isDeferred && (
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.2em] ${isOverdue ? "bg-red-400/15 text-red-300" : "bg-sky-400/15 text-sky-300"}`}>
                  {isOverdue ? "Просрочен" : "Отсрочен"}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="text-right">
          {turnover > 0 && (
            <div className="font-mono text-[15px] font-black leading-tight text-white/90">
              <Num value={turnover} /> {CURRENCY}
            </div>
          )}
          <div className="font-mono text-[15px] font-black leading-tight text-[#6B5BAE]">
            <Num value={amount} /> {CURRENCY}
          </div>
        </div>
      </div>
    </button>
  );
}

export function SaleDetailsSheet({
  sale,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onRepeat,
  onConduct,
}) {
  if (!sale) return null;

  const items = Array.isArray(sale.items) ? sale.items : [];
  const turnover = getSaleTurnover(sale);
  const accrual = getSaleAccrual(sale);
  const income = getSaleIncome(sale);
  const cleanIncome = getSaleSalonCleanIncome(sale);
  const isSalonServices = sale.category === SALON_SERVICES_CATEGORY;
  const isSalonPayroll = sale.category === SALON_PAYROLL_CATEGORY;
  const payrollType = getPayrollType(sale.payrollType || sale.salonExtraType);
  const summaryAmount = isSalonServices
    ? accrual || cleanIncome
    : isSalonPayroll
      ? cleanIncome
      : income;
      
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!sale.isDeferred) return;

    const updateNow = () => setNow(Date.now());
    const handleVisibility = () => {
      if (document.visibilityState === "visible") updateNow();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    
    let appListener;
    const CapacitorApp = window.Capacitor?.Plugins?.App;
    if (CapacitorApp?.addListener) {
      CapacitorApp.addListener('appStateChange', ({ isActive }) => {
        if (isActive) updateNow();
      }).then(l => { appListener = l; }).catch(() => {});
    }

    const target = getSaleDateTime(sale).getTime();
    if (now >= target) {
      return () => {
        document.removeEventListener("visibilitychange", handleVisibility);
        if (appListener) appListener.remove();
      };
    }

    const delay = target - Date.now();
    let timer;
    if (delay <= 0) {
      updateNow();
    } else {
      timer = setTimeout(updateNow, delay + 100);
    }

    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (appListener) appListener.remove();
    };
  }, [sale, now]);

  const isOverdue = sale.isDeferred && getSaleDateTime(sale).getTime() < now;

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={`Чек: ${getSaleDisplayName(sale)}`}
      layerClass="z-[80]"
    >
      <div className="space-y-4 pb-8">
        <div className="rounded-[2rem] border border-white/5 bg-white/5 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-lg font-black text-white">
                {getSaleDisplayName(sale)}
              </div>
              <div className="mt-1 text-[10px] font-black uppercase tracking-widest text-gray-500">
                {formatDate(sale.date)} • {sale.time}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white/70">
                  {sale.category}
                </span>
                {sale.isDeferred && (
                  <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${isOverdue ? "bg-red-400/15 text-red-300" : "bg-sky-400/15 text-sky-300"}`}>
                    {isOverdue ? "Просрочен" : "Отсроченный платёж"}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              {turnover > 0 && (
                <div className="font-mono text-xs font-black text-white/70">
                  <Num value={turnover} /> {CURRENCY}
                </div>
              )}
              <div className="font-mono text-lg font-black text-[#6B5BAE]">
                <Num value={summaryAmount} /> {CURRENCY}
              </div>
            </div>
          </div>
        </div>

        {sale.isDeferred && (
          <div className={`rounded-[2rem] border p-4 text-sm font-bold ${isOverdue ? "border-red-400/20 bg-red-500/10 text-red-100" : "border-sky-400/20 bg-sky-500/10 text-sky-100"}`}>
            {isOverdue 
              ? "Время начала услуги уже наступило, но чек до сих пор не проведён. Проведите его для учета в доходе." 
              : "Чек сохранён как отсроченный и не участвует в обороте и доходе, пока не будет проведён."}
          </div>
        )}

        <div className="rounded-[2rem] border border-white/5 bg-[#15181E] p-4">
          <div className="mb-3 text-[10px] font-black uppercase tracking-widest text-gray-500">
            Состав чека
          </div>

          {!isSalonServices && !isSalonPayroll && items.length === 0 ? (
            <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3 text-sm font-bold">
              <span className="text-gray-400">Доход</span>
              <span className="font-mono text-[#6B5BAE]">
                <Num value={Number(sale.manualIncome || 0)} /> {CURRENCY}
              </span>
            </div>
          ) : isSalonPayroll ? (
            <div className="flex items-center justify-between rounded-2xl bg-sky-500/10 px-4 py-3 text-sm font-bold">
              <span className="text-sky-200">{payrollType.label}</span>
              <span className="font-mono text-sky-300">
                <Num value={cleanIncome} /> {CURRENCY}
              </span>
            </div>
          ) : isSalonServices && items.length === 0 ? (
            <div className="rounded-2xl bg-white/5 px-4 py-3 text-sm font-bold text-gray-400">
              Без услуг
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div
                  key={item.instanceId || idx}
                  className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold text-white">
                        {item.name}
                      </div>
                      <div className="mt-1 text-[10px] font-black uppercase tracking-widest text-gray-500">
                        База: <Num value={Number(item.price || 0)} />{" "}
                        {CURRENCY}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xs font-black text-white/70">
                        <Num value={Number(
                          item.actualPrice || item.price || 0,
                        )} />{" "}
                        {CURRENCY}
                      </div>
                      <div className="font-mono text-xs font-black text-[#6B5BAE]">
                        <Num value={Number(item.income || 0)} /> {CURRENCY}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {isSalonServices ? (
            <div className="mt-3 flex flex-nowrap items-stretch gap-2">
              <div className="inline-flex flex-col rounded-2xl border border-white/5 bg-black/20 px-3 py-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                  Оборот
                </span>
                <span className="mt-1 whitespace-nowrap font-mono text-base font-black text-white">
                  <Num value={turnover} /> {CURRENCY}
                </span>
              </div>
              <div className="inline-flex flex-col rounded-2xl border border-[#6B5BAE]/20 bg-[#6B5BAE]/10 px-3 py-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#6B5BAE]">
                  Начисление
                </span>
                <span className="mt-1 whitespace-nowrap font-mono text-base font-black text-[#6B5BAE]">
                  <Num value={accrual} /> {CURRENCY}
                </span>
              </div>
              <div className="inline-flex flex-col rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300">
                  Чаевые
                </span>
                <span className="mt-1 whitespace-nowrap font-mono text-base font-black text-emerald-300">
                  <Num value={cleanIncome} /> {CURRENCY}
                </span>
              </div>
            </div>
          ) : isSalonPayroll ? (
            <div className="mt-3 rounded-2xl border border-sky-400/20 bg-sky-500/10 p-4">
              <div className="text-[10px] font-black uppercase tracking-widest text-sky-300">
                Сумма
              </div>
              <div className="mt-2 font-mono text-lg font-black text-sky-300">
                <Num value={cleanIncome} /> {CURRENCY}
              </div>
            </div>
          ) : (
            <div className="mt-3 rounded-2xl border border-[#6B5BAE]/20 bg-[#6B5BAE]/10 p-4">
              <div className="text-[10px] font-black uppercase tracking-widest text-[#6B5BAE]">
                Доход
              </div>
              <div className="mt-2 font-mono text-lg font-black text-[#6B5BAE]">
                <Num value={income} /> {CURRENCY}
              </div>
            </div>
          )}
        </div>

        {sale.notes?.trim() && (
          <div className="rounded-[2rem] border border-white/5 bg-[#15181E] p-4">
            <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
              Заметки
            </div>
            <div className="whitespace-pre-wrap text-sm font-bold leading-relaxed text-white/80">
              {sale.notes}
            </div>
          </div>
        )}

        {sale.isDeferred ? (
          <div className="flex flex-col gap-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onDelete(sale.id)}
                className="rounded-[2rem] bg-red-500 py-3 text-sm font-black uppercase tracking-widest text-white active:scale-95"
              >
                Удалить
              </button>
              <button
                type="button"
                onClick={() => onConduct(sale)}
                className="rounded-[2rem] bg-emerald-500 py-3 text-sm font-black uppercase tracking-widest text-white active:scale-95"
              >
                Оплачено
              </button>
            </div>
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => onEdit(sale)}
                className="w-[calc(50%-0.375rem)] rounded-[2rem] bg-blue-500 py-3 text-sm font-black uppercase tracking-widest text-white active:scale-95"
              >
                Правка
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => onEdit(sale)}
              className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-3 text-[10px] font-black uppercase active:scale-95"
            >
              Правка
            </button>

            <button
              type="button"
              onClick={() => onRepeat(sale)}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[#6B5BAE]/20 bg-[#6B5BAE]/10 py-3 text-[10px] font-black uppercase text-[#6B5BAE] active:scale-95"
            >
              <Copy size={12} /> Копия
            </button>

            <button
              type="button"
              onClick={() => onDelete(sale.id)}
              className="rounded-2xl bg-red-500/10 p-3 text-red-500 active:scale-90"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>
    </BottomSheet>
  );
}

export function InlineDatePickerCard({ label, value, onChange, markedDates }) {
  const [mode, setMode] = useState("calendar");
  const [textValue, setTextValue] = useState(
    isoToDDMMYYYY(value || getToday()),
  );
  const [textError, setTextError] = useState(false);
  const [monthDate, setMonthDate] = useState(
    () => parseDateKey(value || getToday()) || new Date(),
  );
  useEffect(() => {
    const d = parseDateKey(value || getToday());
    if (d) setMonthDate(new Date(d.getFullYear(), d.getMonth(), 1));
  }, [value]);

  const enterText = () => {
    setTextValue(isoToDDMMYYYY(value || getToday()));
    setTextError(false);
    setMode("text");
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between px-2">
        <div>
          {label && (
            <div className="text-sm font-bold text-white/80">{label}</div>
          )}
          <div className="mt-1 text-2xl font-light text-white">
            {value ? formatHeaderDate(value) : "—"}
          </div>
        </div>
        <button
          type="button"
          onClick={() =>
            mode === "calendar" ? enterText() : setMode("calendar")
          }
          aria-label="toggle date input"
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#C8B6FF] hover:bg-white/5"
        >
          {mode === "calendar" ? (
            <svg
              width="18"
              height="18"
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
              width="18"
              height="18"
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
      </div>

      {mode === "calendar" ? (
        <div>
          <MonthCalendar
            monthDate={monthDate}
            onMonthChange={(diff) => setMonthDate((p) => shiftMonth(p, diff))}
            selectedDate={value}
            onSelectDate={(d) => onChange(d || getToday())}
            markedDates={markedDates}
          />
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={() => {
                const t = getToday();
                onChange(t);
                const d = parseDateKey(t);
                if (d) setMonthDate(new Date(d.getFullYear(), d.getMonth(), 1));
              }}
              className="rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#C8B6FF] hover:bg-white/5"
            >
              Сегодня
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-[2.5rem] bg-[#22202A] p-5">
          <div
            className={`relative rounded-md border-2 px-4 pb-3 pt-5 ${textError ? "border-red-400" : "border-[#C8B6FF]"}`}
          >
            <span
              className={`absolute -top-2.5 left-3 bg-[#22202A] px-1 text-xs ${textError ? "text-red-400" : "text-[#C8B6FF]"}`}
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
              value={textValue}
              onChange={(e) => {
                const v = e.target.value;
                setTextValue(v);
                const iso = ddmmyyyyToIso(v);
                if (iso) {
                  setTextError(false);
                  onChange(iso);
                  const [y, m] = iso.split("-").map((n) => parseInt(n, 10));
                  setMonthDate(new Date(y, m - 1, 1));
                } else if (v.trim()) {
                  setTextError(true);
                } else {
                  setTextError(false);
                }
              }}
              className="w-full bg-transparent text-xl font-light text-white outline-none"
              autoFocus
            />
          </div>
          {textError && (
            <div className="mt-2 text-xs text-red-400">
              Неверный формат даты
            </div>
          )}
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              disabled={!ddmmyyyyToIso(textValue)}
              onClick={() => {
                const iso = ddmmyyyyToIso(textValue);
                if (!iso) {
                  setTextError(true);
                  return;
                }
                onChange(iso);
                const [y, m] = iso.split("-").map((n) => parseInt(n, 10));
                setMonthDate(new Date(y, m - 1, 1));
                setMode("calendar");
              }}
              className="rounded-full px-5 py-2 text-sm font-bold uppercase tracking-wider text-[#C8B6FF] hover:bg-white/5 disabled:opacity-40"
            >
              Ок
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
