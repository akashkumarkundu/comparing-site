<?php

declare(strict_types=1);

namespace App\DTOs;

final readonly class CompareRequestDTO
{
    /**
     * @param  array<int, PageSnapshotDTO>  $pages
     */
    public function __construct(
        public string $installId,
        public ?string $goal,
        public array $pages,
    ) {}

    /**
     * @param  array{
     *     installId: string,
     *     goal?: ?string,
     *     pages: array<int, array<string, mixed>>
     * }  $data
     */
    public static function fromArray(array $data): self
    {
        $pages = array_map(
            static fn (array $page): PageSnapshotDTO => PageSnapshotDTO::fromArray($page),
            $data['pages']
        );

        return new self(
            installId: (string) $data['installId'],
            goal: isset($data['goal']) && trim((string) $data['goal']) !== '' ? trim((string) $data['goal']) : null,
            pages: $pages,
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'installId' => $this->installId,
            'goal' => $this->goal,
            'pages' => array_map(static fn (PageSnapshotDTO $page): array => $page->toArray(), $this->pages),
        ];
    }
}
