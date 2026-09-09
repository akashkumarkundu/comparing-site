<?php

declare(strict_types=1);

return [
    'default' => env('AI_PROVIDER', 'groq'),

    'providers' => [
        'groq' => [
            'api_key' => env('GROQ_API_KEY', ''),
            'model' => env('GROQ_MODEL', 'openai/gpt-oss-20b'),
            'base_url' => env('GROQ_BASE_URL', 'https://api.groq.com/openai/v1'),
            'timeout' => (int) env('GROQ_TIMEOUT', 45),
            'retry' => (int) env('GROQ_RETRY', 2),
        ],
        'openrouter' => [
            'api_key' => env('OPENROUTER_API_KEY', ''),
            'model' => env('OPENROUTER_MODEL', 'meta-llama/llama-3.3-70b-instruct'),
            'base_url' => env('OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1'),
            'timeout' => (int) env('OPENROUTER_TIMEOUT', 45),
            'retry' => (int) env('OPENROUTER_RETRY', 2),
        ],
    ],

    'rate_limit' => [
        'per_install_per_day' => (int) env('DAILY_COMPARISON_LIMIT', 10),
        'per_ip_per_hour' => (int) env('HOURLY_IP_COMPARISON_LIMIT', 30),
    ],
];
