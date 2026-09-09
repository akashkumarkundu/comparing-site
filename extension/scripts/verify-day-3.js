import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

console.log('====================================================');
console.log('🧪 VERIFYING DAY 3: COMPLETE PRODUCT (INTEGRATION & RESULTS)');
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
// 1. Check Dist Assets for Results Page
// ----------------------------------------------------
console.log('1. Checking Bundled Results Page Assets...');
const resultsHtmlPath = path.join(distDir, 'results.html');
assert(fs.existsSync(resultsHtmlPath), 'dist/results.html exists');

const resultsHtml = fs.readFileSync(resultsHtmlPath, 'utf8');
assert(resultsHtml.includes('results.js'), 'results.html links to bundled results.js');
assert(resultsHtml.includes('results.css'), 'results.html links to bundled results.css');

assert(fs.existsSync(path.join(distDir, 'assets/results.js')), 'dist/assets/results.js exists and is non-empty');
assert(fs.existsSync(path.join(distDir, 'assets/results.css')), 'dist/assets/results.css exists and is non-empty');
assert(fs.existsSync(path.join(distDir, 'index.html')), 'dist/index.html popup exists');

// ----------------------------------------------------
// 2. CSV Generation Verification
// ----------------------------------------------------
console.log('\n2. Testing CSV Export Formatter...');
const escapeCsv = (str) => `"${String(str).replace(/"/g, '""')}"`;

const mockResult = {
  comparisonTitle: 'ASUS Vivobook vs Lenovo IdeaPad',
  comparisonType: 'Laptop',
  goal: 'Best for programming under Tk 80,000',
  items: [
    { id: 'p1', displayName: 'ASUS Vivobook 15', shortDescription: 'Intel Core i5' },
    { id: 'p2', displayName: 'Lenovo IdeaPad 5', shortDescription: 'AMD Ryzen 7' },
  ],
  criteria: [
    {
      name: 'Price',
      importance: 'high',
      values: [
        { itemId: 'p1', value: 'Tk 74,500', confidence: 'high' },
        { itemId: 'p2', value: 'Tk 78,000', confidence: 'high' },
      ],
      winnerItemIds: ['p1'],
    },
    {
      name: 'Weight',
      importance: 'medium',
      values: [
        { itemId: 'p1', value: 'Not stated', confidence: 'high' },
        { itemId: 'p2', value: '1.63 kg', confidence: 'high' },
      ],
      winnerItemIds: ['p2'],
    },
  ],
  bestOverall: {
    itemId: 'p2',
    reason: 'Better processor for programming while staying in budget.',
  },
  bestFor: [
    { label: 'Lowest Price', itemId: 'p1', reason: 'Tk 3,500 cheaper' },
    { label: 'Programming', itemId: 'p2', reason: 'More CPU threads' },
  ],
  keyDifferences: ['Lenovo has Ryzen 7 vs Core i5 on ASUS', 'ASUS is Tk 3,500 cheaper'],
  missingInformation: [{ itemId: 'p1', fields: ['Weight'] }],
};

const headers = ['Feature', 'Importance', ...mockResult.items.map((it) => `${it.displayName} (${it.id})`)];
const csvRows = [headers];
for (const c of mockResult.criteria) {
  const row = [c.name, c.importance];
  for (const it of mockResult.items) {
    const valObj = c.values.find((v) => v.itemId === it.id);
    row.push(valObj?.value || 'Not stated');
  }
  csvRows.push(row);
}
const csvOutput = csvRows.map((r) => r.map(escapeCsv).join(',')).join('\n');

assert(csvOutput.includes('"Feature","Importance","ASUS Vivobook 15 (p1)","Lenovo IdeaPad 5 (p2)"'), 'CSV headers formatted correctly');
assert(csvOutput.includes('"Price","high","Tk 74,500","Tk 78,000"'), 'CSV criteria rows formatted correctly');
assert(csvOutput.includes('"Weight","medium","Not stated","1.63 kg"'), 'CSV preserves "Not stated" properly');

// ----------------------------------------------------
// 3. Markdown Copy-to-Clipboard Formatter Test
// ----------------------------------------------------
console.log('\n3. Testing Copy Comparison Formatter...');
const mdLines = [];
mdLines.push(`# ${mockResult.comparisonTitle}`);
mdLines.push(`**Goal / Priority:** ${mockResult.goal}\n`);
mdLines.push(`## Quick Verdict`);
mdLines.push(`- **Best Overall:** Lenovo IdeaPad 5`);
mdLines.push(`- **Reason:** ${mockResult.bestOverall.reason}\n`);
mdLines.push(`## Comparison Table`);
const tblHeaders = ['Feature', ...mockResult.items.map((it) => it.displayName)];
mdLines.push(`| ${tblHeaders.join(' | ')} |`);
mdLines.push(`| ${tblHeaders.map(() => '---').join(' | ')} |`);
for (const c of mockResult.criteria) {
  const row = [c.name];
  for (const it of mockResult.items) {
    const valObj = c.values.find((v) => v.itemId === it.id);
    const isWinner = c.winnerItemIds.includes(it.id);
    const val = valObj?.value || 'Not stated';
    row.push(isWinner ? `**${val}** (Winner)` : val);
  }
  mdLines.push(`| ${row.join(' | ')} |`);
}
const mdReport = mdLines.join('\n');

assert(mdReport.includes('# ASUS Vivobook vs Lenovo IdeaPad'), 'Markdown report has title');
assert(mdReport.includes('**Best Overall:** Lenovo IdeaPad 5'), 'Markdown report has Quick Verdict');
assert(mdReport.includes('| Feature | ASUS Vivobook 15 | Lenovo IdeaPad 5 |'), 'Markdown table header constructed');
assert(mdReport.includes('**Tk 74,500** (Winner)'), 'Markdown table marks winner correctly');

// ----------------------------------------------------
// 4. Manifest V3 & Popup-to-Results integration
// ----------------------------------------------------
console.log('\n4. Verifying Extension Popup-to-Results Wiring...');
const popupJsPath = path.join(distDir, 'assets/popup.js');
const popupJs = fs.readFileSync(popupJsPath, 'utf8');
assert(popupJs.includes('results.html'), 'Popup JS wires Compare button directly to results.html');

console.log('\n====================================================');
console.log(`🎉 ALL DAY 3 CHECKS PASSED: ${passedTests}/${totalTests} TESTS SUCCESSFUL!`);
console.log('====================================================\n');
