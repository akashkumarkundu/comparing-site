<?php

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\Route;

/**
 * Compare Anything — Production Deployment Readiness Check
 * Run this script before deploying or after pulling code on the live server:
 * php scripts/verify-production-deploy.php
 */

require __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

$total = 0;
$passed = 0;

function report(bool $status, string $label, string $hint = ''): void
{
    global $total, $passed;
    $total++;
    if ($status) {
        $passed++;
        echo "  [PASS] {$label}\n";
    } else {
        echo "  [WARN/FAIL] {$label}".($hint ? " — Hint: {$hint}" : '')."\n";
    }
}

echo "=================================================================\n";
echo "    COMPARE ANYTHING — PRODUCTION DEPLOYMENT READINESS CHECK     \n";
echo "=================================================================\n\n";

echo "--- 1. PHP & Environment ---\n";
report(version_compare(PHP_VERSION, '8.2.0', '>='), 'PHP Version >= 8.2 (Current: '.PHP_VERSION.')');
report(extension_loaded('curl'), 'curl extension loaded');
report(extension_loaded('json'), 'json extension loaded');
report(extension_loaded('mbstring'), 'mbstring extension loaded');
report(extension_loaded('pdo'), 'pdo extension loaded');

echo "\n--- 2. Laravel Configuration & Security ---\n";
report(! empty(config('app.key')), 'APP_KEY is generated and configured');
$groqKey = config('ai.providers.groq.api_key');
$openRouterKey = config('ai.providers.openrouter.api_key');
$hasKey = (! empty($groqKey) && ! str_starts_with($groqKey, 'your_')) || (! empty($openRouterKey) && ! str_starts_with($openRouterKey, 'your_'));
report($hasKey, 'AI API key (GROQ_API_KEY or OPENROUTER_API_KEY) is configured');

echo "\n--- 3. Extension Packaging & Public Assets ---\n";
$zipPath = base_path('extension/compare-anything-extension.zip');
report(file_exists($zipPath), 'Production extension ZIP package exists ('.(file_exists($zipPath) ? round(filesize($zipPath) / 1024, 1).' KB' : '').')');
$iconsExist = file_exists(base_path('extension/public/icons/icon128.png'))
    && file_exists(base_path('extension/store-assets/icon128.png'));
report($iconsExist, 'Extension icons (128x128) are in place');

echo "\n--- 4. Essential Web & Legal Routes ---\n";
$routes = collect(Route::getRoutes()->getRoutes());
$hasHome = $routes->contains(fn ($r) => $r->uri() === '/');
$hasPrivacy = $routes->contains(fn ($r) => $r->uri() === 'privacy');
$hasSupport = $routes->contains(fn ($r) => $r->uri() === 'support');
$hasCompareApi = $routes->contains(fn ($r) => $r->uri() === 'api/v1/compare');
$hasDownload = $routes->contains(fn ($r) => $r->uri() === 'download-extension');

report($hasHome, 'Home / Landing page route (/) is registered');
report($hasPrivacy, 'Privacy Policy route (/privacy) is registered');
report($hasSupport, 'Support & FAQ route (/support) is registered');
report($hasCompareApi, 'Compare API route (POST /api/v1/compare) is registered');
report($hasDownload, 'Direct extension download route (/download-extension) is registered');

echo "\n=================================================================\n";
echo "  SUMMARY: {$passed} / {$total} CHECKS PASSED\n";
echo "=================================================================\n";

if ($passed === $total) {
    echo "🎉 System is 100% READY for Production Deployment!\n\n";
    exit(0);
} else {
    echo "⚠️ Review the warnings above before launching in production.\n\n";
    exit(0);
}
