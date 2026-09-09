<?php

declare(strict_types=1);

use App\DTOs\ComparisonResultDTO;
use App\Services\AI\Contracts\IAIProvider;
use App\Services\ComparisonService;

beforeEach(function (): void {
    $this->fixtures = json_decode(
        file_get_contents(base_path('tests/Fixtures/categories-truth-sheet.json')),
        true
    )['categories'];
});

test('Quality Benchmark: verifies comparison payload structure for all 6 core categories', function (): void {
    $categories = ['products', 'saas', 'jobs', 'education', 'services', 'articles'];

    foreach ($categories as $catKey) {
        $catData = $this->fixtures[$catKey];
        $payload = [
            'installId' => 'benchmark-tester-guid-001',
            'goal' => $catData['goal'],
            'pages' => $catData['pages'],
        ];

        // Ensure payload is valid for FormRequest
        expect($payload['pages'])->toHaveCount(2);
        expect($payload['installId'])->toBeString();
        expect($payload['goal'])->toBeString();

        foreach ($payload['pages'] as $page) {
            expect($page)->toHaveKeys(['id', 'url', 'domain', 'title', 'importantText']);
            expect(filter_var($page['url'], FILTER_VALIDATE_URL))->not->toBeFalse();
        }
    }
});

test('Scale Test: supports 3-page comparison seamlessly', function (): void {
    $threePageData = $this->fixtures['threePages'];

    $mockResult = ComparisonResultDTO::fromArray([
        'comparisonTitle' => 'ASUS Vivobook vs Lenovo IdeaPad vs HP Pavilion',
        'comparisonType' => 'Laptop',
        'goal' => $threePageData['goal'],
        'items' => [
            ['id' => 'p-1', 'displayName' => 'ASUS Vivobook 15'],
            ['id' => 'p-2', 'displayName' => 'Lenovo IdeaPad 5'],
            ['id' => 'p-3', 'displayName' => 'HP Pavilion 15'],
        ],
        'criteria' => [
            [
                'name' => 'Price',
                'importance' => 'high',
                'values' => [
                    ['itemId' => 'p-1', 'value' => 'Tk 74,500', 'confidence' => 'high'],
                    ['itemId' => 'p-2', 'value' => 'Tk 78,000', 'confidence' => 'high'],
                    ['itemId' => 'p-3', 'value' => 'Tk 81,500', 'confidence' => 'high'],
                ],
                'winnerItemIds' => ['p-1'],
            ],
            [
                'name' => 'RAM',
                'importance' => 'high',
                'values' => [
                    ['itemId' => 'p-1', 'value' => '16 GB', 'confidence' => 'high'],
                    ['itemId' => 'p-2', 'value' => '16 GB', 'confidence' => 'high'],
                    ['itemId' => 'p-3', 'value' => '8 GB', 'confidence' => 'high'],
                ],
                'winnerItemIds' => ['p-1', 'p-2'],
            ],
        ],
        'bestOverall' => [
            'itemId' => 'p-2',
            'reason' => 'Strongest balance of processor performance and 16GB RAM under budget.',
        ],
        'bestFor' => [
            ['label' => 'Lowest Price', 'itemId' => 'p-1', 'reason' => 'Cheapest at Tk 74,500'],
            ['label' => 'Portability', 'itemId' => 'p-3', 'reason' => 'Lightest at 1.59 kg'],
        ],
        'keyDifferences' => [
            'HP Pavilion has only 8GB RAM compared to 16GB on ASUS and Lenovo.',
            'ASUS is the only option under Tk 75,000.',
        ],
        'missingInformation' => [
            ['itemId' => 'p-1', 'fields' => ['Weight']],
        ],
    ]);

    $mockProvider = Mockery::mock(IAIProvider::class);
    $mockProvider->shouldReceive('compare')->once()->andReturn($mockResult);
    $this->app->instance(ComparisonService::class, new ComparisonService($mockProvider));

    $response = $this->postJson('/api/v1/compare', [
        'installId' => 'scale-test-guid-3p',
        'goal' => $threePageData['goal'],
        'pages' => $threePageData['pages'],
    ]);

    $response->assertStatus(200)
        ->assertJsonPath('success', true)
        ->assertJsonCount(3, 'data.items')
        ->assertJsonCount(3, 'data.criteria.0.values');
});

test('Scale Test: supports 4-page comparison (maximum supported limit)', function (): void {
    $fourPageData = $this->fixtures['fourPages'];

    $mockResult = ComparisonResultDTO::fromArray([
        'comparisonTitle' => '4-Way Laptop Comparison',
        'comparisonType' => 'Laptop',
        'goal' => $fourPageData['goal'],
        'items' => [
            ['id' => 'p-1', 'displayName' => 'ASUS Vivobook 15'],
            ['id' => 'p-2', 'displayName' => 'Lenovo IdeaPad 5'],
            ['id' => 'p-3', 'displayName' => 'HP Pavilion 15'],
            ['id' => 'p-4', 'displayName' => 'Dell Inspiron 15'],
        ],
        'criteria' => [
            [
                'name' => 'Price',
                'importance' => 'high',
                'values' => [
                    ['itemId' => 'p-1', 'value' => 'Tk 74,500', 'confidence' => 'high'],
                    ['itemId' => 'p-2', 'value' => 'Tk 78,000', 'confidence' => 'high'],
                    ['itemId' => 'p-3', 'value' => 'Tk 81,500', 'confidence' => 'high'],
                    ['itemId' => 'p-4', 'value' => 'Tk 84,000', 'confidence' => 'high'],
                ],
                'winnerItemIds' => ['p-1'],
            ],
        ],
        'bestOverall' => ['itemId' => 'p-2', 'reason' => 'Balanced'],
        'bestFor' => [],
        'keyDifferences' => [],
        'missingInformation' => [],
    ]);

    $mockProvider = Mockery::mock(IAIProvider::class);
    $mockProvider->shouldReceive('compare')->once()->andReturn($mockResult);
    $this->app->instance(ComparisonService::class, new ComparisonService($mockProvider));

    $response = $this->postJson('/api/v1/compare', [
        'installId' => 'scale-test-guid-4p',
        'goal' => $fourPageData['goal'],
        'pages' => $fourPageData['pages'],
    ]);

    $response->assertStatus(200)
        ->assertJsonPath('success', true)
        ->assertJsonCount(4, 'data.items')
        ->assertJsonCount(4, 'data.criteria.0.values');
});
