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

final class OpenRouterProvider implements IAIProvider
{
    private string $apiKey;

    private string $model;

    private string $baseUrl;

    private int $timeout;

    private int $retry;

    public function __construct()
    {
        $this->apiKey = (string) config('ai.providers.openrouter.api_key', '');
        $this->model = (string) config('ai.providers.openrouter.model', 'meta-llama/llama-3.3-70b-instruct');
        $this->baseUrl = rtrim((string) config('ai.providers.openrouter.base_url', 'https://openrouter.ai/api/v1'), '/');
        $this->timeout = (int) config('ai.providers.openrouter.timeout', 45);
        $this->retry = (int) config('ai.providers.openrouter.retry', 2);
    }

    public function compare(CompareRequestDTO $request): ComparisonResultDTO
    {
        if ($this->apiKey === '') {
            Log::error('Compare Anything: OpenRouter API key is missing in environment.');
            throw new HttpResponseException(response()->json([
                'success' => false,
                'message' => 'AI provider configuration error: OPENROUTER_API_KEY is not set.',
            ], HttpResponse::HTTP_SERVICE_UNAVAILABLE));
        }

        $systemPrompt = ComparisonPromptBuilder::buildSystemPrompt();
        $userMessage = ComparisonPromptBuilder::buildUserMessage($request);

        $payload = [
            'model' => $this->model,
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
            'response_format' => [
                'type' => 'json_object',
            ],
        ];

        try {
            /** @var Response $response */
            $response = Http::withToken($this->apiKey)
                ->withHeaders([
                    'HTTP-Referer' => config('app.url', 'http://localhost'),
                    'X-Title' => 'Compare Anything Extension',
                ])
                ->timeout($this->timeout)
                ->retry($this->retry, 500, throw: false)
                ->post("{$this->baseUrl}/chat/completions", $payload);
        } catch (ConnectionException $e) {
            Log::error('OpenRouter connection timeout/failure: '.$e->getMessage());
            throw new HttpResponseException(response()->json([
                'success' => false,
                'message' => 'Comparison couldn\'t be generated. Please try again.',
            ], HttpResponse::HTTP_GATEWAY_TIMEOUT));
        } catch (Exception $e) {
            Log::error('OpenRouter unexpected error: '.$e->getMessage());
            throw new HttpResponseException(response()->json([
                'success' => false,
                'message' => 'Comparison couldn\'t be generated. Please try again.',
            ], HttpResponse::HTTP_INTERNAL_SERVER_ERROR));
        }

        if ($response->status() === HttpResponse::HTTP_TOO_MANY_REQUESTS) {
            throw new HttpResponseException(response()->json([
                'success' => false,
                'message' => 'Free AI capacity is temporarily unavailable.',
            ], HttpResponse::HTTP_TOO_MANY_REQUESTS));
        }

        if (! $response->successful()) {
            Log::error('OpenRouter API returned error status: '.$response->status().' Body: '.$response->body());
            throw new HttpResponseException(response()->json([
                'success' => false,
                'message' => 'Comparison couldn\'t be generated. Please try again.',
            ], HttpResponse::HTTP_BAD_GATEWAY));
        }

        $rawJson = $response->json();
        $content = $rawJson['choices'][0]['message']['content'] ?? null;

        if (! is_string($content) || trim($content) === '') {
            throw new HttpResponseException(response()->json([
                'success' => false,
                'message' => 'Comparison couldn\'t be generated. Please try again.',
            ], HttpResponse::HTTP_INTERNAL_SERVER_ERROR));
        }

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
            throw new HttpResponseException(response()->json([
                'success' => false,
                'message' => 'Comparison couldn\'t be generated. Please try again.',
            ], HttpResponse::HTTP_INTERNAL_SERVER_ERROR));
        }

        return ComparisonResultDTO::fromArray($decoded);
    }
}
