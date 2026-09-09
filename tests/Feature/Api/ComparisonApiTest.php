<?php

declare(strict_types=1);

use App\DTOs\ComparisonResultDTO;
use App\Services\AI\Contracts\AIProviderInterface;
use App\Services\ComparisonService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

function validComparePayload(array $overrides = []): array
{
    return array_merge([
        'installId' => 'test-install-uuid-12345',
        'goal' => 'Best laptop for programming under Tk 80,000',
        'pages' => [
            [
                'id' => 'page-1',
                'url' => 'https://startech.com.bd/asus-vivobook-15',
                'domain' => 'startech.com.bd',
                'title' => 'ASUS Vivobook 15',
                'description' => 'Core i5 13th Gen, 16GB RAM, 512GB SSD',
                'importantText' => 'Price: Tk 74,500. RAM: 16GB. CPU: Core i5-1335U. Storage: 512GB SSD.',
            ],
            [
                'id' => 'page-2',
                'url' => 'https://ryans.com/lenovo-ideapad-5',
                'domain' => 'ryans.com',
                'title' => 'Lenovo IdeaPad 5',
                'description' => 'Ryzen 7 7730U, 16GB RAM, 512GB SSD',
                'importantText' => 'Price: Tk 78,000. RAM: 16GB. CPU: Ryzen 7 7730U. Storage: 512GB SSD.',
            ],
        ],
    ], $overrides);
}

function mockComparisonResult(): ComparisonResultDTO
{
    return ComparisonResultDTO::fromArray([
        'comparisonTitle' => 'ASUS Vivobook 15 vs Lenovo IdeaPad 5',
        'comparisonType' => 'Laptop',
        'goal' => 'Best laptop for programming under Tk 80,000',
        'items' => [
            [
                'id' => 'page-1',
                'displayName' => 'ASUS Vivobook 15',
                'shortDescription' => 'Budget friendly 13th gen intel laptop',
            ],
            [
                'id' => 'page-2',
                'displayName' => 'Lenovo IdeaPad 5',
                'shortDescription' => 'Powerful 8-core Ryzen 7 laptop',
            ],
        ],
        'criteria' => [
            [
                'name' => 'Price',
                'importance' => 'high',
                'values' => [
                    ['itemId' => 'page-1', 'value' => 'Tk 74,500', 'confidence' => 'high'],
                    ['itemId' => 'page-2', 'value' => 'Tk 78,000', 'confidence' => 'high'],
                ],
                'winnerItemIds' => ['page-1'],
            ],
            [
                'name' => 'Processor',
                'importance' => 'high',
                'values' => [
                    ['itemId' => 'page-1', 'value' => 'Core i5-1335U', 'confidence' => 'high'],
                    ['itemId' => 'page-2', 'value' => 'Ryzen 7 7730U', 'confidence' => 'high'],
                ],
                'winnerItemIds' => ['page-2'],
            ],
        ],
        'bestOverall' => [
            'itemId' => 'page-2',
            'reason' => 'Offers the strongest multi-core performance within the budget.',
        ],
        'bestFor' => [
            [
                'label' => 'Programming',
                'itemId' => 'page-2',
                'reason' => 'Faster compilation speed with 8 cores.',
            ],
            [
                'label' => 'Lowest Price',
                'itemId' => 'page-1',
                'reason' => 'Cheaper by Tk 3,500.',
            ],
        ],
        'keyDifferences' => [
            'Lenovo has 8 physical cores vs Intel hybrid architecture.',
            'ASUS is Tk 3,500 cheaper.',
        ],
        'missingInformation' => [
            [
                'itemId' => 'page-1',
                'fields' => ['Weight', 'Battery Capacity'],
            ],
        ],
    ]);
}

beforeEach(function (): void {
    Cache::flush();
});

test('it rejects requests without installId', function (): void {
    $payload = validComparePayload();
    unset($payload['installId']);

    $response = $this->postJson('/api/v1/compare', $payload);

    $response->assertStatus(422)
        ->assertJsonPath('success', false);
});

test('it rejects requests with only 1 page with a friendly error message', function (): void {
    $payload = validComparePayload([
        'pages' => [
            [
                'id' => 'page-1',
                'url' => 'https://example.com/p1',
                'domain' => 'example.com',
                'title' => 'Page 1',
            ],
        ],
    ]);

    $response = $this->postJson('/api/v1/compare', $payload);

    $response->assertStatus(422)
        ->assertJsonPath('success', false)
        ->assertJsonPath('message', 'Add at least one more page to compare.');
});

test('it rejects requests with more than 4 pages', function (): void {
    $pages = [];
    for ($i = 1; $i <= 5; $i++) {
        $pages[] = [
            'id' => "page-{$i}",
            'url' => "https://example.com/p{$i}",
            'domain' => 'example.com',
            'title' => "Page {$i}",
        ];
    }

    $payload = validComparePayload(['pages' => $pages]);

    $response = $this->postJson('/api/v1/compare', $payload);

    $response->assertStatus(422)
        ->assertJsonPath('success', false)
        ->assertJsonPath('message', 'You can compare a maximum of 4 pages.');
});

test('it rejects duplicate URLs with specific friendly error message', function (): void {
    $payload = validComparePayload([
        'pages' => [
            [
                'id' => 'page-1',
                'url' => 'https://example.com/item-a',
                'domain' => 'example.com',
                'title' => 'Item A',
            ],
            [
                'id' => 'page-2',
                'url' => 'https://example.com/item-a', // duplicate!
                'domain' => 'example.com',
                'title' => 'Item A Duplicate',
            ],
        ],
    ]);

    $response = $this->postJson('/api/v1/compare', $payload);

    $response->assertStatus(422)
        ->assertJsonPath('success', false)
        ->assertJsonPath('message', 'This page is already in your comparison.');
});

test('it returns 200 and strict structured comparison result schema', function (): void {
    $mockProvider = Mockery::mock(AIProviderInterface::class);
    $mockProvider->shouldReceive('compare')
        ->once()
        ->andReturn(mockComparisonResult());

    $this->app->instance(ComparisonService::class, new ComparisonService($mockProvider));

    $response = $this->postJson('/api/v1/compare', validComparePayload());

    $response->assertStatus(200)
        ->assertJsonPath('success', true)
        ->assertJsonStructure([
            'success',
            'data' => [
                'comparisonTitle',
                'comparisonType',
                'goal',
                'items' => [
                    '*' => ['id', 'displayName', 'shortDescription'],
                ],
                'criteria' => [
                    '*' => [
                        'name',
                        'importance',
                        'values' => [
                            '*' => ['itemId', 'value', 'confidence'],
                        ],
                        'winnerItemIds',
                    ],
                ],
                'bestOverall' => ['itemId', 'reason'],
                'bestFor' => [
                    '*' => ['label', 'itemId', 'reason'],
                ],
                'keyDifferences',
                'missingInformation' => [
                    '*' => ['itemId', 'fields'],
                ],
            ],
        ]);
});

test('it enforces rate limit of 10 comparisons per day per installation', function (): void {
    $mockProvider = Mockery::mock(AIProviderInterface::class);
    $mockProvider->shouldReceive('compare')
        ->times(10)
        ->andReturn(mockComparisonResult());

    $this->app->instance(ComparisonService::class, new ComparisonService($mockProvider));

    $payload = validComparePayload(['installId' => 'install-daily-quota-user']);

    // Perform 10 successful requests
    for ($i = 1; $i <= 10; $i++) {
        $res = $this->postJson('/api/v1/compare', $payload);
        $res->assertStatus(200);
    }

    // 11th request must be blocked with HTTP 429
    $blocked = $this->postJson('/api/v1/compare', $payload);
    $blocked->assertStatus(429)
        ->assertJsonPath('success', false)
        ->assertJsonPath('message', "Today's free comparison limit has been reached. Please try again later.");
});

test('it handles Groq HTTP 429 capacity limit gracefully', function (): void {
    config([
        'ai.default' => 'groq',
        'ai.providers.groq.api_key' => 'gsk_mock_test_key',
    ]);

    Http::fake([
        'https://api.groq.com/openai/v1/chat/completions' => Http::response([
            'error' => ['message' => 'Rate limit reached for requests'],
        ], 429),
    ]);

    $response = $this->postJson('/api/v1/compare', validComparePayload());

    $response->assertStatus(429)
        ->assertJsonPath('success', false)
        ->assertJsonPath('message', 'Free AI capacity is temporarily unavailable.');
});

test('it handles Groq unexpected API failure gracefully', function (): void {
    config([
        'ai.default' => 'groq',
        'ai.providers.groq.api_key' => 'gsk_mock_test_key',
    ]);

    Http::fake([
        'https://api.groq.com/openai/v1/chat/completions' => Http::response('Service unavailable', 500),
    ]);

    $response = $this->postJson('/api/v1/compare', validComparePayload());

    $response->assertStatus(502)
        ->assertJsonPath('success', false)
        ->assertJsonPath('message', "Comparison couldn't be generated. Please try again.");
});

test('it allows null winner when no defensible winner exists', function (): void {
    $resultNoWinner = ComparisonResultDTO::fromArray([
        'comparisonTitle' => 'Ambiguous comparison',
        'comparisonType' => 'General',
        'goal' => '',
        'items' => [
            ['id' => 'page-1', 'displayName' => 'Item 1', 'shortDescription' => ''],
            ['id' => 'page-2', 'displayName' => 'Item 2', 'shortDescription' => ''],
        ],
        'criteria' => [],
        'bestOverall' => [
            'itemId' => null,
            'reason' => 'The pages do not provide enough comparable information to reliably recommend one option.',
        ],
        'bestFor' => [],
        'keyDifferences' => [],
        'missingInformation' => [],
    ]);

    $mockProvider = Mockery::mock(AIProviderInterface::class);
    $mockProvider->shouldReceive('compare')
        ->once()
        ->andReturn($resultNoWinner);

    $this->app->instance(ComparisonService::class, new ComparisonService($mockProvider));

    $response = $this->postJson('/api/v1/compare', validComparePayload());

    $response->assertStatus(200)
        ->assertJsonPath('data.bestOverall.itemId', null)
        ->assertJsonPath('data.bestOverall.reason', 'The pages do not provide enough comparable information to reliably recommend one option.');
});
