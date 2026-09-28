const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf8');

// The original import I tried to replace was `import SettingsScreen from "./screens/SettingsScreen";`
// which didn't exist. So I might have left it unchanged or inserted `StatsScreen` incorrectly.
// Let's remove any wrong imports of StatsScreen first.
app = app.replace('import StatsScreen from "./screens/StatsScreen";\n', '');

// Now add the correct import
app = app.replace(
    'import { SettingsScreen } from "./screens/SettingsScreen";',
    'import { SettingsScreen } from "./screens/SettingsScreen";\nimport { StatsScreen } from "./screens/StatsScreen";'
);

fs.writeFileSync('src/App.tsx', app);

let stats = fs.readFileSync('src/screens/StatsScreen.tsx', 'utf8');
stats = stats.replace('export default function StatsScreen', 'export function StatsScreen');
fs.writeFileSync('src/screens/StatsScreen.tsx', stats);

console.log('Fixed StatsScreen import');
