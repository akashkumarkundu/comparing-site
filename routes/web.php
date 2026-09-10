<?php

use App\Http\Controllers\Admin\MetricsController;
use Illuminate\Support\Facades\Route;

Route::view('/', 'welcome')->name('home');
Route::view('/privacy', 'privacy')->name('privacy');
Route::view('/support', 'support')->name('support');
Route::view('/truth-sheet', 'truth-sheet')->name('truth-sheet');
Route::get('/admin/metrics', [MetricsController::class, 'index'])->name('admin.metrics');

Route::get('/download-extension', function () {
    $zipPath = base_path('extension/compare-anything-extension.zip');
    if (! file_exists($zipPath)) {
        abort(404, 'Extension package not found. Please build it first.');
    }

    return response()->download($zipPath, 'compare-anything-extension.zip', [
        'Content-Type' => 'application/zip',
    ]);
})->name('extension.download');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::view('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
