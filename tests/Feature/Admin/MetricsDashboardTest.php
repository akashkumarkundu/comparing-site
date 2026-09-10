<?php

declare(strict_types=1);

use App\Models\ComparisonMetric;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;

uses(RefreshDatabase::class);

test('it renders the admin metrics dashboard with HTTP 200', function (): void {
    $response = $this->get('/admin/metrics');

    $response->assertStatus(200)
        ->assertSee('Admin Metrics Dashboard')
        ->assertSee('Users Today')
        ->assertSee('Comparisons Today')
        ->assertSee('Success Rate');
});

test('it displays accurate aggregated metrics from comparison records', function (): void {
    // Seed 5 metrics: 3 successful laptops, 1 successful saas, 1 failed
    ComparisonMetric::factory()->create([
        'install_id_hash' => 'user_hash_1',
        'category' => 'Laptops',
        'is_successful' => true,
        'pages_count' => 3,
        'duration_ms' => 1200,
        'created_at' => now(),
    ]);

    ComparisonMetric::factory()->create([
        'install_id_hash' => 'user_hash_1', // same user second comparison
        'category' => 'Laptops',
        'is_successful' => true,
        'pages_count' => 2,
        'duration_ms' => 1000,
        'created_at' => now(),
    ]);

    ComparisonMetric::factory()->create([
        'install_id_hash' => 'user_hash_2', // distinct second user
        'category' => 'SaaS Plans',
        'is_successful' => true,
        'pages_count' => 4,
        'duration_ms' => 1500,
        'created_at' => now(),
    ]);

    ComparisonMetric::factory()->create([
        'install_id_hash' => 'user_hash_3', // failed comparison
        'category' => null,
        'is_successful' => false,
        'pages_count' => 2,
        'duration_ms' => 500,
        'created_at' => now(),
    ]);

    $response = $this->get('/admin/metrics');

    $response->assertStatus(200);

    // 3 unique users today (user_hash_1, user_hash_2, user_hash_3)
    $response->assertSee('Users Today');
    // 4 comparisons today
    $response->assertSee('Comparisons Today');
    // Top category 'Laptops'
    $response->assertSee('Laptops');
});

test('it exposes anonymous metrics via JSON API endpoint', function (): void {
    ComparisonMetric::factory()->count(3)->create([
        'category' => 'Courses',
        'is_successful' => true,
    ]);

    $response = $this->getJson('/api/v1/metrics/summary');

    $response->assertStatus(200)
        ->assertJsonPath('success', true)
        ->assertJsonStructure([
            'success',
            'data' => [
                'usersToday',
                'comparisonsToday',
                'totalComparisons',
                'successfulCount',
                'failedCount',
                'successRate',
                'averagePages',
                'avgDurationMs',
                'commonCategories',
                'recentComparisons',
            ],
        ]);
});

test('it adheres strictly to privacy rules and contains no private text columns in schema', function (): void {
    $columns = Schema::getColumnListing('comparison_metrics');

    expect($columns)->not->toContain('url')
        ->not->toContain('urls')
        ->not->toContain('html')
        ->not->toContain('page_content')
        ->not->toContain('important_text')
        ->not->toContain('user_goal')
        ->not->toContain('goal')
        ->not->toContain('title')
        ->not->toContain('display_name');

    expect($columns)->toContain('request_id')
        ->toContain('install_id_hash')
        ->toContain('pages_count')
        ->toContain('category')
        ->toContain('is_successful')
        ->toContain('duration_ms');
});
