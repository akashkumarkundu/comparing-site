<?php

declare(strict_types=1);

namespace App\Services\AI\Providers;

use App\DTOs\CompareRequestDTO;
use App\DTOs\ComparisonResultDTO;
use App\Services\AI\Contracts\IAIProvider;
use App\Services\AI\Prompts\ComparisonPromptBuilder;
use Exception;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Response;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

final class GroqProvider implements IAIProvider
{
    private string $apiKey;

    private string $model;

    private string $baseUrl;

    private int $timeout;

    private int $retry;

    public function __construct()
    {
        $this->apiKey = (string) config('ai.providers.groq.api_key', '');
        $this->model = (string) config('ai.providers.groq.model', 'openai/gpt-oss-20b');
        $this->baseUrl = rtrim((string) config('ai.providers.groq.base_url', 'https://api.groq.com/openai/v1'), '/');
        $this->timeout = (int) config('ai.providers.groq.timeout', 45);
        $this->retry = (int) config('ai.providers.groq.retry', 2);
    }

    public function compare(CompareRequestDTO $request): ComparisonResultDTO
    {
        if ($this->apiKey === '') {
            Log::error('Compare Anything: Groq API key is missing in environment.');
            throw new HttpResponseException(response()->json([
                'success' => false,
                'message' => 'AI provider configuration error: GROQ_API_KEY is not set.',
            ], HttpResponse::HTTP_SERVICE_UNAVAILABLE));
        }

        $systemPrompt = ComparisonPromptBuilder::buildSystemPrompt();
        $userMessage = ComparisonPromptBuilder::buildUserMessage($request);

        /** @var list<string> $candidateModels */
        $candidateModels = array_values(array_unique([
            $this->model,
            'openai/gpt-oss-120b',
            'qwen/qwen3.8-27b',
        ]));

        $lastStatus = HttpResponse::HTTP_BAD_GATEWAY;
        $candidateCount = count($candidateModels);

        foreach ($candidateModels as $index => $modelToTry) {
            $payload = [
                'model' => $modelToTry,
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => $systemPrompt,
                    ],
                    [
                        'role' => 'user',
                        'content' => $userMessage,
                    ],
                ],
                'temperature' => 0.1,
                'max_tokens' => 4096,
                'reasoning_format' => 'hidden',
                'reasoning_effort' => 'low',
                'response_format' => [
                    'type' => 'json_object',
                ],
            ];

            try {
                /** @var Response $response */
                $response = Http::withToken($this->apiKey)
                    ->timeout($this->timeout)
                    ->retry($this->retry, 500, throw: false)
                    ->post("{$this->baseUrl}/chat/completions", $payload);
            } catch (ConnectionException $e) {
                Log::error("Groq connection timeout/failure for model {$modelToTry}: ".$e->getMessage());
                $lastStatus = HttpResponse::HTTP_GATEWAY_TIMEOUT;

                continue;
            } catch (Exception $e) {
                Log::error("Groq unexpected request error for model {$modelToTry}: ".$e->getMessage());
                $lastStatus = HttpResponse::HTTP_INTERNAL_SERVER_ERROR;

                continue;
            }

            $lastStatus = $response->status();

            if ($response->status() === HttpResponse::HTTP_TOO_MANY_REQUESTS) {
                Log::warning("Groq rate limit exceeded (HTTP 429) on model {$modelToTry}.");
                if ($index < $candidateCount - 1) {
                    usleep(150000);

                    continue;
                }
                break;
            }

            if (! $response->successful()) {
                Log::error("Groq model {$modelToTry} returned error status: ".$response->status().' Body: '.$response->body());
                if ($index < $candidateCount - 1) {
                    continue;
                }
                break;
            }

            $rawJson = $response->json();
            $content = $rawJson['choices'][0]['message']['content'] ?? null;

            if (! is_string($content) || trim($content) === '') {
                Log::error("Groq model {$modelToTry} returned empty completion content.");
                if ($index < $candidateCount - 1) {
                    continue;
                }
                break;
            }

            // Clean potential markdown blocks if present
            $cleanJson = trim($content);
            if (str_starts_with($cleanJson, '```json')) {
                $cleanJson = preg_replace('/^```json\s*/', '', $cleanJson) ?? $cleanJson;
            }
            if (str_starts_with($cleanJson, '```')) {
                $cleanJson = preg_replace('/^```\s*/', '', $cleanJson) ?? $cleanJson;
            }
            if (str_ends_with($cleanJson, '```')) {
                $cleanJson = preg_replace('/\s*```$/', '', $cleanJson) ?? $cleanJson;
            }

            $decoded = json_decode($cleanJson, true);
            if (! is_array($decoded)) {
                if (preg_match('/\{[\s\S]*\}/', $cleanJson, $matches)) {
                    $decoded = json_decode($matches[0], true);
                }
            }

            if (! is_array($decoded)) {
                Log::error("Failed to decode Groq JSON output for model {$modelToTry}: ".json_last_error_msg().' Raw: '.$content);
                if ($index < $candidateCount - 1) {
                    continue;
                }
                break;
            }

            return ComparisonResultDTO::fromArray($decoded);
        }

        if ($lastStatus === HttpResponse::HTTP_TOO_MANY_REQUESTS) {
            throw new HttpResponseException(response()->json([
                'success' => false,
                'message' => 'Free AI capacity is temporarily unavailable.',
            ], HttpResponse::HTTP_TOO_MANY_REQUESTS));
        }

        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Comparison couldn\'t be generated. Please try again.',
        ], HttpResponse::HTTP_BAD_GATEWAY));
    }
}
