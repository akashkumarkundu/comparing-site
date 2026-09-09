<?php

declare(strict_types=1);

namespace App\DTOs;

final readonly class ComparisonResultDTO
{
    /**
     * @param  array<int, array{id: string, displayName: string, shortDescription: string}>  $items
     * @param  array<int, array{name: string, importance: string, values: array<int, array{itemId: string, value: string, confidence: string}>, winnerItemIds: array<int, string>}>  $criteria
     * @param  array{itemId: ?string, reason: string}  $bestOverall
     * @param  array<int, array{label: string, itemId: ?string, reason: string}>  $bestFor
     * @param  array<int, string>  $keyDifferences
     * @param  array<int, array{itemId: string, fields: array<int, string>}>  $missingInformation
     */
    public function __construct(
        public string $comparisonTitle,
        public string $comparisonType,
        public string $goal,
        public array $items,
        public array $criteria,
        public array $bestOverall,
        public array $bestFor,
        public array $keyDifferences,
        public array $missingInformation,
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public static function fromArray(array $data): self
    {
        $rawItems = is_array($data['items'] ?? null) ? $data['items'] : [];
        $items = [];
        foreach ($rawItems as $item) {
            if (is_array($item)) {
                $items[] = [
                    'id' => (string) ($item['id'] ?? ''),
                    'displayName' => (string) ($item['displayName'] ?? 'Unknown Item'),
                    'shortDescription' => (string) ($item['shortDescription'] ?? ''),
                ];
            }
        }

        $rawCriteria = is_array($data['criteria'] ?? null) ? $data['criteria'] : [];
        $criteria = [];
        foreach ($rawCriteria as $c) {
            if (! is_array($c)) {
                continue;
            }

            $rawVals = is_array($c['values'] ?? null) ? $c['values'] : [];
            $values = [];
            foreach ($rawVals as $v) {
                if (is_array($v)) {
                    $values[] = [
                        'itemId' => (string) ($v['itemId'] ?? ''),
                        'value' => isset($v['value']) && trim((string) $v['value']) !== '' ? (string) $v['value'] : 'Not stated',
                        'confidence' => (string) ($v['confidence'] ?? 'medium'),
                    ];
                }
            }

            $rawWinners = is_array($c['winnerItemIds'] ?? null) ? $c['winnerItemIds'] : [];
            $winnerItemIds = array_values(array_map('strval', $rawWinners));

            $criteria[] = [
                'name' => (string) ($c['name'] ?? 'Feature'),
                'importance' => (string) ($c['importance'] ?? 'medium'),
                'values' => $values,
                'winnerItemIds' => $winnerItemIds,
            ];
        }

        $rawBestOverall = is_array($data['bestOverall'] ?? null) ? $data['bestOverall'] : [];
        $bestOverall = [
            'itemId' => isset($rawBestOverall['itemId']) && $rawBestOverall['itemId'] !== '' ? (string) $rawBestOverall['itemId'] : null,
            'reason' => (string) ($rawBestOverall['reason'] ?? 'No clear winner based on provided information.'),
        ];

        $rawBestFor = is_array($data['bestFor'] ?? null) ? $data['bestFor'] : [];
        $bestFor = [];
        foreach ($rawBestFor as $bf) {
            if (is_array($bf)) {
                $bestFor[] = [
                    'label' => (string) ($bf['label'] ?? 'General'),
                    'itemId' => isset($bf['itemId']) && $bf['itemId'] !== '' ? (string) $bf['itemId'] : null,
                    'reason' => (string) ($bf['reason'] ?? ''),
                ];
            }
        }

        $rawDiffs = is_array($data['keyDifferences'] ?? null) ? $data['keyDifferences'] : [];
        $keyDifferences = array_values(array_filter(array_map('strval', $rawDiffs), static fn (string $s): bool => trim($s) !== ''));

        $rawMissing = is_array($data['missingInformation'] ?? null) ? $data['missingInformation'] : [];
        $missingInformation = [];
        foreach ($rawMissing as $m) {
            if (is_array($m)) {
                $rawFields = is_array($m['fields'] ?? null) ? $m['fields'] : [];
                $fields = array_values(array_filter(array_map('strval', $rawFields), static fn (string $f): bool => trim($f) !== ''));
                if ($fields !== []) {
                    $missingInformation[] = [
                        'itemId' => (string) ($m['itemId'] ?? ''),
                        'fields' => $fields,
                    ];
                }
            }
        }

        return new self(
            comparisonTitle: (string) ($data['comparisonTitle'] ?? 'Product Comparison'),
            comparisonType: (string) ($data['comparisonType'] ?? 'General'),
            goal: (string) ($data['goal'] ?? ''),
            items: $items,
            criteria: $criteria,
            bestOverall: $bestOverall,
            bestFor: $bestFor,
            keyDifferences: $keyDifferences,
            missingInformation: $missingInformation,
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'comparisonTitle' => $this->comparisonTitle,
            'comparisonType' => $this->comparisonType,
            'goal' => $this->goal,
            'items' => $this->items,
            'criteria' => $this->criteria,
            'bestOverall' => $this->bestOverall,
            'bestFor' => $this->bestFor,
            'keyDifferences' => $this->keyDifferences,
            'missingInformation' => $this->missingInformation,
        ];
    }
}
