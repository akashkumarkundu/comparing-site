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
                $itemId = (string) ($m['itemId'] ?? '');
                $rawFields = is_array($m['fields'] ?? null) ? $m['fields'] : [];
                $fields = array_values(array_filter(
                    array_map('strval', $rawFields),
                    static fn (string $f): bool => trim($f) !== '' && ! self::isFieldStated($f, $itemId, $criteria)
                ));
                if ($fields !== []) {
                    $missingInformation[] = [
                        'itemId' => $itemId,
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

    /**
     * Determine if a field name matches an already stated (non-'Not stated') criterion for an item.
     *
     * @param  array<int, array{name: string, importance: string, values: array<int, array{itemId: string, value: string, confidence: string}>, winnerItemIds: array<int, string>}>  $criteria
     */
    private static function isFieldStated(string $fieldName, string $itemId, array $criteria): bool
    {
        $cleanField = strtolower(trim(preg_replace('/\s*\([^)]*\)/', '', $fieldName) ?? ''));
        $normField = preg_replace('/[^a-z0-9]/', '', $cleanField) ?? '';
        if ($normField === '') {
            return false;
        }

        $fieldWords = array_values(array_filter(
            preg_split('/[\s\-_,\/]+/', $cleanField) ?: [],
            static fn (string $w): bool => strlen($w) >= 2
        ));

        foreach ($criteria as $criterion) {
            $critName = (string) ($criterion['name'] ?? '');
            $cleanCritName = strtolower(trim(preg_replace('/\s*\([^)]*\)/', '', $critName) ?? ''));
            $normCrit = preg_replace('/[^a-z0-9]/', '', $cleanCritName) ?? '';

            // Find value for this itemId
            $valObj = collect($criterion['values'] ?? [])->firstWhere('itemId', $itemId);
            if (! $valObj) {
                continue;
            }

            $val = trim((string) ($valObj['value'] ?? ''));
            $valLower = strtolower($val);
            if ($val === '' || $valLower === 'not stated' || $valLower === 'n/a' || $valLower === 'none' || $valLower === 'undefined' || $valLower === 'null') {
                continue;
            }

            // If the value is genuinely stated (e.g. "190", "190g", "1.63 kg"):
            // 1. Exact normalized match (e.g., "weight" === "weight", "iprating" === "iprating")
            if ($normCrit !== '' && ($normField === $normCrit || str_contains($normCrit, $normField) || str_contains($normField, $normCrit))) {
                return true;
            }

            // 2. Word matches
            $critWords = array_values(array_filter(
                preg_split('/[\s\-_,\/]+/', $cleanCritName) ?: [],
                static fn (string $w): bool => strlen($w) >= 2
            ));

            if ($fieldWords !== [] && $critWords !== []) {
                if (count($fieldWords) === 1 && in_array($fieldWords[0], $critWords, true)) {
                    return true;
                }

                $allMatched = true;
                foreach ($fieldWords as $fw) {
                    if (! in_array($fw, $critWords, true)) {
                        $allMatched = false;
                        break;
                    }
                }
                if ($allMatched) {
                    return true;
                }
            }
        }

        return false;
    }
}
