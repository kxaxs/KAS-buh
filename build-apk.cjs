const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const pkgPath = path.join(root, 'package.json');
const appCorePath = path.join(root, 'src', 'lib', 'app-core.ts');
const gradlePath = path.join(root, 'android', 'app', 'build.gradle');
const pkgLockPath = path.join(root, 'package-lock.json');

const bump = (v) => {
  const [maj, min, pat] = v.split('.').map(Number);
  return `${maj}.${min}.${String(pat + 1).padStart(2, '0')}`;
};

// 1. Read current version and bump 0.0.01
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const newVersion = bump(pkg.version);
console.log(`Version: ${pkg.version} -> ${newVersion}`);

// 2. Update package.json
pkg.version = newVersion;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 4));

// 3. Update package-lock.json (root + self entries)
try {
  const lock = JSON.parse(fs.readFileSync(pkgLockPath, 'utf8'));
  if (lock.version) lock.version = newVersion;
  if (lock.packages?.[""]) lock.packages[""].version = newVersion;
  fs.writeFileSync(pkgLockPath, JSON.stringify(lock, null, 2));
} catch (e) { /* lock file optional */ }

// 4. Update src/lib/app-core.ts
let appCore = fs.readFileSync(appCorePath, 'utf8');
appCore = appCore.replace(
  /export const APP_VERSION = "[^"]+";/,
  `export const APP_VERSION = "${newVersion}";`
);
fs.writeFileSync(appCorePath, appCore);

// 5. Update android/app/build.gradle
let gradle = fs.readFileSync(gradlePath, 'utf8');
gradle = gradle.replace(/versionCode \d+/, (m) => {
  const code = parseInt(m.replace('versionCode ', ''), 10);
  return `versionCode ${code + 1}`;
});
gradle = gradle.replace(/versionName "[^"]+"/, `versionName "${newVersion}"`);
fs.writeFileSync(gradlePath, gradle);

try {
  console.log('Building...');
  execSync('npm run build', { stdio: 'inherit', cwd: root });
  console.log('Syncing...');
  execSync('npx cap sync android', { stdio: 'inherit', cwd: root });
  console.log('Assembling APK...');
  execSync('cd android && .\\gradlew assembleDebug', { stdio: 'inherit', cwd: root });

  // 6. Copy APK to downloads with versioned name
  const src = path.join(root, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
  const destDir = 'C:\\Users\\kas\\Desktop\\android gui\\downloads';
  const dest = path.join(destDir, `KAS-buh-${newVersion}.apk`);
  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(src, dest);
  console.log(`APK: ${dest}`);
} catch (e) {
  console.error(e.message);
  process.exitCode = 1;
}
