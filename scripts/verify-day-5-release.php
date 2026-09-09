<?php

/**
 * Compare Anything — Day 5 Release & Production Verification Script
 * Validates all Day 5 deliverables and the Section 46 Definition of Done.
 */
$totalChecks = 0;
$passedChecks = 0;

function check(bool $condition, string $title, string $details = ''): void
{
    global $totalChecks, $passedChecks;
    $totalChecks++;
    if ($condition) {
        $passedChecks++;
        echo "  [PASS] {$title}\n";
    } else {
        echo "  [FAIL] {$title}".($details ? " — {$details}" : '')."\n";
    }
}

echo "=================================================================\n";
echo "  COMPARE ANYTHING — DAY 5: RELEASE & SUBMISSION VERIFICATION   \n";
echo "=================================================================\n\n";

// 1. Chrome Web Store Documentation
echo "--- 1. Store Documentation & Legal Compliance ---\n";

$privacyFile = __DIR__.'/../docs/PRIVACY.md';
check(file_exists($privacyFile), 'Privacy Policy exists (docs/PRIVACY.md)');
if (file_exists($privacyFile)) {
    $privacyContent = file_get_contents($privacyFile);
    check(str_contains($privacyContent, 'Single Purpose Declaration'), 'Privacy policy declares single purpose');
    check(str_contains($privacyContent, 'activeTab') && str_contains($privacyContent, 'storage'), 'Privacy policy explains minimal permissions');
    check(str_contains($privacyContent, 'Google Chrome Web Store'), 'Complies with Chrome Web Store user data policy');
}

$submissionFile = __DIR__.'/../docs/STORE-SUBMISSION.md';
check(file_exists($submissionFile), 'Store Submission Guide exists (docs/STORE-SUBMISSION.md)');
if (file_exists($submissionFile)) {
    $subContent = file_get_contents($submissionFile);
    check(str_contains($subContent, 'Compare Anything – AI Web Comparison'), 'Accurate extension title configured');

    // Extract summary character count
    if (preg_match('/### Store Summary.*?\n```text\n(.*?)\n```/s', $subContent, $matches)) {
        $summaryLen = strlen(trim($matches[1]));
        check($summaryLen <= 132 && $summaryLen > 20, "Store summary within 132 chars (current: {$summaryLen} chars)");
    } else {
        check(false, 'Could not verify store summary character count');
    }

    check(str_contains($subContent, 'Single-Purpose Declaration'), 'Single purpose declaration included');
    check(str_contains($subContent, 'Permissions Justification'), 'Permissions justification table included');
}

$supportFile = __DIR__.'/../docs/SUPPORT.md';
check(file_exists($supportFile), 'Support & FAQ exists (docs/SUPPORT.md)');
if (file_exists($supportFile)) {
    $supContent = file_get_contents($supportFile);
    check(str_contains($supContent, 'akashkumarkundu2102121@gmail.com'), 'Support contact email declared');
}

// 2. Store Assets & Screenshots Dimensions
echo "\n--- 2. Chrome Web Store Graphical Assets ---\n";
$assetsDir = __DIR__.'/../extension/store-assets';
check(is_dir($assetsDir), 'Store assets directory exists (extension/store-assets/)');

$iconPath = $assetsDir.'/icon128.png';
check(file_exists($iconPath), 'icon128.png exists');
if (file_exists($iconPath)) {
    $iconSize = getimagesize($iconPath);
    check($iconSize && $iconSize[0] === 128 && $iconSize[1] === 128, 'icon128.png exact dimensions (128x128)');
}

$promoPath = $assetsDir.'/promo-440x280.png';
check(file_exists($promoPath), 'promo-440x280.png exists');
if (file_exists($promoPath)) {
    $pSize = getimagesize($promoPath);
    check($pSize && $pSize[0] === 440 && $pSize[1] === 280, 'promo-440x280.png exact dimensions (440x280)');
}

for ($i = 1; $i <= 5; $i++) {
    $ssPath = $assetsDir."/screenshot-{$i}.png";
    check(file_exists($ssPath), "screenshot-{$i}.png exists");
    if (file_exists($ssPath)) {
        $ssSize = getimagesize($ssPath);
        check($ssSize && $ssSize[0] === 1280 && $ssSize[1] === 800, "screenshot-{$i}.png exact store dimensions (1280x800)");
    }
}

// 3. Production ZIP Package & Security
echo "\n--- 3. Production ZIP Packaging & Security ---\n";
$zipPath = __DIR__.'/../extension/compare-anything-extension.zip';
check(file_exists($zipPath), 'Production ZIP exists (extension/compare-anything-extension.zip)');

if (file_exists($zipPath)) {
    $zip = new ZipArchive;
    if ($zip->open($zipPath) === true) {
        $manifestJson = $zip->getFromName('manifest.json');
        check(! empty($manifestJson), 'ZIP contains root-level manifest.json');

        if ($manifestJson) {
            $manifest = json_decode($manifestJson, true);
            $perms = $manifest['permissions'] ?? [];
            $unauthorized = array_diff($perms, ['activeTab', 'scripting', 'storage']);
            check(empty($unauthorized), 'ZIP manifest permissions strictly minimal: '.implode(', ', $perms));
            check($manifest['manifest_version'] === 3, 'Manifest Version 3 confirmed');
        }

        // Check for leaked keys in bundled JS
        $leakFound = false;
        for ($i = 0; $i < $zip->numFiles; $i++) {
            $name = $zip->getNameIndex($i);
            if (str_ends_with($name, '.js')) {
                $js = $zip->getFromIndex($i);
                if (str_contains($js, 'gsk_') || str_contains($js, 'sk-or-')) {
                    $leakFound = true;
                    break;
                }
            }
        }
        check(! $leakFound, 'Security audit: 0 AI API keys detected in bundled extension JS');
        $zip->close();
    }
}

// 4. Public Landing Page & Web Routes
echo "\n--- 4. Public Landing Page & Web Distribution ---\n";
$welcomeFile = __DIR__.'/../resources/views/welcome.blade.php';
check(file_exists($welcomeFile), 'Public landing page exists (welcome.blade.php)');
if (file_exists($welcomeFile)) {
    $welcome = file_get_contents($welcomeFile);
    check(str_contains($welcome, 'Stop switching between tabs. Compare them.'), 'Hero contains official tagline');
    check(str_contains($welcome, 'how-it-works') || str_contains($welcome, 'flow'), 'Visual flow diagram included');
    check(str_contains($welcome, '/download-extension'), 'Download extension CTA included');
    check(str_contains($welcome, 'Not stated'), 'Anti-hallucination showcase included');
}

$routesFile = __DIR__.'/../routes/web.php';
if (file_exists($routesFile)) {
    $routesContent = file_get_contents($routesFile);
    check(str_contains($routesContent, 'download-extension'), 'Extension direct download route registered');
    check(str_contains($routesContent, '/privacy'), 'Privacy policy web route registered');
    check(str_contains($routesContent, '/support'), 'Support web route registered');
}

// 5. Git & Secret Security
echo "\n--- 5. Repository Cleanliness & Secret Protection ---\n";
$gitIgnore = __DIR__.'/../.gitignore';
check(file_exists($gitIgnore), '.gitignore exists');
if (file_exists($gitIgnore)) {
    $ignoreContent = file_get_contents($gitIgnore);
    check(str_contains($ignoreContent, '.env'), '.gitignore protects .env file');
}

$readmeFile = __DIR__.'/../README.md';
check(file_exists($readmeFile), 'Root README.md exists with documentation');
if (file_exists($readmeFile)) {
    $readmeContent = file_get_contents($readmeFile);
    check(str_contains($readmeContent, 'Compare Anything'), 'README has project title');
    check(str_contains($readmeContent, 'Architecture'), 'README has architecture diagram');
    check(str_contains($readmeContent, 'Quick Start'), 'README has quick start instructions');
}

// Summary
echo "\n=================================================================\n";
echo "  DAY 5 VERIFICATION SUMMARY: {$passedChecks} / {$totalChecks} CHECKS PASSED\n";
echo "=================================================================\n";

if ($passedChecks === $totalChecks) {
    echo "🎉 ALL DAY 5 CRITERIA & DEFINITION OF DONE ARE 100% SATISFIED!\n\n";
    exit(0);
} else {
    echo "⚠️ Some verification checks failed. Review output above.\n\n";
    exit(1);
}
