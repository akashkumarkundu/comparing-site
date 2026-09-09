<?php

declare(strict_types=1);

namespace App\DTOs;

final readonly class PageSnapshotDTO
{
    public function __construct(
        public string $id,
        public string $url,
        public string $domain,
        public string $title,
        public ?string $description = null,
        public ?string $structuredData = null,
        public ?string $importantText = null,
        public ?string $capturedAt = null,
    ) {}

    /**
     * @param  array{
     *     id: string,
     *     url: string,
     *     domain: string,
     *     title: string,
     *     description?: ?string,
     *     structuredData?: ?string,
     *     importantText?: ?string,
     *     capturedAt?: ?string
     * }  $data
     */
    public static function fromArray(array $data): self
    {
        return new self(
            id: (string) $data['id'],
            url: (string) $data['url'],
            domain: (string) $data['domain'],
            title: (string) $data['title'],
            description: isset($data['description']) ? (string) $data['description'] : null,
            structuredData: isset($data['structuredData']) ? (string) $data['structuredData'] : null,
            importantText: isset($data['importantText']) ? (string) $data['importantText'] : null,
            capturedAt: isset($data['capturedAt']) ? (string) $data['capturedAt'] : null,
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'url' => $this->url,
            'domain' => $this->domain,
            'title' => $this->title,
            'description' => $this->description,
            'structuredData' => $this->structuredData,
            'importantText' => $this->importantText,
            'capturedAt' => $this->capturedAt,
        ];
    }
}
