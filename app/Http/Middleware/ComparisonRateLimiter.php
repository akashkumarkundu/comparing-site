<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

final class ComparisonRateLimiter
{
    /**
     * Handle incoming request and enforce installation and IP rate limits.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $installId = $request->input('installId');
        $ip = $request->ip() ?? '127.0.0.1';

        $dailyLimit = (int) config('ai.rate_limit.per_install_per_day', 10);
        $ipHourlyLimit = (int) config('ai.rate_limit.per_ip_per_hour', 30);

        // 1. IP Rate Limiting (Hourly)
        $ipKey = 'rate_limit:ip:'.date('Y-m-d-H').':'.sha1($ip);
        $ipUsage = (int) Cache::get($ipKey, 0);
        if ($ipUsage >= $ipHourlyLimit) {
            return response()->json([
                'success' => false,
                'message' => "Today's free comparison limit has been reached. Please try again later.",
            ], Response::HTTP_TOO_MANY_REQUESTS);
        }

        // 2. Install ID Rate Limiting (Daily - SPEC Section 27)
        $installKey = null;
        if (is_string($installId) && trim($installId) !== '') {
            $installKey = 'rate_limit:install:'.date('Y-m-d').':'.sha1(trim($installId));
            $installUsage = (int) Cache::get($installKey, 0);

            if ($installUsage >= $dailyLimit) {
                return response()->json([
                    'success' => false,
                    'message' => "Today's free comparison limit has been reached. Please try again later.",
                ], Response::HTTP_TOO_MANY_REQUESTS);
            }
        }

        /** @var Response $response */
        $response = $next($request);

        // Increment count only on successful comparisons
        if ($response->isSuccessful()) {
            Cache::put($ipKey, $ipUsage + 1, now()->addHour());
            if ($installKey !== null) {
                $currentInstallUsage = (int) Cache::get($installKey, 0);
                Cache::put($installKey, $currentInstallUsage + 1, now()->endOfDay());
            }
        }

        return $response;
    }
}
