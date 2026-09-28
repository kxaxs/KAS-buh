const fs = require('fs');
let code = fs.readFileSync('src/hooks/useAppUI.tsx', 'utf8');

const oldBackLogic = `  const closeTopLayerForBack = () => {
    if (confirmData.isOpen) {
      setConfirmData((prev) => ({ ...prev, isOpen: false }));
      return true;
    }

    if (showStatsClientSuggestions) {
      setShowStatsClientSuggestions(false);
      return true;
    }

    if (showClientSuggestions) {
      setShowClientSuggestions(false);
      return true;
    }

    if (reportDrillItem) {
      setReportDrillItem(null);
      return true;
    }

    if ( isStatsChartOpen || isStatsBreakdownOpen) {
      setIsStatsChartOpen(false);
      setIsStatsBreakdownOpen(false);
      setIsStatsOpen(false);
      if (activeTab !== "dashboard") {
        setTabDirection("right");
        setActiveTab("dashboard");
      }
      return true;
    }

    const hasOpenLayer =
      saleDetailsId ||
      isModalOpen ||
      isProcModalOpen ||
      isClientModalOpen ||
      isClientHistoryOpen ||
      isCalendarScreenOpen ||
      activeTab !== "dashboard";

    if (hasOpenLayer) {
      setSaleDetailsId(null);
      setIsModalOpen(false);
      setIsProcModalOpen(false);
      setIsClientModalOpen(false);
      setIsClientHistoryOpen(false);
      setIsCalendarScreenOpen(false);
      if (activeTab !== "dashboard") {
        setTabDirection("right");
        setActiveTab("dashboard");
      }
      return true;
    }

    return false;
  };`;

const newBackLogic = `  const closeTopLayerForBack = () => {
    if (confirmData.isOpen) {
      setConfirmData((prev) => ({ ...prev, isOpen: false }));
      return true;
    }

    if (showStatsClientSuggestions) {
      setShowStatsClientSuggestions(false);
      return true;
    }

    if (showClientSuggestions) {
      setShowClientSuggestions(false);
      return true;
    }

    if (reportDrillItem) {
      setReportDrillItem(null);
      return true;
    }

    // Stack pop order (topmost first)
    if (saleDetailsId) {
      setSaleDetailsId(null);
      return true;
    }

    if (isModalOpen) {
      setIsModalOpen(false);
      return true;
    }

    if (isProcModalOpen) {
      setIsProcModalOpen(false);
      return true;
    }

    if (isClientModalOpen) {
      setIsClientModalOpen(false);
      return true;
    }

    if (isClientHistoryOpen) {
      setIsClientHistoryOpen(false);
      return true;
    }

    if (isCalendarScreenOpen) {
      setIsCalendarScreenOpen(false);
      return true;
    }

    if (isStatsChartOpen || isStatsBreakdownOpen) {
      setIsStatsChartOpen(false);
      setIsStatsBreakdownOpen(false);
      return true;
    }

    if (activeTab !== "dashboard") {
      setTabDirection("right");
      setActiveTab("dashboard");
      return true;
    }

    return false;
  };`;

if (code.includes(oldBackLogic)) {
  code = code.replace(oldBackLogic, newBackLogic);
  fs.writeFileSync('src/hooks/useAppUI.tsx', code);
  console.log('Back logic patched in useAppUI.tsx');
} else {
  console.log('Failed to find old back logic');
}
