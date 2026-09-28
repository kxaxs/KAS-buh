const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const earlyReturn = `  if (!isStoreReady) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#181A20] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#6B5BAE] border-t-transparent"></div>
          <p className="text-sm text-gray-400 font-medium">Загрузка данных...</p>
        </div>
      </div>
    );
  }`;

// Remove the early return
content = content.replace(earlyReturn, '');

// Find the main return and insert the early return right above it
const mainReturnRegex = /(return \(\s*<div className="min-h-screen)/;
if (mainReturnRegex.test(content)) {
  content = content.replace(mainReturnRegex, earlyReturn + '\\n\\n  $1');
  fs.writeFileSync('src/App.tsx', content);
  console.log('Successfully moved preloader below all hooks!');
} else {
  console.log('Failed to find main return');
}
