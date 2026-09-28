const fs = require('fs');

// 1. Generate StatsScreen.tsx
const statsModalContent = fs.readFileSync('stats-modal.txt', 'utf8');

// Find the start of the inner content
const contentStart = statsModalContent.indexOf('<div className="-mx-4');
const contentEnd = statsModalContent.lastIndexOf('</div>\n      </BottomSheet>');

if (contentStart === -1 || contentEnd === -1) {
    console.error("Failed to parse stats-modal.txt");
    process.exit(1);
}

let innerContent = statsModalContent.substring(contentStart, contentEnd + 6); // include the </div>

// Replace the outer div with our wrapper
innerContent = innerContent.replace(
    '<div className="-mx-4 space-y-4 pb-10">',
    `<div className="space-y-4 px-2">
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
      </div>`
);

// Identify what we need to import from context
const deps = [
    'statsPeriod', 'setStatsPeriod', 'statsClient', 'statsClientSearch', 'setStatsClientSearch',
    'statsDay', 'setStatsDay', 'statsDayMonth', 'setStatsDayMonth', 'statsFilteredSales',
    'calculateStats', 'statsPeriodLabel', 'handleSelectStatsClient', 'statsClientWrapRef',
    'openStatsBreakdown', 'setIsStatsChartOpen', 'filteredStatsClients', 'handleNextFocus',
    'periodStats', 'customRange', 'setCustomRange', 'customRangeEditing', 'setCustomRangeEditing',
    'statsCalendarMarkedDates'
];
// I'll just destructure everything from useAppUI since we can safely pull any value
const destructuredDeps = deps.join(',\n    ');

const statsScreenCode = `import React from 'react';
import { useAppUI } from '../context/AppUIContext';
import { Search, BarChart3, ChevronRight, Calendar as CalendarIcon, Check } from 'lucide-react';
import { InlineDatePickerCard } from '../components/ui-core';
import { CURRENCY } from '../lib/app-core';

export default function StatsScreen() {
  const {
    ${destructuredDeps}
  } = useAppUI();

  return (
    <>
      ${innerContent}
    </>
  );
}
`;

fs.writeFileSync('src/screens/StatsScreen.tsx', statsScreenCode);
console.log('Created src/screens/StatsScreen.tsx');

// 2. Modify App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf8');

// Add import
appCode = appCode.replace(
    "import SettingsScreen from \"./screens/SettingsScreen\";",
    "import SettingsScreen from \"./screens/SettingsScreen\";\nimport StatsScreen from \"./screens/StatsScreen\";"
);

// Add to switch block
appCode = appCode.replace(
    '{activeTab === "settings" && <SettingsScreen />}',
    '{activeTab === "settings" && <SettingsScreen />}\n      {activeTab === "stats" && <StatsScreen />}'
);

// Remove the BottomSheet block
const startTag = '<BottomSheet\\n        isOpen={isStatsOpen}';
const appStart = appCode.indexOf('<BottomSheet\n        isOpen={isStatsOpen}');

if (appStart !== -1) {
    let openTags = 0;
    let idx = appStart;
    while (idx < appCode.length) {
        if (appCode.substring(idx, idx + 12) === '<BottomSheet') openTags++;
        if (appCode.substring(idx, idx + 14) === '</BottomSheet>') {
            openTags--;
            if (openTags === 0) {
                idx += 14;
                break;
            }
        }
        idx++;
    }
    appCode = appCode.substring(0, appStart) + appCode.substring(idx);
    console.log('Removed isStatsOpen BottomSheet from App.tsx');
} else {
    console.error('Could not find isStatsOpen BottomSheet in App.tsx');
}

fs.writeFileSync('src/App.tsx', appCode);

// 3. Modify useAppUI.tsx
let useAppUI = fs.readFileSync('src/hooks/useAppUI.tsx', 'utf8');

useAppUI = useAppUI.replace(
    'setIsStatsOpen(true);\n      return;\n    }',
    'setIsStatsOpen(false);\n      return;\n    }'
);

useAppUI = useAppUI.replace(
    'setIsStatsOpen(false);\n    if (activeTab === "stats") {\n      setActiveTab("dashboard");\n    }',
    'if (activeTab === "stats") {\n      setActiveTab("dashboard");\n    }'
);

useAppUI = useAppUI.replace('isStatsOpen ||', '');
useAppUI = useAppUI.replace('!isStatsOpen &&', '');

fs.writeFileSync('src/hooks/useAppUI.tsx', useAppUI);
console.log('Patched useAppUI.tsx');

