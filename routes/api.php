<?php

declare(strict_types=1);

use App\Http\Controllers\Api\ComparisonController;
use App\Http\Middleware\ComparisonRateLimiter;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::post('/compare', [ComparisonController::class, 'compare'])
        ->middleware(ComparisonRateLimiter::class)
        ->name('api.v1.compare');
});
