<?php

declare(strict_types=1);

namespace App\Services\AI\Contracts;

use App\DTOs\CompareRequestDTO;
use App\DTOs\ComparisonResultDTO;

/**
 * Interface IAIProvider matching SPEC Section 17
 */
interface IAIProvider extends AIProviderInterface
{
    public function compare(CompareRequestDTO $request): ComparisonResultDTO;
}
