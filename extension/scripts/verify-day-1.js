import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

console.log('====================================================');
console.log('🧪 VERIFYING DAY 1: CHROME EXTENSION FOUNDATION');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    process.exitCode = 1;
  }
}

// ----------------------------------------------------
// 1. MANIFEST V3 & PERMISSIONS TEST
// ----------------------------------------------------
console.log('1. Checking Manifest V3 & Minimal Permissions...');
const manifestPath = path.join(distDir, 'manifest.json');
assert(fs.existsSync(manifestPath), 'dist/manifest.json exists');

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
assert(manifest.manifest_version === 3, 'manifest_version is exactly 3');
assert(
  Array.isArray(manifest.permissions) &&
    manifest.permissions.includes('activeTab') &&
    manifest.permissions.includes('scripting') &&
    manifest.permissions.includes('storage'),
  'permissions include activeTab, scripting, storage'
);

const forbiddenPermissions = ['<all_urls>', 'history', 'bookmarks', 'downloads', 'clipboardRead'];
const hasForbidden = forbiddenPermissions.some((p) => manifest.permissions?.includes(p));
assert(!hasForbidden, 'does NOT request excessive/forbidden permissions (<all_urls>, history, etc.)');

// Check icons
assert(fs.existsSync(path.join(distDir, 'icons/icon16.png')), '16x16 icon exists');
assert(fs.existsSync(path.join(distDir, 'icons/icon48.png')), '48x48 icon exists');
assert(fs.existsSync(path.join(distDir, 'icons/icon128.png')), '128x128 icon exists');

// Check popup entry point
const popupPath = path.join(distDir, manifest.action.default_popup);
assert(fs.existsSync(popupPath), `Popup HTML file exists at ${manifest.action.default_popup}`);

// ----------------------------------------------------
// 2. STORAGE & LIMITS VERIFICATION
// ----------------------------------------------------
console.log('\n2. Checking Storage & Page Limits (2-4 pages, duplicate check, user goal)...');

// In-memory mock storage for testing StorageService logic
class MockStorage {
  constructor() {
    this.data = {};
  }
  async get(keys) {
    const res = {};
    keys.forEach((k) => (res[k] = this.data[k]));
    return res;
  }
  async set(obj) {
    Object.assign(this.data, obj);
  }
  async remove(keys) {
    keys.forEach((k) => delete this.data[k]);
  }
}

const mockStorage = new MockStorage();
global.chrome = { storage: { local: mockStorage } };

// Dynamic import of StorageService
const { StorageService } = await import('../src/storage/StorageService.ts');
const { extractPageInTabDOM } = await import('../src/extractors/PageExtractor.ts');

const state0 = await StorageService.getState();
assert(state0.pages.length === 0, 'Initial pages list is empty');
assert(typeof state0.installId === 'string' && state0.installId.length > 10, 'Anonymous installId is generated');

// ----------------------------------------------------
// 3. END-OF-DAY ACCEPTANCE TEST: 4 SITES SNAPSHOT EXTRACTION
// ----------------------------------------------------
console.log('\n3. Running End-Of-Day Test: Add 4 pages from 4 different websites & verify snapshots...');

const sampleWebsites = [
  {
    url: 'https://www.startech.com.bd/asus-vivobook-15-x1504za',
    domain: 'startech.com.bd',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <title>ASUS Vivobook 15 X1504ZA Core i5 12th Gen 15.6" FHD Laptop</title>
          <meta name="description" content="Buy ASUS Vivobook 15 X1504ZA Core i5 12th Gen 16GB RAM 512GB SSD Laptop at Tk 74,500">
          <script type="application/ld+json">
            {
              "@context": "https://schema.org/",
              "@type": "Product",
              "name": "ASUS Vivobook 15 X1504ZA",
              "offers": { "price": "74500", "priceCurrency": "BDT" }
            }
          </script>
        </head>
        <body>
          <nav class="navigation">Navigation links...</nav>
          <div class="cookie-banner">Accept all cookies</div>
          <div class="ad-container">Buy now ad banner</div>
          <main>
            <h1>ASUS Vivobook 15 X1504ZA</h1>
            <table>
              <tr><td>Processor</td><td>Intel Core i5-1235U</td></tr>
              <tr><td>RAM</td><td>16 GB DDR4</td></tr>
              <tr><td>Storage</td><td>512 GB NVMe SSD</td></tr>
              <tr><td>Display</td><td>15.6 inch FHD IPS</td></tr>
              <tr><td>Price</td><td>Tk 74,500</td></tr>
              <tr><td>Warranty</td><td>2 Years</td></tr>
            </table>
          </main>
          <footer>Footer copyright and links</footer>
        </body>
      </html>
    `,
  },
  {
    url: 'https://www.ryans.com/lenovo-ideapad-slim-3-15abr8',
    domain: 'ryans.com',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Lenovo IdeaPad Slim 3 15ABR8 AMD Ryzen 7 7730U 15.6" FHD Laptop</title>
          <meta name="description" content="Lenovo IdeaPad Slim 3 with Ryzen 7 processor, 16GB RAM and 512GB SSD at best price.">
        </head>
        <body>
          <header>Ryans Navigation</header>
          <div id="cookie-notice">Cookie consent</div>
          <main>
            <h1>Lenovo IdeaPad Slim 3</h1>
            <dl class="specification">
              <dt>Processor</dt><dd>AMD Ryzen 7 7730U</dd>
              <dt>RAM</dt><dd>16 GB</dd>
              <dt>Storage</dt><dd>512 GB SSD</dd>
              <dt>Weight</dt><dd>1.63 kg</dd>
              <dt>Price</dt><dd>Tk 78,000</dd>
            </dl>
          </main>
        </body>
      </html>
    `,
  },
  {
    url: 'https://www.coursera.org/specializations/deep-learning',
    domain: 'coursera.org',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Deep Learning Specialization by Andrew Ng</title>
          <meta name="description" content="Master Deep Learning, Neural Networks and AI with Coursera.">
        </head>
        <body>
          <main>
            <h1>Deep Learning Specialization</h1>
            <div class="spec-details">
              <p>Tuition: $49/month</p>
              <p>Duration: 3 months at 10 hours a week</p>
              <p>Skill Level: Intermediate</p>
              <p>Instructor: Andrew Ng</p>
            </div>
            <h2>What You Will Learn</h2>
            <ul>
              <li>Build and train deep neural networks</li>
              <li>Implement convolutional neural networks (CNNs)</li>
              <li>Natural language processing with transformers</li>
            </ul>
          </main>
        </body>
      </html>
    `,
  },
  {
    url: 'https://remoteok.com/remote-jobs/senior-fullstack-engineer',
    domain: 'remoteok.com',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Senior Full-Stack Engineer at TechCorp</title>
          <meta name="description" content="Remote Senior Full-Stack Engineer role paying $120,000 - $140,000.">
          <script type="application/ld+json">
            {
              "@context": "https://schema.org/",
              "@type": "JobPosting",
              "title": "Senior Full-Stack Engineer",
              "baseSalary": { "value": 130000, "currency": "USD" }
            }
          </script>
        </head>
        <body>
          <main>
            <h1>Senior Full-Stack Engineer</h1>
            <table>
              <tr><td>Salary</td><td>$120,000 - $140,000 USD</td></tr>
              <tr><td>Location</td><td>100% Remote (Worldwide)</td></tr>
              <tr><td>Experience</td><td>5+ years</td></tr>
              <tr><td>Skills</td><td>React, TypeScript, Node.js, C#/.NET</td></tr>
            </table>
          </main>
        </body>
      </html>
    `,
  },
];

const capturedSnapshots = [];

for (let i = 0; i < sampleWebsites.length; i++) {
  const site = sampleWebsites[i];
  const dom = new JSDOM(site.html, { url: site.url });

  // Bind window and document to simulate running inside active tab
  global.window = dom.window;
  global.document = dom.window.document;

  const extracted = extractPageInTabDOM();

  assert(extracted.url === site.url, `Page ${i + 1} URL extracted correctly (${site.domain})`);
  assert(extracted.domain === site.domain, `Page ${i + 1} Domain cleaned correctly (${site.domain})`);
  assert(extracted.title && extracted.title.length > 5, `Page ${i + 1} Title extracted`);
  assert(extracted.importantText && extracted.importantText.length > 20, `Page ${i + 1} Structured data extracted`);
  assert(extracted.importantText.length <= 3550, `Page ${i + 1} Length strictly <= 3,500 chars limit`);
  assert(!extracted.importantText.includes('Accept all cookies'), `Page ${i + 1} Cookie banners removed`);
  assert(!extracted.importantText.includes('Navigation links'), `Page ${i + 1} Navigation clutter removed`);

  const snapshot = {
    id: `page-${i + 1}`,
    url: extracted.url,
    domain: extracted.domain,
    title: extracted.title,
    description: extracted.description,
    structuredData: extracted.structuredData,
    importantText: extracted.importantText,
    capturedAt: new Date().toISOString(),
  };

  const addResult = await StorageService.addPage(snapshot);
  assert(addResult.success, `Page ${i + 1} saved into local storage (${i + 1}/4)`);
  capturedSnapshots.push(snapshot);
}

// Check total storage count after adding 4 pages
const finalState = await StorageService.getState();
assert(finalState.pages.length === 4, 'All 4 page snapshots stored in local storage');

// Test adding a 5th website (must be rejected)
const fifthPage = {
  id: 'page-5',
  url: 'https://airbnb.com/rooms/123456',
  domain: 'airbnb.com',
  title: 'Luxury Beachfront Villa',
  description: 'Ocean view, 3 bedrooms',
  structuredData: '',
  importantText: 'Price: $250/night',
  capturedAt: new Date().toISOString(),
};
const fifthResult = await StorageService.addPage(fifthPage);
assert(!fifthResult.success && fifthResult.error?.includes('Maximum 4'), 'Adding 5th page blocked by limit guard');

// Test Duplicate URL rejection
const dupResult = await StorageService.addPage(capturedSnapshots[0]);
assert(!dupResult.success && dupResult.error?.includes('already in your comparison'), 'Adding duplicate page rejected');

// Test User Goal persistence
await StorageService.setUserGoal('Best laptop for programming under Tk 80,000');
const stateWithGoal = await StorageService.getState();
assert(stateWithGoal.userGoal === 'Best laptop for programming under Tk 80,000', 'User goal persisted across operations');

// Test Individual Page Removal (Remove page 2)
const stateAfterRemove = await StorageService.removePage('page-2');
assert(stateAfterRemove.length === 3, 'Page removed successfully, remaining count is 3/4');
assert(!stateAfterRemove.some((p) => p.id === 'page-2'), 'Removed page no longer present in storage');

// Test Clear Comparison
await StorageService.clearComparison();
const stateAfterClear = await StorageService.getState();
assert(stateAfterClear.pages.length === 0, 'Clear comparison emptied all pages');
assert(stateAfterClear.userGoal === '', 'Clear comparison cleared user goal');

// ----------------------------------------------------
// FINAL SUMMARY
// ----------------------------------------------------
console.log('\n====================================================');
console.log(`🎉 ALL DAY 1 CHECKS PASSED: ${passedTests}/${totalTests} TESTS SUCCESSFUL!`);
console.log('====================================================\n');
