<?php

declare(strict_types=1);

namespace App\Services;

use App\DTOs\CompareRequestDTO;
use App\DTOs\ComparisonResultDTO;
use App\Services\AI\Contracts\AIProviderInterface;
use App\Services\AI\Providers\GroqProvider;
use App\Services\AI\Providers\MockProvider;
use App\Services\AI\Providers\OpenRouterProvider;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

final class ComparisonService
{
    public function __construct(
        private ?AIProviderInterface $aiProvider = null,
    ) {
        if ($this->aiProvider === null) {
            $default = config('ai.default', 'groq');
            $this->aiProvider = match ($default) {
                'openrouter' => app(OpenRouterProvider::class),
                'mock' => app(MockProvider::class),
                default => app(GroqProvider::class),
            };
        }
    }

    public function compare(CompareRequestDTO $request): ComparisonResultDTO
    {
        $requestId = (string) Str::uuid();
        $startTime = microtime(true);
        $providerName = config('ai.default', 'groq');
        $modelName = (string) config("ai.providers.{$providerName}.model", 'unknown');
        $installIdHash = hash('sha256', $request->installId);
        $pageCount = count($request->pages);

        try {
            $result = $this->aiProvider->compare($request);
            $durationMs = (int) round((microtime(true) - $startTime) * 1000);

            // SPEC Section 26: Safe server metrics logging (NO private page content or text)
            Log::info('Compare operation completed', [
                'requestId' => $requestId,
                'installIdHash' => substr($installIdHash, 0, 12),
                'numberOfPages' => $pageCount,
                'durationMs' => $durationMs,
                'aiProvider' => $providerName,
                'model' => $modelName,
                'success' => true,
                'httpStatus' => 200,
            ]);

            return $result;
        } catch (Throwable $e) {
            $durationMs = (int) round((microtime(true) - $startTime) * 1000);

            Log::error('Compare operation failed', [
                'requestId' => $requestId,
                'installIdHash' => substr($installIdHash, 0, 12),
                'numberOfPages' => $pageCount,
                'durationMs' => $durationMs,
                'aiProvider' => $providerName,
                'model' => $modelName,
                'success' => false,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
