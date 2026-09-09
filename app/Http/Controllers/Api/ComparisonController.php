<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CompareApiRequest;
use App\Services\ComparisonService;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

final class ComparisonController extends Controller
{
    public function __construct(
        private readonly ComparisonService $comparisonService,
    ) {}

    public function compare(CompareApiRequest $request): JsonResponse
    {
        try {
            $dto = $request->toDTO();
            $result = $this->comparisonService->compare($dto);

            return response()->json([
                'success' => true,
                'data' => $result->toArray(),
            ], Response::HTTP_OK);
        } catch (Throwable $e) {
            // Re-throw if it's already an HttpResponseException (e.g. 429 or 503)
            if ($e instanceof HttpResponseException) {
                throw $e;
            }

            return response()->json([
                'success' => false,
                'message' => 'Comparison couldn\'t be generated. Please try again.',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
