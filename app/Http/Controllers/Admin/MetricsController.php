<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ComparisonMetric;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\View\View;

final class MetricsController extends Controller
{
    /**
     * Display the anonymous product metrics admin dashboard (PDF Pages 29-30).
     */
    public function index(): View
    {
        $metrics = $this->calculateMetrics();

        return view('admin.metrics', $metrics);
    }

    /**
     * Return anonymous summary metrics as JSON.
     */
    public function summary(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->calculateMetrics(),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function calculateMetrics(): array
    {
        $today = today();

        $usersToday = ComparisonMetric::whereDate('created_at', $today)
            ->distinct('install_id_hash')
            ->count('install_id_hash');

        $comparisonsToday = ComparisonMetric::whereDate('created_at', $today)->count();
        $totalComparisons = ComparisonMetric::count();
        $successfulCount = ComparisonMetric::where('is_successful', true)->count();
        $failedCount = ComparisonMetric::where('is_successful', false)->count();

        $successRate = $totalComparisons > 0
            ? round(($successfulCount / $totalComparisons) * 100, 1)
            : 100.0;

        $averagePages = round((float) ComparisonMetric::avg('pages_count'), 1) ?: 2.0;
        $avgDurationMs = (int) round((float) ComparisonMetric::whereNotNull('duration_ms')->avg('duration_ms'));

        $commonCategories = ComparisonMetric::whereNotNull('category')
            ->select('category', DB::raw('count(*) as count'))
            ->groupBy('category')
            ->orderByDesc('count')
            ->limit(6)
            ->get();

        $recentComparisons = ComparisonMetric::latest()
            ->limit(12)
            ->get();

        return [
            'usersToday' => $usersToday,
            'comparisonsToday' => $comparisonsToday,
            'totalComparisons' => $totalComparisons,
            'successfulCount' => $successfulCount,
            'failedCount' => $failedCount,
            'successRate' => $successRate,
            'averagePages' => $averagePages,
            'avgDurationMs' => $avgDurationMs,
            'commonCategories' => $commonCategories,
            'recentComparisons' => $recentComparisons,
        ];
    }
}
