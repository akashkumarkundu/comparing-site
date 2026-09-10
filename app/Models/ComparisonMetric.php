<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

final class ComparisonMetric extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'request_id',
        'install_id_hash',
        'pages_count',
        'category',
        'is_successful',
        'duration_ms',
        'ai_provider',
        'model',
        'input_tokens',
        'output_tokens',
        'error_message',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'is_successful' => 'boolean',
        'pages_count' => 'integer',
        'duration_ms' => 'integer',
        'input_tokens' => 'integer',
        'output_tokens' => 'integer',
    ];
}
