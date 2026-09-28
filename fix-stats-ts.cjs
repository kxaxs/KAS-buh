const fs = require('fs');

// 1. Add showStatsClientSuggestions to App.tsx uiContextValue
let appCode = fs.readFileSync('src/App.tsx', 'utf8');

if (!appCode.includes('showStatsClientSuggestions,\n    setShowStatsClientSuggestions,')) {
    appCode = appCode.replace(
        '  const uiContextValue = useMemo(() => ({\n    isModalOpen,',
        '  const uiContextValue = useMemo(() => ({\n    showStatsClientSuggestions,\n    setShowStatsClientSuggestions,\n    isModalOpen,'
    );
    // Also need to add them to the dependency array
    appCode = appCode.replace(
        '  }), [\n    isModalOpen,',
        '  }), [\n    showStatsClientSuggestions,\n    isModalOpen,'
    );
    fs.writeFileSync('src/App.tsx', appCode);
    console.log('Patched App.tsx uiContextValue');
}

// 2. Fix StatsScreen.tsx
let statsCode = fs.readFileSync('src/screens/StatsScreen.tsx', 'utf8');

// Imports
statsCode = statsCode.replace(
    "import { CURRENCY } from '../lib/app-core';",
    "import { CURRENCY, CATEGORIES, getToday, isoToDDMMYYYY } from '../lib/app-core';"
);

// Add missing dependencies to destructuring
const missingDeps = `
    showStatsClientSuggestions,
    setShowStatsClientSuggestions,
    setStatsClient,
    selectedCategories,
    setSelectedCategories,
    toggleCategory,
`;

statsCode = statsCode.replace(
    '  const {\n',
    `  const {\n${missingDeps}`
);

// Fix TS any types
statsCode = statsCode.replace(
    'filteredStatsClients.map((client) => (',
    'filteredStatsClients.map((client: any) => ('
);

statsCode = statsCode.replace(
    'CATEGORIES.map((category) => {',
    'CATEGORIES.map((category: any) => {'
);

statsCode = statsCode.replace(
    'statsCalendarMarkedDates.forEach((cats, d) => {',
    'statsCalendarMarkedDates.forEach((cats: any, d: any) => {'
);

fs.writeFileSync('src/screens/StatsScreen.tsx', statsCode);
console.log('Patched StatsScreen.tsx');
