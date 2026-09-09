<?php

/**
 * Compare Anything — Store Assets Generator
 * Generates Chrome Web Store compliant screenshots (1280x800), promo tile (440x280),
 * and validates icon128.png.
 */
$assetsDir = __DIR__.'/../extension/store-assets';
if (! is_dir($assetsDir)) {
    mkdir($assetsDir, 0777, true);
}

// Copy icon128.png
$sourceIcon = __DIR__.'/../extension/public/icons/icon128.png';
$destIcon = $assetsDir.'/icon128.png';
if (file_exists($sourceIcon)) {
    copy($sourceIcon, $destIcon);
    echo "✓ icon128.png copied to store-assets/\n";
}

$fontRegular = 'C:/Windows/Fonts/segoeui.ttf';
$fontBold = 'C:/Windows/Fonts/segoeuib.ttf';
$fontSemibold = 'C:/Windows/Fonts/segoeuisb.ttf';
$fontMono = 'C:/Windows/Fonts/consola.ttf';

if (! file_exists($fontBold)) {
    $fontBold = 'C:/Windows/Fonts/arialbd.ttf';
    $fontRegular = 'C:/Windows/Fonts/arial.ttf';
}

function hexColor($im, $hex)
{
    $hex = ltrim($hex, '#');
    $r = hexdec(substr($hex, 0, 2));
    $g = hexdec(substr($hex, 2, 2));
    $b = hexdec(substr($hex, 4, 2));

    return imagecolorallocate($im, $r, $g, $b);
}

function drawRoundedRect($im, $x, $y, $w, $h, $radius, $color)
{
    imagefilledrectangle($im, $x + $radius, $y, $x + $w - $radius, $y + $h, $color);
    imagefilledrectangle($im, $x, $y + $radius, $x + $w, $y + $h - $radius, $color);
    imagefilledellipse($im, $x + $radius, $y + $radius, $radius * 2, $radius * 2, $color);
    imagefilledellipse($im, $x + $w - $radius, $y + $radius, $radius * 2, $radius * 2, $color);
    imagefilledellipse($im, $x + $radius, $y + $h - $radius, $radius * 2, $radius * 2, $color);
    imagefilledellipse($im, $x + $w - $radius, $y + $h - $radius, $radius * 2, $radius * 2, $color);
}

function drawBrowserFrame($im, $title, $url, $w = 1200, $h = 660, $x = 40, $y = 50, $fontRegular = '', $fontBold = '')
{
    $bgFrame = hexColor($im, '#0f172a');
    $navBg = hexColor($im, '#1e293b');
    $borderCol = hexColor($im, '#334155');
    $urlBg = hexColor($im, '#0f172a');
    $textMuted = hexColor($im, '#94a3b8');
    $textWhite = hexColor($im, '#f8fafc');
    $redDot = hexColor($im, '#ef4444');
    $yellowDot = hexColor($im, '#f59e0b');
    $greenDot = hexColor($im, '#10b981');

    // Outer shadow / border
    drawRoundedRect($im, $x, $y, $w, $h, 16, $borderCol);
    drawRoundedRect($im, $x + 2, $y + 2, $w - 4, $h - 4, 14, $bgFrame);

    // Titlebar
    drawRoundedRect($im, $x + 2, $y + 2, $w - 4, 48, 14, $navBg);
    imagefilledrectangle($im, $x + 2, $y + 35, $x + $w - 4, $y + 50, $navBg);

    // Window controls
    imagefilledellipse($im, $x + 25, $y + 25, 12, 12, $redDot);
    imagefilledellipse($im, $x + 45, $y + 25, 12, 12, $yellowDot);
    imagefilledellipse($im, $x + 65, $y + 25, 12, 12, $greenDot);

    // Active Tab
    drawRoundedRect($im, $x + 95, $y + 10, 240, 36, 8, $bgFrame);
    imagettftext($im, 10, 0, $x + 115, $y + 32, $textWhite, $fontBold, $title);

    // URL Bar
    drawRoundedRect($im, $x + 350, $y + 12, 540, 28, 6, $urlBg);
    imagettftext($im, 9, 0, $x + 365, $y + 30, $textMuted, $fontRegular, '🔒 '.$url);

    // Extension Icon in Toolbar
    $extBg = hexColor($im, '#2563eb');
    drawRoundedRect($im, $x + $w - 60, $y + 12, 30, 28, 6, $extBg);
    imagettftext($im, 11, 0, $x + $w - 53, $y + 31, $textWhite, $fontBold, '⇄');
}

// -------------------------------------------------------------
// SCREENSHOT 1: 1-Click Add Webpage to Compare (1280x800)
// -------------------------------------------------------------
$im1 = imagecreatetruecolor(1280, 800);
$bg1 = hexColor($im1, '#0b0f19');
imagefilledrectangle($im1, 0, 0, 1280, 800, $bg1);

// Subtle glow
$glow1 = hexColor($im1, '#1e1b4b');
imagefilledellipse($im1, 640, 200, 900, 400, $glow1);

// Browser frame
drawBrowserFrame($im1, 'Star Tech — ASUS Vivobook 15', 'https://www.startech.com.bd/asus-vivobook-15', 1200, 640, 40, 40, $fontRegular, $fontBold);

// Simulated product webpage content inside browser
$cardBg = hexColor($im1, '#1e293b');
$textWhite = hexColor($im1, '#ffffff');
$textGray = hexColor($im1, '#94a3b8');
$brandBlue = hexColor($im1, '#3b82f6');
$priceGreen = hexColor($im1, '#22c55e');

// Left product mockup
drawRoundedRect($im1, 80, 120, 520, 420, 12, $cardBg);
imagettftext($im1, 18, 0, 110, 165, $textWhite, $fontBold, 'ASUS Vivobook 15 X1504VA Core i5');
imagettftext($im1, 13, 0, 110, 200, $priceGreen, $fontBold, 'Price: Tk 74,500 (Regular: Tk 78,000)');
imagettftext($im1, 11, 0, 110, 240, $textGray, $fontRegular, 'Processor: Intel Core i5-1335U (13th Gen, 10 Cores)');
imagettftext($im1, 11, 0, 110, 275, $textGray, $fontRegular, 'RAM: 16GB DDR4 3200MHz');
imagettftext($im1, 11, 0, 110, 310, $textGray, $fontRegular, 'Storage: 512GB NVMe PCIe 4.0 SSD');
imagettftext($im1, 11, 0, 110, 345, $textGray, $fontRegular, 'Display: 15.6" FHD Anti-Glare LED Display');
imagettftext($im1, 11, 0, 110, 380, $textGray, $fontRegular, 'Warranty: 2 Years Official Warranty');
imagettftext($im1, 11, 0, 110, 415, $textGray, $fontRegular, 'Weight: [Not listed on page]');

// Extension Popup Mockup (floating top right)
$popBg = hexColor($im1, '#0f172a');
$popBorder = hexColor($im1, '#38bdf8');
$popButton = hexColor($im1, '#2563eb');
$popCard = hexColor($im1, '#1e293b');

drawRoundedRect($im1, 720, 105, 460, 460, 16, $popBorder);
drawRoundedRect($im1, 723, 108, 454, 454, 14, $popBg);

// Popup header
imagettftext($im1, 15, 0, 750, 145, $textWhite, $fontBold, 'COMPARE ANYTHING');
imagettftext($im1, 10, 0, 750, 170, $textGray, $fontRegular, 'AI-Powered Decision Engine — 0 / 4 Pages Added');

// Current page detection box
drawRoundedRect($im1, 745, 190, 410, 95, 10, $popCard);
imagettftext($im1, 10, 0, 765, 215, $brandBlue, $fontBold, 'ACTIVE TAB DETECTED:');
imagettftext($im1, 12, 0, 765, 240, $textWhite, $fontBold, 'ASUS Vivobook 15 X1504VA');
imagettftext($im1, 10, 0, 765, 265, $textGray, $fontRegular, 'startech.com.bd • Specs & Table extracted');

// Add Button
drawRoundedRect($im1, 745, 305, 410, 50, 10, $popButton);
imagettftext($im1, 13, 0, 840, 337, $textWhite, $fontBold, '+ ADD TO COMPARISON');

// Tip box
drawRoundedRect($im1, 745, 380, 410, 130, 10, hexColor($im1, '#111827'));
imagettftext($im1, 11, 0, 765, 410, $textWhite, $fontBold, 'How it works:');
imagettftext($im1, 10, 0, 765, 435, $textGray, $fontRegular, '1. Click "+ Add" on this page');
imagettftext($im1, 10, 0, 765, 460, $textGray, $fontRegular, '2. Switch to a 2nd, 3rd, or 4th tab and add it');
imagettftext($im1, 10, 0, 765, 485, $textGray, $fontRegular, '3. Click Compare for one clean decision table!');

// Bottom Banner Headline
$bannerBg = hexColor($im1, '#1e293b');
drawRoundedRect($im1, 140, 705, 1000, 65, 14, hexColor($im1, '#3b82f6'));
drawRoundedRect($im1, 142, 707, 996, 61, 12, $bannerBg);
imagettftext($im1, 15, 0, 280, 745, $textWhite, $fontBold, 'STEP 1: 1-Click Snapshot — Add 2 to 4 Webpages from Anywhere');
imagepng($im1, $assetsDir.'/screenshot-1.png');
imagedestroy($im1);
echo "✓ screenshot-1.png generated\n";

// -------------------------------------------------------------
// SCREENSHOT 2: 2–4 Pages Queue & Personalized Goal (1280x800)
// -------------------------------------------------------------
$im2 = imagecreatetruecolor(1280, 800);
imagefilledrectangle($im2, 0, 0, 1280, 800, $bg1);
imagefilledellipse($im2, 640, 300, 850, 500, hexColor($im2, '#1e1b4b'));

drawBrowserFrame($im2, 'Compare Anything Queue', 'chrome-extension://compare-anything/popup', 1200, 640, 40, 40, $fontRegular, $fontBold);

// Centered Popup Showcase
$pop2X = 390;
$pop2Y = 100;
$pop2W = 500;
$pop2H = 540;

drawRoundedRect($im2, $pop2X, $pop2Y, $pop2W, $pop2H, 16, hexColor($im2, '#38bdf8'));
drawRoundedRect($im2, $pop2X + 2, $pop2Y + 2, $pop2W - 4, $pop2H - 4, 14, $popBg);

imagettftext($im2, 16, 0, $pop2X + 30, $pop2Y + 40, $textWhite, $fontBold, 'COMPARE ANYTHING');
imagettftext($im2, 11, 0, $pop2X + 30, $pop2Y + 65, $brandBlue, $fontBold, 'Ready to Compare: 3 of 4 Pages Selected');

// 3 Items List
$items = [
    ['ASUS Vivobook 15 (16GB RAM)', 'startech.com.bd', 'Tk 74,500'],
    ['Lenovo IdeaPad Slim 3', 'ryanscomputers.com', 'Tk 71,900'],
    ['HP 15s-fq5321TU Core i5', 'techlandbd.com', 'Tk 76,000'],
];

$curY = $pop2Y + 85;
foreach ($items as $idx => $it) {
    drawRoundedRect($im2, $pop2X + 25, $curY, $pop2W - 50, 52, 8, $cardBg);
    imagettftext($im2, 11, 0, $pop2X + 40, $curY + 24, $textWhite, $fontBold, ($idx + 1).'. '.$it[0]);
    imagettftext($im2, 9, 0, $pop2X + 40, $curY + 42, $textGray, $fontRegular, $it[1].' • '.$it[2]);

    // Remove chip
    drawRoundedRect($im2, $pop2X + $pop2W - 100, $curY + 14, 60, 24, 6, hexColor($im2, '#334155'));
    imagettftext($im2, 9, 0, $pop2X + $pop2W - 90, $curY + 30, hexColor($im2, '#f87171'), $fontBold, 'Remove');
    $curY += 60;
}

// Goal input
imagettftext($im2, 10, 0, $pop2X + 25, $curY + 20, $textGray, $fontBold, 'WHAT MATTERS MOST TO YOU? (OPTIONAL)');
drawRoundedRect($im2, $pop2X + 25, $curY + 30, $pop2W - 50, 42, 8, hexColor($im2, '#1e293b'));
imagettftext($im2, 11, 0, $pop2X + 40, $curY + 56, hexColor($im2, '#67e8f9'), $fontRegular, '🎯 Best for programming under Tk 80,000');

// Compare Action Button
$btnY = $curY + 90;
drawRoundedRect($im2, $pop2X + 25, $btnY, $pop2W - 50, 54, 10, hexColor($im2, '#2563eb'));
imagettftext($im2, 14, 0, $pop2X + 135, $btnY + 35, $textWhite, $fontBold, 'COMPARE 3 PAGES →');

// Bottom Banner
drawRoundedRect($im2, 140, 705, 1000, 65, 14, hexColor($im2, '#3b82f6'));
drawRoundedRect($im2, 142, 707, 996, 61, 12, $bannerBg);
imagettftext($im2, 15, 0, 250, 745, $textWhite, $fontBold, 'STEP 2: Queue 2 to 4 Pages & Give Your Tailored Goal');
imagepng($im2, $assetsDir.'/screenshot-2.png');
imagedestroy($im2);
echo "✓ screenshot-2.png generated\n";

// -------------------------------------------------------------
// SCREENSHOT 3: Zero-Hallucination Side-by-Side Table (1280x800)
// -------------------------------------------------------------
$im3 = imagecreatetruecolor(1280, 800);
imagefilledrectangle($im3, 0, 0, 1280, 800, $bg1);
imagefilledellipse($im3, 640, 300, 850, 500, hexColor($im3, '#064e3b'));

drawBrowserFrame($im3, 'Comparison Results — Compare Anything', 'chrome-extension://compare-anything/results.html', 1200, 640, 40, 40, $fontRegular, $fontBold);

// Results Table View
$tblX = 70;
$tblY = 100;
$tblW = 1140;

// Header
imagettftext($im3, 16, 0, $tblX, $tblY + 25, $textWhite, $fontBold, 'Laptop Comparison: 3 Retailers Analyzed');
imagettftext($im3, 11, 0, $tblX, $tblY + 45, $textGray, $fontRegular, 'Target Goal: Best for programming under Tk 80,000');

// Badges
drawRoundedRect($im3, $tblX + $tblW - 380, $tblY + 12, 380, 30, 6, hexColor($im3, '#065f46'));
imagettftext($im3, 10, 0, $tblX + $tblW - 365, $tblY + 32, hexColor($im3, '#34d399'), $fontBold, '🛡️ Verified: Missing fields strictly "Not stated"');

// Table Headers
$tHeadY = $tblY + 65;
$colW = 270;
drawRoundedRect($im3, $tblX, $tHeadY, 220, 45, 6, hexColor($im3, '#1e293b'));
imagettftext($im3, 11, 0, $tblX + 20, $tHeadY + 28, $textWhite, $fontBold, 'Specification');

$cols = ['ASUS Vivobook 15', 'Lenovo IdeaPad Slim 3', 'HP 15s-fq5321TU'];
foreach ($cols as $idx => $cName) {
    $colX = $tblX + 230 + ($idx * $colW);
    drawRoundedRect($im3, $colX, $tHeadY, $colW - 10, 45, 6, hexColor($im3, '#1e293b'));
    imagettftext($im3, 11, 0, $colX + 15, $tHeadY + 28, $brandBlue, $fontBold, $cName);
}

// Table Rows
$rows = [
    ['Price', ['Tk 74,500', 'Tk 71,900  ✓ Lowest', 'Tk 76,000'], 1],
    ['Processor', ['Intel i5-1335U (10 Cores)', 'Intel i5-1235U (10 Cores)', 'Intel i5-1235U (10 Cores)'], 0],
    ['RAM Memory', ['16GB DDR4  ✓ Winner', '8GB DDR4', '8GB DDR4'], 0],
    ['Storage', ['512GB NVMe SSD', '512GB NVMe SSD', '512GB NVMe SSD'], -1],
    ['Weight', ['Not stated', '1.63 kg', '1.69 kg'], 1],
    ['Battery Life', ['42 Whr (Up to 6 hrs)', '45 Whr (Up to 7 hrs)', 'Not stated'], 1],
    ['Warranty', ['2 Years Official', '2 Years Official', '2 Years Official'], -1],
];

$rY = $tHeadY + 52;
foreach ($rows as $r) {
    $isDark = ($rY % 60 == 0);
    $rowBg = $isDark ? hexColor($im3, '#111827') : hexColor($im3, '#0f172a');

    // Label cell
    drawRoundedRect($im3, $tblX, $rY, 220, 40, 4, $rowBg);
    imagettftext($im3, 10, 0, $tblX + 20, $rY + 25, $textWhite, $fontBold, $r[0]);

    // Values
    foreach ($r[1] as $idx => $val) {
        $colX = $tblX + 230 + ($idx * $colW);
        drawRoundedRect($im3, $colX, $rY, $colW - 10, 40, 4, $rowBg);

        if (str_contains($val, 'Not stated')) {
            drawRoundedRect($im3, $colX + 12, $rY + 8, 90, 24, 4, hexColor($im3, '#451a03'));
            imagettftext($im3, 9, 0, $colX + 20, $rY + 24, hexColor($im3, '#fbbf24'), $fontBold, 'Not stated');
        } elseif (str_contains($val, '✓')) {
            drawRoundedRect($im3, $colX + 12, $rY + 8, $colW - 35, 24, 4, hexColor($im3, '#064e3b'));
            imagettftext($im3, 9, 0, $colX + 20, $rY + 24, hexColor($im3, '#34d399'), $fontBold, $val);
        } else {
            imagettftext($im3, 9, 0, $colX + 15, $rY + 25, $textGray, $fontRegular, $val);
        }
    }
    $rY += 44;
}

// Bottom Banner
drawRoundedRect($im3, 140, 705, 1000, 65, 14, hexColor($im3, '#3b82f6'));
drawRoundedRect($im3, 142, 707, 996, 61, 12, $bannerBg);
imagettftext($im3, 15, 0, 220, 745, $textWhite, $fontBold, 'STEP 3: Zero-Hallucination Side-by-Side Table with "Not stated" Badges');
imagepng($im3, $assetsDir.'/screenshot-3.png');
imagedestroy($im3);
echo "✓ screenshot-3.png generated\n";

// -------------------------------------------------------------
// SCREENSHOT 4: Quick Verdict, Best-For & Key Differences (1280x800)
// -------------------------------------------------------------
$im4 = imagecreatetruecolor(1280, 800);
imagefilledrectangle($im4, 0, 0, 1280, 800, $bg1);
imagefilledellipse($im4, 640, 300, 850, 500, hexColor($im4, '#312e81'));

drawBrowserFrame($im4, 'AI Verdict & Best-For Analysis', 'chrome-extension://compare-anything/results.html#verdict', 1200, 640, 40, 40, $fontRegular, $fontBold);

$vX = 70;
$vY = 100;

// Best Overall Hero Card
drawRoundedRect($im4, $vX, $vY + 15, 1140, 130, 12, hexColor($im4, '#1e3a8a'));
drawRoundedRect($im4, $vX + 2, $vY + 17, 1136, 126, 10, hexColor($im4, '#0f172a'));

imagettftext($im4, 11, 0, $vX + 25, $vY + 45, hexColor($im4, '#38bdf8'), $fontBold, '👑 QUICK VERDICT & BEST OVERALL');
imagettftext($im4, 18, 0, $vX + 25, $vY + 80, $textWhite, $fontBold, 'ASUS Vivobook 15 X1504VA — Recommended for Programming');
imagettftext($im4, 11, 0, $vX + 25, $vY + 115, $textGray, $fontRegular, 'Reason: Only model featuring 16GB RAM out of the box and 13th Gen CPU, ideal for Docker and IDEs under Tk 80,000.');

// Best-For Cards Grid
$bfY = $vY + 165;
imagettftext($im4, 13, 0, $vX, $bfY + 20, $textWhite, $fontBold, 'Category Highlights ("Best For")');

$bestForCards = [
    ['Best Value Under Budget', 'Lenovo IdeaPad Slim 3', 'Lowest price (Tk 71,900) while still offering full 2-year warranty.'],
    ['Best Pure Performance', 'ASUS Vivobook 15', 'Doubles the RAM (16GB) and faster 13th Gen Intel Core i5 processor.'],
    ['Best Portability & Travel', 'Lenovo IdeaPad Slim 3', 'Lightest weight at 1.63kg with 45Whr long-lasting battery.'],
];

foreach ($bestForCards as $idx => $bc) {
    $bcX = $vX + ($idx * 390);
    drawRoundedRect($im4, $bcX, $bfY + 35, 360, 120, 10, hexColor($im4, '#1e293b'));
    imagettftext($im4, 10, 0, $bcX + 20, $bfY + 62, hexColor($im4, '#34d399'), $fontBold, '★ '.$bc[0]);
    imagettftext($im4, 12, 0, $bcX + 20, $bfY + 90, $textWhite, $fontBold, $bc[1]);
    imagettftext($im4, 9, 0, $bcX + 20, $bfY + 120, $textGray, $fontRegular, $bc[2]);
}

// Key Differences Card
$kdY = $bfY + 180;
drawRoundedRect($im4, $vX, $kdY, 1140, 140, 10, hexColor($im4, '#1e293b'));
imagettftext($im4, 12, 0, $vX + 25, $kdY + 30, $textWhite, $fontBold, 'Key Differences & Trade-offs:');
imagettftext($im4, 10, 0, $vX + 25, $kdY + 60, $textGray, $fontRegular, '• Memory Gap: ASUS offers 16GB RAM; Lenovo and HP include only 8GB, requiring aftermarket upgrade.');
imagettftext($im4, 10, 0, $vX + 25, $kdY + 85, $textGray, $fontRegular, '• CPU Generation: ASUS runs 13th Gen Intel (i5-1335U), whereas Lenovo and HP are 12th Gen (i5-1235U).');
imagettftext($im4, 10, 0, $vX + 25, $kdY + 110, $textGray, $fontRegular, '• Missing Information: Star Tech does not provide weight; Techland does not declare battery capacity.');

// Bottom Banner
drawRoundedRect($im4, 140, 705, 1000, 65, 14, hexColor($im4, '#3b82f6'));
drawRoundedRect($im4, 142, 707, 996, 61, 12, $bannerBg);
imagettftext($im4, 15, 0, 240, 745, $textWhite, $fontBold, 'STEP 4: Clear AI Verdicts, Best-For Highlights & Key Trade-offs');
imagepng($im4, $assetsDir.'/screenshot-4.png');
imagedestroy($im4);
echo "✓ screenshot-4.png generated\n";

// -------------------------------------------------------------
// SCREENSHOT 5: Copy Comparison & CSV Export (1280x800)
// -------------------------------------------------------------
$im5 = imagecreatetruecolor(1280, 800);
imagefilledrectangle($im5, 0, 0, 1280, 800, $bg1);
imagefilledellipse($im5, 640, 300, 850, 500, hexColor($im5, '#1e1b4b'));

drawBrowserFrame($im5, 'Export & Share Decisions', 'chrome-extension://compare-anything/results.html#actions', 1200, 640, 40, 40, $fontRegular, $fontBold);

$eX = 70;
$eY = 105;

// Actions Bar
drawRoundedRect($im5, $eX, $eY, 1140, 65, 10, hexColor($im5, '#1e293b'));
imagettftext($im5, 12, 0, $eX + 25, $eY + 40, $textWhite, $fontBold, 'Export & Actions:');

// Action Buttons
drawRoundedRect($im5, $eX + 200, $eY + 12, 220, 40, 6, hexColor($im5, '#2563eb'));
imagettftext($im5, 11, 0, $eX + 225, $eY + 38, $textWhite, $fontBold, '📋 Copy Comparison');

drawRoundedRect($im5, $eX + 440, $eY + 12, 200, 40, 6, hexColor($im5, '#059669'));
imagettftext($im5, 11, 0, $eX + 465, $eY + 38, $textWhite, $fontBold, '📥 Download CSV');

drawRoundedRect($im5, $eX + 660, $eY + 12, 230, 40, 6, hexColor($im5, '#334155'));
imagettftext($im5, 11, 0, $eX + 685, $eY + 38, $textWhite, $fontBold, '🔄 New Comparison');

// Formatted Markdown Export Preview
drawRoundedRect($im5, $eX, $eY + 85, 1140, 390, 12, hexColor($im5, '#0f172a'));
drawRoundedRect($im5, $eX, $eY + 85, 1140, 40, 10, hexColor($im5, '#1e293b'));
imagettftext($im5, 11, 0, $eX + 25, $eY + 110, $textGray, $fontBold, 'Markdown Export Output Preview (Ready to paste in Slack / Notion / Email)');

$mdLines = [
    '# Laptop Comparison: ASUS Vivobook 15 vs Lenovo IdeaPad Slim 3 vs HP 15s',
    '**Goal:** Best for programming under Tk 80,000',
    '',
    '## 👑 Quick Verdict',
    '**Best Overall:** ASUS Vivobook 15 X1504VA',
    'Reason: Highest memory specification (16GB DDR4) and latest 13th Gen CPU for under Tk 80,000.',
    '',
    '## 📊 Comparison Table',
    '| Specification | ASUS Vivobook 15 | Lenovo IdeaPad Slim 3 | HP 15s-fq5321TU |',
    '| :--- | :--- | :--- | :--- |',
    '| **Price** | Tk 74,500 | **Tk 71,900 (Lowest)** | Tk 76,000 |',
    '| **Processor** | **Intel i5-1335U (13th Gen)** | Intel i5-1235U | Intel i5-1235U |',
    '| **RAM** | **16GB DDR4 (Winner)** | 8GB DDR4 | 8GB DDR4 |',
    '| **Weight** | *Not stated* | 1.63 kg | 1.69 kg |',
];

$mY = $eY + 150;
foreach ($mdLines as $line) {
    imagettftext($im5, 9, 0, $eX + 30, $mY, hexColor($im5, '#38bdf8'), $fontMono, $line);
    $mY += 21;
}

// Bottom Banner
drawRoundedRect($im5, 140, 705, 1000, 65, 14, hexColor($im5, '#3b82f6'));
drawRoundedRect($im5, 142, 707, 996, 61, 12, $bannerBg);
imagettftext($im5, 15, 0, 260, 745, $textWhite, $fontBold, 'STEP 5: Instant 1-Click Export to Markdown, CSV, or Shareable Text');
imagepng($im5, $assetsDir.'/screenshot-5.png');
imagedestroy($im5);
echo "✓ screenshot-5.png generated\n";

// -------------------------------------------------------------
// PROMO TILE: Small Promo Tile (440x280)
// -------------------------------------------------------------
$imP = imagecreatetruecolor(440, 280);
$bgP = hexColor($imP, '#090d16');
imagefilledrectangle($imP, 0, 0, 440, 280, $bgP);

// Diagonal / radiant background glow
imagefilledellipse($imP, 360, 60, 240, 240, hexColor($imP, '#1e1b4b'));
imagefilledellipse($imP, 80, 220, 200, 200, hexColor($imP, '#172554'));

// Card border
drawRoundedRect($imP, 10, 10, 420, 260, 14, hexColor($imP, '#2563eb'));
drawRoundedRect($imP, 12, 12, 416, 256, 12, hexColor($imP, '#0f172a'));

// Extension Badge & Icon
drawRoundedRect($imP, 30, 30, 48, 48, 10, hexColor($imP, '#2563eb'));
imagettftext($imP, 20, 0, 43, 64, $textWhite, $fontBold, '⇄');

imagettftext($imP, 17, 0, 90, 52, $textWhite, $fontBold, 'Compare Anything');
imagettftext($imP, 9, 0, 90, 70, hexColor($imP, '#38bdf8'), $fontBold, 'AI-POWERED TAB COMPARISON');

// Tagline
imagettftext($imP, 13, 0, 30, 120, $textWhite, $fontBold, 'Stop switching between tabs.');
imagettftext($imP, 13, 0, 30, 145, hexColor($imP, '#38bdf8'), $fontBold, 'Compare them side-by-side.');

// Feature pills
$pills = [
    ['2–4 Tabs Side-by-Side', '#1e293b', '#94a3b8'],
    ['Zero Hallucinations', '#064e3b', '#34d399'],
    ['No Sign-Up Needed', '#1e293b', '#94a3b8'],
];

$pillY = 175;
$pillX = 30;
foreach ($pills as $p) {
    $pLen = strlen($p[0]) * 7 + 20;
    drawRoundedRect($imP, $pillX, $pillY, $pLen, 24, 6, hexColor($imP, $p[1]));
    imagettftext($imP, 8, 0, $pillX + 10, $pillY + 16, hexColor($imP, $p[2]), $fontBold, $p[0]);
    $pillX += $pLen + 8;
}

// CTA button mockup
drawRoundedRect($imP, 30, 218, 380, 36, 8, hexColor($imP, '#2563eb'));
imagettftext($imP, 11, 0, 135, 241, $textWhite, $fontBold, 'FREE CHROME EXTENSION');

imagepng($imP, $assetsDir.'/promo-440x280.png');
imagedestroy($imP);
echo "✓ promo-440x280.png generated\n";

echo "\n🎉 All Store Assets generated successfully!\n";
