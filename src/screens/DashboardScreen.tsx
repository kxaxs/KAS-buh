// @ts-nocheck
import React from 'react';
import { useAppStore } from '../store';
import { AppUIContext } from '../context/AppUIContext';
import { 
  getToday, padNumber, toDateKey, parseDateKey, getCurrentTime, getExportFileName, formatDate, 
  formatLongDate, formatMonthLabel, shiftMonth, getMonthDays, getSaleDateTime, 
  sortSalesByDateTimeDesc, getPeriodRangeLabel, inferRegisteredAt, normalizeSaleCategory, 
  getPayrollType, normalizeSales, getSaleDisplayName, normalizeClients, normalizeProcedures, 
  getInitialSaleState, getSaleTurnover, getSaleAccrual, getSaleSalonCleanIncome, 
  getSaleIncome, getSaleAnalyticsIncome, getSaleCardAmount, formatHeaderDate, isoToDDMMYYYY, 
  ddmmyyyyToIso, CATEGORIES, APP_ID, SALON_SERVICES_CATEGORY, SALON_PAYROLL_CATEGORY, STORAGE_KEYS, CURRENCY, formatNumber
} from '../lib/app-core';
import { calculateStats } from '../lib/stats';
import { 
  Users, UserPlus, FileDown, Search, ArrowRight, UserCheck, Phone, Check, EyeOff, AlertTriangle, MessageCircle, MapPin, Trash2, X, Plus, Calendar, Clock, DollarSign, Activity, Settings, Zap, ArrowLeft, ArrowDown, LogOut, ChevronRight, TrendingUp, Star, Gift, ChevronDown, PlusCircle, Bell, StickyNote, CalendarClock, ArrowDownAZ, Pin, Edit2, BarChart3, Receipt, Wallet, CalendarDays, History, Smartphone, Calculator, ShieldCheck, Mail, Send, Filter, Info, Copy, Share2, LayoutDashboard, PieChart, Scissors, CloudDownload, CloudUpload, ChevronUp, CheckCircle2 
} from 'lucide-react';
import { SaleCard } from '../components/ui-core';

export function DashboardScreen() {
  const ui = React.useContext(AppUIContext);
  const { isModalOpen, setIsModalOpen, isClientModalOpen, setIsClientModalOpen, isProcModalOpen, setIsProcModalOpen, isStatsOpen, setIsStatsOpen, isStatsChartOpen, setIsStatsChartOpen, reportRange, setReportRange, reportRangeEditing, setReportRangeEditing, reportClients, setReportClients, reportClientSearch, setReportClientSearch, reportCategories, setReportCategories, reportServices, setReportServices, reportServiceSearch, setReportServiceSearch, reportShowFilters, setReportShowFilters, reportFilterPanel, setReportFilterPanel, reportChartType, setReportChartType, reportGroupBy, setReportGroupBy, reportDrillItem, setReportDrillItem, reportDrillSort, setReportDrillSort, isStatsBreakdownOpen, setIsStatsBreakdownOpen, isTimePickerOpen, setIsTimePickerOpen, isDatePickerOpen, setIsDatePickerOpen, calendarScreenMode, setCalendarScreenMode, calendarScreenTextValue, setCalendarScreenTextValue, calendarScreenTextError, setCalendarScreenTextError, statsBreakdownType, setStatsBreakdownType, isClientHistoryOpen, setIsClientHistoryOpen, isCalendarScreenOpen, setIsCalendarScreenOpen, showClientSuggestions, setShowClientSuggestions, backHint, setBackHint, showScrollTop, setShowScrollTop, selectedSale, setSelectedSale, saleDetailsId, setSaleDetailsId, selectedClient, setSelectedClient, selectedCategories, setSelectedCategories, searchQuery, setSearchQuery, statsPeriod, setStatsPeriod, statsClient, setStatsClient, statsClientSearch, setStatsClientSearch, statsDay, setStatsDay, statsDayMonth, setStatsDayMonth, calendarScreenMonth, setCalendarScreenMonth, customRangeEditing, setCustomRangeEditing, customRange, setCustomRange, editingProc, setEditingProc, editingClient, setEditingClient, procSearch, setProcSearch, isNotifMenuOpen, setIsNotifMenuOpen, dashPeriodEnabled, setDashPeriodEnabled, dashPeriod, setDashPeriod, isDashPeriodMenuOpen, setIsDashPeriodMenuOpen, recentProcIds, setRecentProcIds, procedureListSearch, setProcedureListSearch, clientListSearch, setClientListSearch, clientSortMode, setClientSortMode, clientPinNotes, setClientPinNotes, salesPinNotes, setSalesPinNotes, notifEnabled, setNotifEnabled, notifMinutes, setNotifMinutes, notifPendingId, setNotifPendingId, prevFiredSaleId, setPrevFiredSaleId, newClientName, setNewClientName, newClientNotes, setNewClientNotes, isCalendarOpen, setIsCalendarOpen, newSale, setNewSale, manualService, setManualService, confirmData, setConfirmData, fileInputRef, saleClientWrapRef, statsClientWrapRef, reportFilterWrapRef, saleClientRef, saleDateRef, saleTimeRef, manualNameRef, manualPriceRef, manualIncomeRef, manualSaleIncomeRef, clientInputRef, clientDateRef, procNameRef, procPriceRef, procIncomeRef, backHandlerRef, lastBackAtRef, backHintTimerRef, lastLayerCloseAtRef, lastPopstateAtRef, closeTopLayerForBack, handleBackNavigation, handleOutside, handlePopState, handleScroll, filteredSales, filteredClients, clientSuggestions, filteredProcedures, filteredStatsClients, selectedClientSales, calculateStats, dashboardMonthSales, dashboardStats, statsFilteredSales, periodStats, reportFilteredSales, reportServiceStats, getReportSaleAmount, reportChartData, reportPeriodLabel, exportReportCsv, escape, triggerDownload, reportDrillSales, statsPeriodLabel, statsBreakdownSales, statsCalendarMarkedDates, saleDetails, calendarMarkedDates, calendarScreenSales, resetSaleForm, resetClientForm, toggleCategory, handleNextFocus, isSaleFormValid, requestSaveSale, handleSaleEnterKey, handleSelectClient, handleClientNameChange, openNewClientModal, openEditClientModal, openClientHistory, openSaleDetails, openStatsBreakdown, handleSelectStatsClient, handleSelectPayrollType, openEditSale, repeatSale, requestDeleteSale, conductSale, openCalendarScreen, handleDashboardNav, SWIPE_TABS, swipeStartRef, tabDirection, setTabDirection, goToTab, handleMainTouchStart, handleMainTouchEnd, handleClientsNav, handleProceduresNav, handleStatsNav, handleStatsClose, handlePrimaryAction, handleSaveClient, saveSale, handleAddManualService, updateItemActualPrice, handleExport, handleImport, handleSaveProcedure, commit, openNewSaleModal, openNewProcedureModal, isPayrollSale, isSalonServicesSale, selectedPayrollType } = ui;

  const sales = useAppStore(s => s.sales);
  const activeTab = useAppStore(s => s.activeTab);
  const setClients = useAppStore(s => s.setClients);
  const setSales = useAppStore(s => s.setSales);
  const setProcedures = useAppStore(s => s.setProcedures);

  // Сводка за день: под списком чеков при фильтре «Сегодня».
  // Только пункты с ненулевыми суммами, без заголовка и итогов, блок 1/2 ширины справа.
  const dayStats = React.useMemo(() => calculateStats(filteredSales), [filteredSales]);
  const daySummaryRows = [
    { label: "Оборот", value: dayStats.turnover, color: "#6B5BAE" },
    { label: "Начисление", value: dayStats.accrual, color: "#A89AE0" },
    { label: "Домашние", value: dayStats.homeIncome, color: "#10B981" },
    { label: "Калым", value: dayStats.kalymIncome, color: "#F59E0B" },
    { label: "Чаевые", value: dayStats.tipsAmount, color: "#EC4899" },
    { label: "Салон зп", value: dayStats.salonCleanIncome, color: "#38BDF8" },
  ].filter((row) => row.value > 0);
  const showDaySummary =
    dashPeriodEnabled && dashPeriod === "today" && daySummaryRows.length > 0;

  return (
    <>
            <div className="space-y-6">
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  size={18}
                />
                <input
                  data-form-type="other"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="sentences"
                  spellCheck={false}
                  placeholder="Поиск по чекам..."
                  className="w-full rounded-2xl border border-white/5 bg-[#1E222A] py-2.5 pl-11 pr-3 text-sm font-bold outline-none focus:border-[#6B5BAE]/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={(e) => {
                    setSearchQuery('');
                    setTimeout(() => {
                      const target = e.target;
                      if (target) {
                        const rect = target.getBoundingClientRect();
                        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                        window.scrollTo({
                          top: rect.top + scrollTop - 2,
                          behavior: 'smooth'
                        });
                      }
                    }, 100);
                  }}
                  onKeyDown={(e) => handleNextFocus(e, null)}
                  enterKeyHint="done"
                />
              </div>

              <button
                type="button"
                onClick={openCalendarScreen}
                className="flex w-full items-center justify-between rounded-[2rem] border border-[#6B5BAE]/20 bg-[#6B5BAE]/10 px-4 py-2.5 text-left transition active:scale-[0.99]"
              >
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.25em] text-[#6B5BAE]">
                    Календарь чеков
                  </div>
                  <div className="mt-1 text-sm font-bold text-white">
                    {formatLongDate(getToday())}
                  </div>
                </div>
                <Calendar size={20} className="text-[#6B5BAE]" />
              </button>

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

              <div className="pt-2">
                <div className="mb-4 flex items-center justify-between px-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest opacity-50">
                    Чеки {filteredSales.length} шт.
                  </h3>
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          if (isNotifMenuOpen) {
                            setIsNotifMenuOpen(false);
                          } else {
                            if (!notifEnabled && notifMinutes <= 0) {
                              setNotifMinutes(15);
                              setNotifEnabled(true);
                            } else {
                              setNotifEnabled(!notifEnabled);
                            }
                          }
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setIsNotifMenuOpen(!isNotifMenuOpen);
                        }}
                        className={`flex h-6 px-2 items-center justify-center gap-1.5 rounded-lg transition-all active:scale-95 ${
                          notifEnabled ? "bg-sky-500/20 text-sky-300" : "bg-white/5 text-gray-500"
                        }`}
                        title={notifEnabled ? `Напоминание: ${notifMinutes} мин` : "Напоминания выключены"}
                      >
                        <Bell size={13} strokeWidth={notifEnabled ? 2.5 : 2} />
                        <span className={`text-[10px] font-bold ${notifEnabled ? "" : "opacity-70"}`}>
                          {notifMinutes > 0 ? `${notifMinutes} мин` : "Выкл"}
                        </span>
                      </button>
                      {isNotifMenuOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setIsNotifMenuOpen(false)} />
                          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 flex w-max flex-row gap-1 rounded-xl border border-white/10 bg-[#1E222A] p-1.5 shadow-xl">
                            {[1, 5, 15].map((mins) => (
                              <button
                                key={mins}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setNotifMinutes((prev) => prev + mins);
                                  setNotifEnabled(true);
                                }}
                                className="flex items-center justify-center rounded bg-white/5 px-2.5 py-1.5 text-[10px] font-bold text-sky-300 transition-all active:bg-white/10"
                              >
                                +{mins}м
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setNotifMinutes(0);
                                setNotifEnabled(false);
                              }}
                              className="rounded bg-red-500/10 px-2.5 py-1.5 text-[10px] font-bold text-red-400 transition-all active:bg-red-500/20"
                            >
                              Сброс
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          if (isDashPeriodMenuOpen) {
                            setIsDashPeriodMenuOpen(false);
                          } else {
                            if (!dashPeriodEnabled) {
                              setDashPeriod("today");
                              setDashPeriodEnabled(true);
                            } else {
                              setDashPeriodEnabled(false);
                            }
                          }
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setIsDashPeriodMenuOpen(!isDashPeriodMenuOpen);
                        }}
                        className={`flex h-6 w-[56px] items-center justify-center gap-1.5 rounded-lg transition-all active:scale-95 ${
                          dashPeriodEnabled ? "bg-sky-500/20 text-sky-300" : "bg-white/5 text-gray-500"
                        }`}
                        title={dashPeriodEnabled ? (dashPeriod === "today" ? "Сегодня" : dashPeriod === "month" ? "Месяц" : "Год") : "Фильтр по периодам"}
                      >
                        <span className="text-[10px] font-bold">
                          {dashPeriodEnabled ? (dashPeriod === "today" ? "Сегодня" : dashPeriod === "month" ? "Месяц" : "Год") : "Все"}
                        </span>
                      </button>
                      {isDashPeriodMenuOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setIsDashPeriodMenuOpen(false)} />
                          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 flex w-max flex-col gap-1 rounded-xl border border-white/10 bg-[#1E222A] p-1.5 shadow-xl">
                            {[{ id: "today", label: "Сегодня" }, { id: "month", label: "Месяц" }, { id: "year", label: "Год" }].map((p) => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDashPeriod(p.id);
                                  setDashPeriodEnabled(true);
                                  setIsDashPeriodMenuOpen(false);
                                }}
                                className={`rounded px-4 py-2 text-xs font-bold transition-all active:bg-white/10 ${dashPeriod === p.id && dashPeriodEnabled ? "bg-sky-500/20 text-sky-300" : "bg-white/5 text-gray-400 hover:text-white"}`}
                              >
                                {p.label}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSalesPinNotes((prev) => !prev)}
                      aria-label="С заметками — наверх"
                      title="С заметками — наверх"
                      className={`flex h-6 w-6 items-center justify-center rounded-lg transition-all active:scale-95 ${
                        salesPinNotes
                          ? "bg-amber-400/20 text-amber-300"
                          : "bg-white/5 text-gray-500"
                      }`}
                    >
                      <StickyNote size={13} strokeWidth={2.25} />
                    </button>
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
                </div>

                <div className="space-y-[3px]">
                  {filteredSales.length === 0 ? (
                    <div className="rounded-[3rem] bg-white/5 p-12 text-center text-xs italic opacity-30">
                      Ничего не найдено
                    </div>
                  ) : (
                    filteredSales.map((sale) => (
                      <SaleCard
                        key={sale.id}
                        sale={sale}
                        onOpen={openSaleDetails}
                      />
                    ))
                  )}
                </div>

                {showDaySummary && (
                  <div className="mt-3 ml-auto w-1/2 rounded-2xl border border-white/5 bg-[#1E222A] px-3 py-3">
                    <div className="flex flex-col gap-2">
                      {daySummaryRows.map((row) => (
                        <div key={row.label} className="flex items-center justify-between gap-2">
                          <span
                            className="shrink-0 text-[11px] font-bold uppercase tracking-wider"
                            style={{ color: row.color }}
                          >
                            {row.label}
                          </span>
                          <span className="whitespace-nowrap text-right font-mono text-sm font-black leading-none text-white/90">
                            {formatNumber(row.value)}
                            {"\u00A0"}
                            {CURRENCY}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
    </>

  );
}
