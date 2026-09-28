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
  ddmmyyyyToIso, CATEGORIES, APP_ID, SALON_SERVICES_CATEGORY, SALON_PAYROLL_CATEGORY, STORAGE_KEYS, CURRENCY
} from '../lib/app-core';
import { 
  Users, UserPlus, FileDown, Search, ArrowRight, UserCheck, Phone, Check, EyeOff, AlertTriangle, MessageCircle, MapPin, Trash2, X, Plus, Calendar, Clock, DollarSign, Activity, Settings, Zap, ArrowLeft, ArrowDown, LogOut, ChevronRight, TrendingUp, Star, Gift, ChevronDown, PlusCircle, Bell, StickyNote, CalendarClock, ArrowDownAZ, Pin, Edit2, BarChart3, Receipt, Wallet, CalendarDays, History, Smartphone, Calculator, ShieldCheck, Mail, Send, Filter, Info, Copy, Share2, LayoutDashboard, PieChart, Scissors, CloudDownload, CloudUpload, ChevronUp, CheckCircle2 
} from 'lucide-react';
import { SaleCard } from '../components/ui-core';

export function ProceduresScreen() {
  const ui = React.useContext(AppUIContext);
  const { isModalOpen, setIsModalOpen, isClientModalOpen, setIsClientModalOpen, isProcModalOpen, setIsProcModalOpen, isStatsOpen, setIsStatsOpen, isStatsChartOpen, setIsStatsChartOpen, reportRange, setReportRange, reportRangeEditing, setReportRangeEditing, reportClients, setReportClients, reportClientSearch, setReportClientSearch, reportCategories, setReportCategories, reportServices, setReportServices, reportServiceSearch, setReportServiceSearch, reportShowFilters, setReportShowFilters, reportFilterPanel, setReportFilterPanel, reportChartType, setReportChartType, reportGroupBy, setReportGroupBy, reportDrillItem, setReportDrillItem, reportDrillSort, setReportDrillSort, isStatsBreakdownOpen, setIsStatsBreakdownOpen, isTimePickerOpen, setIsTimePickerOpen, isDatePickerOpen, setIsDatePickerOpen, calendarScreenMode, setCalendarScreenMode, calendarScreenTextValue, setCalendarScreenTextValue, calendarScreenTextError, setCalendarScreenTextError, statsBreakdownType, setStatsBreakdownType, isClientHistoryOpen, setIsClientHistoryOpen, isCalendarScreenOpen, setIsCalendarScreenOpen, showClientSuggestions, setShowClientSuggestions, backHint, setBackHint, showScrollTop, setShowScrollTop, selectedSale, setSelectedSale, saleDetailsId, setSaleDetailsId, selectedClient, setSelectedClient, selectedCategories, setSelectedCategories, searchQuery, setSearchQuery, statsPeriod, setStatsPeriod, statsClient, setStatsClient, statsClientSearch, setStatsClientSearch, statsDay, setStatsDay, statsDayMonth, setStatsDayMonth, calendarScreenMonth, setCalendarScreenMonth, customRangeEditing, setCustomRangeEditing, customRange, setCustomRange, editingProc, setEditingProc, editingClient, setEditingClient, procSearch, setProcSearch, isNotifMenuOpen, setIsNotifMenuOpen, recentProcIds, setRecentProcIds, procedureListSearch, setProcedureListSearch, clientListSearch, setClientListSearch, clientSortMode, setClientSortMode, procSortMode, setProcSortMode, clientPinNotes, setClientPinNotes, salesPinNotes, setSalesPinNotes, notifEnabled, setNotifEnabled, notifMinutes, setNotifMinutes, notifPendingId, setNotifPendingId, prevFiredSaleId, setPrevFiredSaleId, newClientName, setNewClientName, newClientNotes, setNewClientNotes, isCalendarOpen, setIsCalendarOpen, newSale, setNewSale, manualService, setManualService, confirmData, setConfirmData, fileInputRef, saleClientWrapRef, statsClientWrapRef, reportFilterWrapRef, saleClientRef, saleDateRef, saleTimeRef, manualNameRef, manualPriceRef, manualIncomeRef, manualSaleIncomeRef, clientInputRef, clientDateRef, procNameRef, procPriceRef, procIncomeRef, backHandlerRef, lastBackAtRef, backHintTimerRef, lastLayerCloseAtRef, lastPopstateAtRef, closeTopLayerForBack, handleBackNavigation, handleOutside, handlePopState, handleScroll, filteredSales, filteredClients, clientSuggestions, filteredProcedures, filteredStatsClients, selectedClientSales, calculateStats, dashboardMonthSales, dashboardStats, statsFilteredSales, periodStats, reportFilteredSales, reportServiceStats, getReportSaleAmount, reportChartData, reportPeriodLabel, exportReportCsv, escape, triggerDownload, reportDrillSales, statsPeriodLabel, statsBreakdownSales, statsCalendarMarkedDates, saleDetails, calendarMarkedDates, calendarScreenSales, resetSaleForm, resetClientForm, toggleCategory, handleNextFocus, isSaleFormValid, requestSaveSale, handleSaleEnterKey, handleSelectClient, handleClientNameChange, openNewClientModal, openEditClientModal, openClientHistory, openSaleDetails, openStatsBreakdown, handleSelectStatsClient, handleSelectPayrollType, openEditSale, repeatSale, requestDeleteSale, conductSale, openCalendarScreen, handleDashboardNav, SWIPE_TABS, swipeStartRef, tabDirection, setTabDirection, goToTab, handleMainTouchStart, handleMainTouchEnd, handleClientsNav, handleProceduresNav, handleStatsNav, handleStatsClose, handlePrimaryAction, handleSaveClient, saveSale, handleAddManualService, updateItemActualPrice, handleExport, handleImport, handleSaveProcedure, commit, openNewSaleModal, openNewProcedureModal, isPayrollSale, isSalonServicesSale, selectedPayrollType } = ui;

  const sales = useAppStore(s => s.sales);
  const procedures = useAppStore(s => s.procedures);
  const clients = useAppStore(s => s.clients);
  const activeTab = useAppStore(s => s.activeTab);
  const setClients = useAppStore(s => s.setClients);
  const setSales = useAppStore(s => s.setSales);
  const setProcedures = useAppStore(s => s.setProcedures);

  return (
    <>
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-black uppercase">База услуг</h2>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setProcSortMode((prev) =>
                        prev === "name" ? "time" : "name",
                      )
                    }
                    aria-label="Сортировка"
                    title={
                      procSortMode === "name"
                        ? "По алфавиту"
                        : "По дате добавления"
                    }
                    className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all active:scale-95 ${
                      procSortMode === "name"
                        ? "border-[#6B5BAE]/30 bg-[#6B5BAE]/20 text-[#A89AE0]"
                        : "border-sky-500/30 bg-sky-500/20 text-sky-300"
                    }`}
                  >
                    {procSortMode === "name" ? (
                      <ArrowDownAZ size={20} />
                    ) : (
                      <CalendarClock size={20} />
                    )}
                  </button>
                </div>
              </div>

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
                  placeholder="Поиск услуги..."
                  className="w-full rounded-2xl border border-white/5 bg-[#1E222A] py-2.5 pl-11 pr-3 text-sm font-bold outline-none focus:border-[#6B5BAE]/50"
                  value={procedureListSearch}
                  onChange={(e) => setProcedureListSearch(e.target.value)}
                  onKeyDown={(e) => handleNextFocus(e, null)}
                  enterKeyHint="done"
                />
              </div>

              <div className="space-y-[2px]">
              {filteredProcedures.length === 0 ? (
                <div className="rounded-[3rem] bg-white/5 p-12 text-center text-xs italic opacity-30">
                  Услуги не найдены
                </div>
              ) : (
                filteredProcedures.map((procedure) => {
                  const wasEdited =
                    procedure.updatedAt &&
                    procedure.updatedAt !== procedure.createdAt;
                  return (
                    <div
                      key={procedure.id}
                      className="flex items-center justify-between gap-2 rounded-[2rem] border border-white/5 bg-[#1E222A] px-3 py-2"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-bold leading-tight">
                          {procedure.name}
                        </div>
                        <div className="text-[10px] font-bold uppercase leading-tight text-gray-500">
                          Цена: {procedure.price} {CURRENCY} | Начисление:{" "}
                          {procedure.income} {CURRENCY}
                        </div>
                        {(procedure.createdAt || procedure.updatedAt) && (
                          <div className="mt-0.5 flex items-center gap-1 text-[9px] font-bold uppercase leading-tight tracking-wider text-gray-600">
                            {wasEdited ? (
                              <Edit2 size={9} />
                            ) : (
                              <Plus size={10} />
                            )}
                            {wasEdited ? "Правка" : "Добавлено"}:{" "}
                            {formatDate(
                              procedure.updatedAt || procedure.createdAt,
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProc({ ...procedure });
                            setIsProcModalOpen(true);
                          }}
                          className="p-2 text-gray-400"
                        >
                          <Edit2 size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setConfirmData({
                              isOpen: true,
                              message: `Удалить "${procedure.name}"?`,
                              onConfirm: () =>
                                setProcedures((prev) =>
                                  prev.filter(
                                    (item) => item.id !== procedure.id,
                                  ),
                                ),
                            })
                          }
                          className="p-2 text-red-500/30"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            </div>

    </>
  );
}
