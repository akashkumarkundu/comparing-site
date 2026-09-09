<?php

declare(strict_types=1);

namespace App\Services\AI\Contracts;

use App\DTOs\CompareRequestDTO;
use App\DTOs\ComparisonResultDTO;

interface AIProviderInterface
{
    /**
     * Generate an evidence-based, structured comparison from webpage snapshots.
     */
    public function compare(CompareRequestDTO $request): ComparisonResultDTO;
}
