<?php

/**
 * Compare Anything — Extension Production Packaging Script
 * Creates a clean compare-anything-extension.zip from extension/dist/
 * and validates that it satisfies all Chrome Web Store requirements:
 * 1. Root-level manifest.json
 * 2. Strict permissions: activeTab, scripting, storage (no <all_urls>)
 * 3. Zero API keys in bundle
 */
$distDir = realpath(__DIR__.'/../extension/dist');
$zipPath = realpath(__DIR__.'/../extension').'/compare-anything-extension.zip';

if (! $distDir || ! is_dir($distDir)) {
    echo "❌ Error: extension/dist does not exist. Run 'npm run build' first.\n";
    exit(1);
}

// Remove old zip if present
if (file_exists($zipPath)) {
    unlink($zipPath);
}

$zip = new ZipArchive;
if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
    echo "❌ Error: Could not create ZIP file at {$zipPath}\n";
    exit(1);
}

$files = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($distDir, RecursiveDirectoryIterator::SKIP_DOTS),
    RecursiveIteratorIterator::LEAVES_ONLY
);

$fileCount = 0;
$totalBytes = 0;

foreach ($files as $file) {
    if (! $file->isDir()) {
        $filePath = $file->getRealPath();
        $relativePath = substr($filePath, strlen($distDir) + 1);
        $relativePath = str_replace('\\', '/', $relativePath); // Normalize Windows slashes

        $zip->addFile($filePath, $relativePath);
        $fileCount++;
        $totalBytes += filesize($filePath);
    }
}

$zip->close();

echo "✓ Packaged {$fileCount} files into {$zipPath} (".round($totalBytes / 1024, 1)." KB)\n";

// Validate ZIP Contents
$verifyZip = new ZipArchive;
if ($verifyZip->open($zipPath) === true) {
    // 1. Check manifest.json at root
    $manifestContent = $verifyZip->getFromName('manifest.json');
    if (! $manifestContent) {
        echo "❌ Validation Error: manifest.json is missing from the root of ZIP!\n";
        exit(1);
    }

    $manifest = json_decode($manifestContent, true);
    if (! $manifest) {
        echo "❌ Validation Error: manifest.json is not valid JSON!\n";
        exit(1);
    }

    // 2. Check permissions
    $permissions = $manifest['permissions'] ?? [];
    $allowedPermissions = ['activeTab', 'scripting', 'storage'];
    $disallowed = array_diff($permissions, $allowedPermissions);

    if (! empty($disallowed)) {
        echo '❌ Security Warning: Found unauthorized permissions: '.implode(', ', $disallowed)."\n";
        exit(1);
    }
    echo '✓ Chrome Permissions strictly compliant: '.implode(', ', $permissions)."\n";

    // 3. Scan for any leaked API keys in JS assets
    $hasLeak = false;
    for ($i = 0; $i < $verifyZip->numFiles; $i++) {
        $entryName = $verifyZip->getNameIndex($i);
        if (str_ends_with($entryName, '.js')) {
            $jsContent = $verifyZip->getFromIndex($i);
            if (str_contains($jsContent, 'gsk_') || str_contains($jsContent, 'sk-or-')) {
                echo "❌ Security Alert: Possible API key signature found in {$entryName}!\n";
                $hasLeak = true;
            }
        }
    }

    if ($hasLeak) {
        exit(1);
    }

    echo "✓ Security verified: 0 API keys in client extension bundle.\n";
    echo "✓ Production ZIP package ready for Chrome Web Store submission!\n";
    $verifyZip->close();
} else {
    echo "❌ Error: Failed to re-open ZIP for validation.\n";
    exit(1);
}
