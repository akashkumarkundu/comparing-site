<?php

declare(strict_types=1);

namespace App\Services;

use App\DTOs\CompareRequestDTO;
use App\DTOs\ComparisonResultDTO;
use App\Models\ComparisonMetric;
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

            // SPEC Section 32: Anonymous product metrics persistence
            $this->recordMetric(
                requestId: $requestId,
                installIdHash: $installIdHash,
                pageCount: $pageCount,
                category: $result->comparisonType,
                isSuccessful: true,
                durationMs: $durationMs,
                providerName: $providerName,
                modelName: $modelName,
            );

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

            $this->recordMetric(
                requestId: $requestId,
                installIdHash: $installIdHash,
                pageCount: $pageCount,
                category: null,
                isSuccessful: false,
                durationMs: $durationMs,
                providerName: $providerName,
                modelName: $modelName,
                errorMessage: $e->getMessage(),
            );

            throw $e;
        }
    }

    private function recordMetric(
        string $requestId,
        string $installIdHash,
        int $pageCount,
        ?string $category,
        bool $isSuccessful,
        int $durationMs,
        string $providerName,
        string $modelName,
        ?string $errorMessage = null,
    ): void {
        try {
            ComparisonMetric::create([
                'request_id' => $requestId,
                'install_id_hash' => $installIdHash,
                'pages_count' => $pageCount,
                'category' => $category,
                'is_successful' => $isSuccessful,
                'duration_ms' => $durationMs,
                'ai_provider' => $providerName,
                'model' => $modelName,
                'error_message' => $errorMessage ? substr($errorMessage, 0, 500) : null,
            ]);
        } catch (Throwable $e) {
            // Metrics recording failure should NEVER break comparison flow
            Log::warning('Could not record comparison metric: '.$e->getMessage());
        }
    }
}
