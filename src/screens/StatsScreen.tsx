import React from 'react';
import { useAppUI } from '../context/AppUIContext';
import { Search, BarChart3, ChevronRight, ChevronLeft, Calendar as CalendarIcon, Check } from 'lucide-react';
import { InlineDatePickerCard } from '../components/ui-core';
import { AutoFitText } from '../components/AutoFitText';
import { CURRENCY, CATEGORIES, getToday, isoToDDMMYYYY, formatMonthLabel } from '../lib/app-core';

export function StatsScreen() {
  const {

    showStatsClientSuggestions,
    setShowStatsClientSuggestions,
    setStatsClient,
    selectedCategories,
    setSelectedCategories,
    toggleCategory,
    statsPeriod,
    setStatsPeriod,
    statsClient,
    statsClientSearch,
    setStatsClientSearch,
    statsDay,
    setStatsDay,
    statsDayMonth,
    setStatsDayMonth,
    statsFilteredSales,
    calculateStats,
    statsPeriodLabel,
    handleSelectStatsClient,
    statsClientWrapRef,
    openStatsBreakdown,
    setIsStatsChartOpen,
    filteredStatsClients,
    handleNextFocus,
    periodStats,
    customRange,
    setCustomRange,
    customRangeEditing,
    setCustomRangeEditing,
    statsCalendarMarkedDates
  } = useAppUI();

  return (
    <>
      <div className="space-y-4 px-2">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black uppercase">Статистика</h2>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsStatsChartOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#6B5BAE]/30 bg-[#6B5BAE]/15 text-[#C4B5FD] transition hover:bg-[#6B5BAE]/25 active:scale-95"
            aria-label="Диаграмма"
          >
            <BarChart3 size={20} />
          </button>
        </div>
      </div>
          <div className="space-y-1.5">
            <p className="px-1 text-[9px] font-black uppercase tracking-widest text-gray-500">
              Фильтр клиента
            </p>

            <div className="space-y-2">
              <div className="relative" ref={statsClientWrapRef}>
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
                  enterKeyHint="done"
                  spellCheck={false}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 py-2.5 pl-11 pr-3 text-xs font-bold outline-none"
                  placeholder="Все клиенты"
                  value={statsClientSearch}
                  onFocus={() => {
                    setShowStatsClientSuggestions(true);
                    if (statsClientSearch) {
                      setStatsClientSearch("");
                      setStatsClient("all");
                    }
                  }}
                  onBlur={() => setShowStatsClientSuggestions(false)}
                  onKeyDown={(e) => handleNextFocus(e, null)}
                  onChange={(e) => {
                    const value = e.target.value;
                    setStatsClientSearch(value);
                    if (!value.trim()) {
                      setStatsClient("all");
                    }
                  }}
                />
                {showStatsClientSuggestions && (
                  <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 max-h-72 overflow-y-auto rounded-2xl border border-white/10 bg-[#15181E] shadow-2xl">
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelectStatsClient("all")}
                      className={`flex w-full items-center justify-between border-b border-white/5 px-4 py-3 text-left text-xs font-bold uppercase tracking-widest last:border-0 ${
                        statsClient === "all"
                          ? "bg-[#6B5BAE]/15 text-[#6B5BAE]"
                          : "text-white/70"
                      }`}
                    >
                      <span>Все клиенты</span>
                      {statsClient === "all" && <span>Выбрано</span>}
                    </button>

                    {filteredStatsClients.map((client: any) => (
                      <button
                        key={client.id}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelectStatsClient(client.name)}
                        className={`flex w-full items-center justify-between border-b border-white/5 px-4 py-3 text-left text-sm font-bold last:border-0 ${
                          statsClient === client.name
                            ? "bg-[#6B5BAE]/15 text-white"
                            : "text-white/80 active:bg-white/5"
                        }`}
                      >
                        <span>{client.name}</span>
                        {statsClient === client.name && (
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#6B5BAE]">
                            Выбран
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">
                Категории дохода
              </p>
              <button
                type="button"
                onClick={() =>
                  setSelectedCategories(
                    selectedCategories.length === CATEGORIES.length
                      ? []
                      : [...CATEGORIES],
                  )
                }
                className={`rounded-lg px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider transition-all ${
                  selectedCategories.length === CATEGORIES.length
                    ? "bg-[#6B5BAE]/30 text-[#A89AE0]"
                    : "bg-white/5 text-gray-500"
                }`}
              >
                Все
              </button>
            </div>

            <div
              className="grid gap-2"
              style={{
                gridTemplateColumns: `repeat(${CATEGORIES.length}, 1fr)`,
              }}
            >
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className={`rounded-xl py-3 text-[10px] font-bold uppercase leading-tight transition-all ${
                    selectedCategories.includes(category)
                      ? "bg-[#6B5BAE] text-white"
                      : "bg-[#6B5BAE]/20 text-gray-400"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="px-1 text-[9px] font-black uppercase tracking-widest text-gray-500">
              Период
            </p>

            <div className="flex gap-0.5 rounded-2xl bg-white/5 p-0.5">
              {[
                { id: "day", label: "День" },
                { id: "month", label: "Месяц" },
                { id: "year", label: "Год" },
                { id: "custom", label: "Свой" },
              ].map((period) => (
                <button
                  key={period.id}
                  type="button"
                  onClick={() => setStatsPeriod(period.id)}
                  className={`flex-1 rounded-xl py-3 text-[10px] font-bold uppercase transition-all ${
                    statsPeriod === period.id
                      ? "bg-[#6B5BAE] text-white"
                      : "text-gray-500"
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          {statsPeriod === "month" && (
            <div className="flex items-center justify-between rounded-[2rem] border border-[#6B5BAE]/20 bg-[#6B5BAE]/10 py-1 px-4 mt-1">
              <button onClick={() => {
                const d = new Date(statsDayMonth);
                d.setMonth(d.getMonth() - 1);
                setStatsDayMonth(d);
              }} className="p-1 active:scale-95 text-[#6B5BAE] transition">
                <ChevronLeft size={20} />
              </button>
              <div className="text-xs font-black uppercase tracking-widest text-[#6B5BAE]">
                {formatMonthLabel(statsDayMonth).replace(' г.', '')}
              </div>
              <button onClick={() => {
                const d = new Date(statsDayMonth);
                d.setMonth(d.getMonth() + 1);
                setStatsDayMonth(d);
              }} className="p-1 active:scale-95 text-[#6B5BAE] transition">
                <ChevronRight size={20} />
              </button>
            </div>
          )}

          {statsPeriod === "year" && (
            <div className="flex items-center justify-between rounded-[2rem] border border-[#6B5BAE]/20 bg-[#6B5BAE]/10 py-1 px-4 mt-1">
              <button onClick={() => {
                const d = new Date(statsDayMonth);
                d.setFullYear(d.getFullYear() - 1);
                setStatsDayMonth(d);
              }} className="p-1 active:scale-95 text-[#6B5BAE] transition">
                <ChevronLeft size={20} />
              </button>
              <div className="text-xs font-black uppercase tracking-widest text-[#6B5BAE]">
                {statsDayMonth.getFullYear()}
              </div>
              <button onClick={() => {
                const d = new Date(statsDayMonth);
                d.setFullYear(d.getFullYear() + 1);
                setStatsDayMonth(d);
              }} className="p-1 active:scale-95 text-[#6B5BAE] transition">
                <ChevronRight size={20} />
              </button>
            </div>
          )}

          {statsPeriod === "day" && (
            <InlineDatePickerCard
              label="День"
              value={statsDay}
              onChange={(d: any) => setStatsDay(d || getToday())}
              markedDates={statsCalendarMarkedDates}
            />
          )}

          {statsPeriod === "custom" && (
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setCustomRangeEditing("start")}
                className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-left text-xs font-bold outline-none active:scale-[0.99]"
              >
                {isoToDDMMYYYY(customRange.start)}
              </button>
              <button
                type="button"
                onClick={() => setCustomRangeEditing("end")}
                className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-left text-xs font-bold outline-none active:scale-[0.99]"
              >
                {isoToDDMMYYYY(customRange.end)}
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => openStatsBreakdown("turnover")}
              className="flex flex-col justify-evenly rounded-[2.5rem] border border-white/5 bg-[#1E222A] py-3 px-2 text-left active:scale-[0.99] min-h-[220px]"
            >
              <div className="text-center w-full">
                <p className="text-xs leading-tight font-black uppercase text-gray-500">
                  Салон оборот
                </p>
                <p className="text-[15px] leading-tight font-bold text-gray-600 mt-1">
                  чеков {periodStats.salonCount || 0} шт
                </p>
              </div>
              
              <AutoFitText
                text={(periodStats.turnover || 0).toLocaleString()}
                baseFontSize={35}
                minFontSize={14}
                className="text-center font-mono leading-none font-black tracking-tight w-full pb-1 pt-1"
              />

              <div className="border-t border-white/5 pt-2 text-center w-full">
                <div className="text-xs leading-tight font-black uppercase tracking-widest text-gray-500">
                  Начисление
                </div>
                <AutoFitText
                  text={(periodStats.accrual || 0).toLocaleString()}
                  baseFontSize={35}
                  minFontSize={14}
                  className="font-mono leading-none font-black text-[#6B5BAE] tracking-tight mt-1 w-full text-center"
                />
              </div>
            </button>

            <button
              type="button"
              onClick={() => openStatsBreakdown("income")}
              className="flex flex-col rounded-[2.5rem] border border-[#6B5BAE]/20 bg-[#6B5BAE]/10 py-3 px-3 text-left active:scale-[0.99] min-h-[220px]"
            >
              <div className="w-full text-center pb-2">
                <p className="text-xs leading-tight font-black uppercase text-[#6B5BAE]">
                  Итого Доход
                </p>
              </div>
              <AutoFitText
                text={(periodStats.income || 0).toLocaleString()}
                baseFontSize={32}
                minFontSize={14}
                className="w-full text-center font-mono leading-none font-black text-[#6B5BAE] pb-2"
              />
              <div className="flex flex-col flex-1 justify-evenly w-full border-t border-[#6B5BAE]/20 pt-2">
                <div className="flex items-center justify-between gap-1 font-bold uppercase tracking-wider">
                  <span className="shrink-0 text-[10.5px] text-emerald-400">Домашние</span>
                  <AutoFitText
                    text={(periodStats.homeIncome || 0).toLocaleString()}
                    baseFontSize={16}
                    minFontSize={9}
                    className="min-w-0 flex-1 text-right font-mono leading-none text-white/85"
                  />
                </div>
                <div className="flex items-center justify-between gap-1 font-bold uppercase tracking-wider">
                  <span className="shrink-0 text-[10.5px] text-sky-400">Салон зп</span>
                  <AutoFitText
                    text={(periodStats.salonCleanIncome || 0).toLocaleString()}
                    baseFontSize={16}
                    minFontSize={9}
                    className="min-w-0 flex-1 text-right font-mono leading-none text-white/85"
                  />
                </div>
                <div className="flex items-center justify-between gap-1 font-bold uppercase tracking-wider">
                  <span className="shrink-0 text-[10.5px] text-pink-400">Чаевые</span>
                  <AutoFitText
                    text={(periodStats.tipsAmount || 0).toLocaleString()}
                    baseFontSize={16}
                    minFontSize={9}
                    className="min-w-0 flex-1 text-right font-mono leading-none text-white/85"
                  />
                </div>
                <div className="flex items-center justify-between gap-1 font-bold uppercase tracking-wider">
                  <span className="shrink-0 text-[10.5px] text-amber-400">Калым</span>
                  <AutoFitText
                    text={(periodStats.kalymIncome || 0).toLocaleString()}
                    baseFontSize={16}
                    minFontSize={9}
                    className="min-w-0 flex-1 text-right font-mono leading-none text-white/85"
                  />
                </div>
              </div>
            </button>
          </div>
        </div>
    </>
  );
}
