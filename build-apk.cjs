const { execSync } = require('child_process');
try {
  console.log('Building...');
  execSync('npm run build', {stdio: 'inherit'});
  console.log('Syncing...');
  execSync('npx cap sync android', {stdio: 'inherit'});
  console.log('Assembling APK...');
  execSync('cd android && .\\gradlew assembleDebug', {stdio: 'inherit'});
} catch(e) {
  console.error(e.message);
}
