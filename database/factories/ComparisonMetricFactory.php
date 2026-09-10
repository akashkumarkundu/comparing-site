<?php

namespace Database\Factories;

use App\Models\ComparisonMetric;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ComparisonMetric>
 */
class ComparisonMetricFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'request_id' => fake()->uuid(),
            'install_id_hash' => hash('sha256', fake()->uuid()),
            'pages_count' => fake()->numberBetween(2, 4),
            'category' => fake()->randomElement(['Laptops', 'SaaS Plans', 'Job Offers', 'Courses', 'Hotels']),
            'is_successful' => true,
            'duration_ms' => fake()->numberBetween(800, 4500),
            'ai_provider' => 'groq',
            'model' => 'openai/gpt-oss-20b',
            'input_tokens' => fake()->numberBetween(400, 1500),
            'output_tokens' => fake()->numberBetween(300, 900),
            'error_message' => null,
        ];
    }
}
