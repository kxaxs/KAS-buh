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

function ClientListItem({ client, sales, formatDate, openClientHistory, openEditClientModal, setConfirmData, setClients, selectedClient, setIsClientHistoryOpen, setSelectedClient, showContacts }) {
  const hasNote = !!client.notes?.trim();
  const [showNoteTip, setShowNoteTip] = React.useState(false);
  const longPressTimer = React.useRef(null);
  const longPressTriggered = React.useRef(false);

  const startLongPress = (e) => {
    if (!hasNote) return;
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
    openClientHistory(client);
  };

  return (
    <div
      onClick={handleClick}
      onPointerDown={startLongPress}
      onPointerUp={endLongPress}
      onPointerLeave={endLongPress}
      onPointerCancel={endLongPress}
      onContextMenu={(e) => e.preventDefault()}
      className="relative flex items-center justify-between rounded-[2rem] border border-white/5 bg-[#1E222A] px-3.5 py-2 active:bg-white/5 cursor-pointer"
      style={{ touchAction: "manipulation", WebkitUserSelect: "none", userSelect: "none" }}
    >
      {hasNote && showNoteTip && (
        <div className="pointer-events-none absolute bottom-full left-1/2 z-[500] mb-2 w-[min(28rem,92vw)] -translate-x-1/2">
          <div className="rounded-2xl border border-emerald-500/40 bg-[#1E222A]/95 px-5 py-4 text-left shadow-2xl backdrop-blur-md note-peek-anim">
            <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-400">
              <StickyNote size={12} />
              Заметка к клиенту • {client.name}
            </div>
            <div className="whitespace-pre-wrap break-words text-[13px] font-medium leading-snug text-white/95">
              {client.notes}
            </div>
          </div>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-lg font-bold leading-tight">
            {client.name}
          </span>
          {hasNote && (
            <StickyNote
              size={14}
              className="shrink-0 text-emerald-400"
            />
          )}
        </div>
        <div className="text-[10px] font-black uppercase leading-tight tracking-widest text-gray-500">
          Визитов:{" "}
          {
            sales.filter(
              (sale) => sale.clientName === client.name,
            ).length
          }
        </div>
        <div className="mt-0.5 flex items-center gap-1 text-[10px] font-bold leading-tight text-gray-400">
          <Calendar size={12} />
          Дата регистрации: {formatDate(client.registeredAt)}
        </div>
        {showContacts && client.phone?.trim() && (
          <div className="mt-0.5 flex items-center gap-1 text-[10px] font-bold leading-tight text-gray-400">
            <Phone size={12} />
            тел.: {client.phone}
          </div>
        )}
        {showContacts && client.address?.trim() && (
          <div className="mt-0.5 flex items-center gap-1 text-[10px] font-bold leading-tight text-gray-400">
            <MapPin size={12} />
            {client.address}
          </div>
        )}
      </div>

      <div className="relative flex shrink-0 gap-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openEditClientModal(client);
          }}
          className="p-2 text-gray-400"
        >
          <Edit2 size={16} />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setConfirmData({
              isOpen: true,
                               message: `Архивировать клиента "${client.name}"? История чеков сохранится.`,
                               onConfirm: () => {
                                 setClients((prev) =>
                                   prev.map((item) => item.id === client.id
                                     ? { ...item, archived: true }
                                     : item,
                                   ),
                );
                if (selectedClient?.id === client.id) {
                  setIsClientHistoryOpen(false);
                  setSelectedClient(null);
                }
              },
            });
          }}
          className="p-2 text-red-500/30"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

export function ClientsScreen() {
  const ui = React.useContext(AppUIContext);
  const { isModalOpen, setIsModalOpen, isClientModalOpen, setIsClientModalOpen, isProcModalOpen, setIsProcModalOpen, isStatsOpen, setIsStatsOpen, isStatsChartOpen, setIsStatsChartOpen, reportRange, setReportRange, reportRangeEditing, setReportRangeEditing, reportClients, setReportClients, reportClientSearch, setReportClientSearch, reportCategories, setReportCategories, reportServices, setReportServices, reportServiceSearch, setReportServiceSearch, reportShowFilters, setReportShowFilters, reportFilterPanel, setReportFilterPanel, reportChartType, setReportChartType, reportGroupBy, setReportGroupBy, reportDrillItem, setReportDrillItem, reportDrillSort, setReportDrillSort, isStatsBreakdownOpen, setIsStatsBreakdownOpen, isTimePickerOpen, setIsTimePickerOpen, isDatePickerOpen, setIsDatePickerOpen, calendarScreenMode, setCalendarScreenMode, calendarScreenTextValue, setCalendarScreenTextValue, calendarScreenTextError, setCalendarScreenTextError, statsBreakdownType, setStatsBreakdownType, isClientHistoryOpen, setIsClientHistoryOpen, isCalendarScreenOpen, setIsCalendarScreenOpen, showClientSuggestions, setShowClientSuggestions, backHint, setBackHint, showScrollTop, setShowScrollTop, selectedSale, setSelectedSale, saleDetailsId, setSaleDetailsId, selectedClient, setSelectedClient, selectedCategories, setSelectedCategories, searchQuery, setSearchQuery, statsPeriod, setStatsPeriod, statsClient, setStatsClient, statsClientSearch, setStatsClientSearch, statsDay, setStatsDay, statsDayMonth, setStatsDayMonth, calendarScreenMonth, setCalendarScreenMonth, customRangeEditing, setCustomRangeEditing, customRange, setCustomRange, editingProc, setEditingProc, editingClient, setEditingClient, procSearch, setProcSearch, isNotifMenuOpen, setIsNotifMenuOpen, recentProcIds, setRecentProcIds, procedureListSearch, setProcedureListSearch, clientListSearch, setClientListSearch, clientSortMode, setClientSortMode, clientPinNotes, setClientPinNotes, salesPinNotes, setSalesPinNotes, notifEnabled, setNotifEnabled, notifMinutes, setNotifMinutes, notifPendingId, setNotifPendingId, prevFiredSaleId, setPrevFiredSaleId, newClientName, setNewClientName, newClientNotes, setNewClientNotes, isCalendarOpen, setIsCalendarOpen, newSale, setNewSale, manualService, setManualService, confirmData, setConfirmData, fileInputRef, saleClientWrapRef, statsClientWrapRef, reportFilterWrapRef, saleClientRef, saleDateRef, saleTimeRef, manualNameRef, manualPriceRef, manualIncomeRef, manualSaleIncomeRef, clientInputRef, clientDateRef, procNameRef, procPriceRef, procIncomeRef, backHandlerRef, lastBackAtRef, backHintTimerRef, lastLayerCloseAtRef, lastPopstateAtRef, closeTopLayerForBack, handleBackNavigation, handleOutside, handlePopState, handleScroll, filteredSales, filteredClients, clientSuggestions, filteredProcedures, filteredStatsClients, selectedClientSales, calculateStats, dashboardMonthSales, dashboardStats, statsFilteredSales, periodStats, reportFilteredSales, reportServiceStats, getReportSaleAmount, reportChartData, reportPeriodLabel, exportReportCsv, escape, triggerDownload, reportDrillSales, statsPeriodLabel, statsBreakdownSales, statsCalendarMarkedDates, saleDetails, calendarMarkedDates, calendarScreenSales, resetSaleForm, resetClientForm, toggleCategory, handleNextFocus, isSaleFormValid, requestSaveSale, handleSaleEnterKey, handleSelectClient, handleClientNameChange, openNewClientModal, openEditClientModal, openClientHistory, openSaleDetails, openStatsBreakdown, handleSelectStatsClient, handleSelectPayrollType, openEditSale, repeatSale, requestDeleteSale, conductSale, openCalendarScreen, handleDashboardNav, SWIPE_TABS, swipeStartRef, tabDirection, setTabDirection, goToTab, handleMainTouchStart, handleMainTouchEnd, handleClientsNav, handleProceduresNav, handleStatsNav, handleStatsClose, handlePrimaryAction, handleSaveClient, saveSale, handleAddManualService, updateItemActualPrice, handleExport, handleImport, handleSaveProcedure, commit, openNewSaleModal, openNewProcedureModal, isPayrollSale, isSalonServicesSale, selectedPayrollType, clientPhoneFilter, setClientPhoneFilter } = ui;

  const sales = useAppStore(s => s.sales);
  const procedures = useAppStore(s => s.procedures);
  const clients = useAppStore(s => s.clients);
  const activeTab = useAppStore(s => s.activeTab);
  const setClients = useAppStore(s => s.setClients);
  const setSales = useAppStore(s => s.setSales);
  const setProcedures = useAppStore(s => s.setProcedures);

  return (
    <>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 px-1">
                <h2 className="text-xl font-black uppercase">База клиентов</h2>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setClientSortMode((prev) =>
                        prev === "name" ? "date" : "name",
                      )
                    }
                    aria-label="Сортировка"
                    title={
                      clientSortMode === "name"
                        ? "По алфавиту"
                        : "По дате регистрации"
                    }
                    className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all active:scale-95 ${
                      clientSortMode === "date"
                        ? "border-[#6B5BAE]/40 bg-[#6B5BAE]/15 text-[#A89AE0]"
                        : "border-white/10 bg-white/5 text-gray-300"
                    }`}
                  >
                    {clientSortMode === "date" ? (
                      <CalendarClock size={16} />
                    ) : (
                      <ArrowDownAZ size={16} />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setClientPinNotes((prev) => !prev)}
                    aria-label="Закрепить с заметками"
                    title="С заметками — наверх"
                    className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all active:scale-95 ${
                      clientPinNotes
                        ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
                        : "border-white/10 bg-white/5 text-gray-300"
                    }`}
                  >
                    <StickyNote size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setClientPhoneFilter((prev) => !prev)}
                    aria-label="Фильтр по телефону"
                    title="С номером — наверх, номера видны"
                    className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all active:scale-95 ${
                      clientPhoneFilter
                        ? "border-[#6B5BAE]/40 bg-[#6B5BAE]/15 text-[#A89AE0]"
                        : "border-white/10 bg-white/5 text-gray-300"
                    }`}
                  >
                    <Phone size={15} />
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
                  placeholder="Поиск клиента..."
                  className="w-full rounded-2xl border border-white/5 bg-[#1E222A] py-2.5 pl-11 pr-3 text-sm font-bold outline-none focus:border-[#6B5BAE]/50"
                  value={clientListSearch}
                  onChange={(e) => setClientListSearch(e.target.value)}
                  onKeyDown={(e) => handleNextFocus(e, null)}
                  enterKeyHint="done"
                />
              </div>

              {filteredClients.length === 0 ? (
                <div className="rounded-[3rem] bg-white/5 p-12 text-center text-xs italic opacity-30">
                  Клиенты не найдены
                </div>
              ) : (
                <div className="space-y-[2px]">
                  {filteredClients.map((client) => (
                    <ClientListItem
                      key={client.id}
                      client={client}
                      sales={sales}
                      formatDate={formatDate}
                      openClientHistory={openClientHistory}
                      openEditClientModal={openEditClientModal}
                      setConfirmData={setConfirmData}
                      setClients={setClients}
                      selectedClient={selectedClient}
                      setIsClientHistoryOpen={setIsClientHistoryOpen}
                      setSelectedClient={setSelectedClient}
                      showContacts={clientPhoneFilter}
                    />
                  ))}
                </div>
              )}
            </div>

    </>
  );
}
