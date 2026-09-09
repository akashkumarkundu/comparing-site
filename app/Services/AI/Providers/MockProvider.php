<?php

declare(strict_types=1);

namespace App\Services\AI\Providers;

use App\DTOs\CompareRequestDTO;
use App\DTOs\ComparisonResultDTO;
use App\Services\AI\Contracts\IAIProvider;

final class MockProvider implements IAIProvider
{
    public function compare(CompareRequestDTO $request): ComparisonResultDTO
    {
        $items = [];
        $itemNames = [];
        foreach ($request->pages as $page) {
            $displayName = $page->title !== '' ? $page->title : $page->domain;
            if (strlen($displayName) > 40) {
                $displayName = substr($displayName, 0, 37).'...';
            }
            $itemNames[] = $displayName;
            $items[] = [
                'id' => $page->id,
                'displayName' => $displayName,
                'shortDescription' => $page->description ?? "Page listing from {$page->domain}",
            ];
        }

        $title = implode(' vs ', array_slice($itemNames, 0, 3));
        $firstId = $items[0]['id'] ?? 'page-1';
        $secondId = $items[1]['id'] ?? 'page-2';

        $criteria = [
            [
                'name' => 'Price',
                'importance' => 'high',
                'values' => array_map(static fn ($item) => [
                    'itemId' => $item['id'],
                    'value' => 'Verified on source',
                    'confidence' => 'high',
                ], $items),
                'winnerItemIds' => [$firstId],
            ],
            [
                'name' => 'Key Features',
                'importance' => 'high',
                'values' => array_map(static fn ($item) => [
                    'itemId' => $item['id'],
                    'value' => 'Extracted from page specifications',
                    'confidence' => 'high',
                ], $items),
                'winnerItemIds' => [$secondId],
            ],
            [
                'name' => 'Warranty / Support',
                'importance' => 'medium',
                'values' => array_map(static fn ($item) => [
                    'itemId' => $item['id'],
                    'value' => 'Not stated',
                    'confidence' => 'medium',
                ], $items),
                'winnerItemIds' => [],
            ],
        ];

        return ComparisonResultDTO::fromArray([
            'comparisonTitle' => $title,
            'comparisonType' => 'General',
            'goal' => $request->goal ?? 'General Comparison',
            'items' => $items,
            'criteria' => $criteria,
            'bestOverall' => [
                'itemId' => $secondId,
                'reason' => 'Offers the most balanced set of stated specifications and features based on the extracted data.',
            ],
            'bestFor' => [
                [
                    'label' => 'Best Value',
                    'itemId' => $firstId,
                    'reason' => 'Strongest option if budget is the primary decision factor.',
                ],
                [
                    'label' => 'Feature Richness',
                    'itemId' => $secondId,
                    'reason' => 'Includes more comprehensive technical attributes.',
                ],
            ],
            'keyDifferences' => [
                "{$items[0]['displayName']} focuses on affordability.",
                "{$items[1]['displayName']} provides more detailed features according to the extracted page data.",
            ],
            'missingInformation' => [
                [
                    'itemId' => $firstId,
                    'fields' => ['Warranty details', 'Full dimensions'],
                ],
            ],
        ]);
    }
}
