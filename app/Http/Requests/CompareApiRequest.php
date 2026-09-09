<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\DTOs\CompareRequestDTO;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Symfony\Component\HttpFoundation\Response;

final class CompareApiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'installId' => ['required', 'string', 'max:128'],
            'goal' => ['nullable', 'string', 'max:500'],
            'pages' => ['required', 'array', 'min:2', 'max:4'],
            'pages.*.id' => ['required', 'string', 'max:64'],
            'pages.*.url' => ['required', 'string', 'url', 'max:2048'],
            'pages.*.domain' => ['required', 'string', 'max:255'],
            'pages.*.title' => ['required', 'string', 'max:500'],
            'pages.*.description' => ['nullable', 'string', 'max:2000'],
            'pages.*.structuredData' => ['nullable', 'string', 'max:10000'],
            'pages.*.importantText' => ['nullable', 'string', 'max:15000'],
            'pages.*.capturedAt' => ['nullable', 'string', 'max:64'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'pages.min' => 'Add at least one more page to compare.',
            'pages.max' => 'You can compare a maximum of 4 pages.',
            'pages.required' => 'Add at least one more page to compare.',
            'installId.required' => 'A valid client installation ID is required.',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v): void {
            $pages = $this->input('pages');
            if (! is_array($pages)) {
                return;
            }

            $urls = [];
            foreach ($pages as $page) {
                if (! is_array($page) || empty($page['url'])) {
                    continue;
                }

                $url = strtolower(trim((string) $page['url']));
                if (in_array($url, $urls, true)) {
                    $v->errors()->add('pages', 'This page is already in your comparison.');
                    break;
                }
                $urls[] = $url;
            }
        });
    }

    protected function failedValidation(Validator $validator): void
    {
        $errors = $validator->errors();
        $firstMessage = $errors->first();

        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => $firstMessage ?: 'Invalid comparison payload.',
            'errors' => $errors->messages(),
        ], Response::HTTP_UNPROCESSABLE_ENTITY));
    }

    public function toDTO(): CompareRequestDTO
    {
        /** @var array{installId: string, goal?: ?string, pages: array<int, array<string, mixed>>} $validated */
        $validated = $this->validated();

        return CompareRequestDTO::fromArray($validated);
    }
}
