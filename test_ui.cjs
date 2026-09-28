const puppeteer = require('puppeteer');

(async () => {
  try {
    console.log("Launching browser...");
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Log any browser console messages to debug React crashes
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));
    
    console.log("Navigating to http://localhost:5173...");
    await page.goto('http://localhost:5173');
    
    console.log("Waiting for app to render...");
    await page.waitForTimeout(2000);
    
    // Find the settings gear icon and click it
    console.log("Finding settings button...");
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const settingsBtn = buttons.find(b => b.innerHTML.includes('lucide-settings') || b.querySelector('svg.lucide-settings'));
      if (settingsBtn) {
        console.log("Clicking settings button...");
        settingsBtn.click();
      } else {
        console.log("Could not find settings button!");
      }
    });
    
    console.log("Waiting for settings to render...");
    await page.waitForTimeout(2000);
    
    // Output HTML of the main area
    const html = await page.evaluate(() => {
      const main = document.querySelector('main');
      return main ? main.innerHTML : document.body.innerHTML;
    });
    
    console.log("RENDERED HTML:", html.substring(0, 3000));
    
    await browser.close();
  } catch(e) {
    console.error(e);
  }
})();
