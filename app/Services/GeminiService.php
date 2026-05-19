<?php

namespace App\Services;

use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class GeminiService
{
    private string $apiKey;

    private string $model;

    public function __construct()
    {
        $this->apiKey = $this->resolveApiKey();
        $this->model = (string) config('services.gemini.model', 'gemini-2.5-flash');
    }

    /**
     * Ask Gemini a question about patient context.
     *
     * @param string $context
     * @param string $question
     * @return string
     * @throws RuntimeException
     */
    public function ask(string $context, string $question): string
    {
        if (trim($question) === '') {
            throw new RuntimeException('Question cannot be empty.');
        }

        if ($this->apiKey === '') {
            throw new RuntimeException('Gemini API key is missing. Add GEMINI_API_KEY or GEOIP_API_KEY to .env');
        }

        $answer = $this->generateAnswer($context, $question);

        return $answer;
    }

    private function generateAnswer(string $context, string $question): string
    {
        $payload = [
            'systemInstruction' => [
                'parts' => [[
                    'text' => $this->buildSystemInstruction(),
                ]],
            ],
            'contents' => [
                [
                    'role' => 'user',
                    'parts' => [[
                        'text' => $this->buildPrompt($context, $question),
                    ]],
                ],
            ],
            'generationConfig' => [
                'temperature' => 0.3,
                'topP' => 0.95,
                'topK' => 40,
                'maxOutputTokens' => 1500,
            ],
        ];

        try {
            $response = Http::timeout(60)
                ->retry(2, 400)
                ->acceptJson()
                ->post($this->endpoint(), $payload)
                ->throw();
        } catch (RequestException $e) {
            throw new RuntimeException('Failed to reach Gemini API: ' . $e->getMessage(), 0, $e);
        }

        $answer = data_get($response->json(), 'candidates.0.content.parts.0.text');

        if (!is_string($answer) || trim($answer) === '') {
            throw new RuntimeException('Gemini returned no valid response.');
        }

        return trim($answer);
    }

    private function resolveApiKey(): string
    {
        $keys = [
            config('services.gemini.api_key'),
            env('GEMINI_API_KEY'),
            env('GEOIP_API_KEY'),
        ];

        foreach ($keys as $key) {
            $key = trim((string) $key);
            if ($key !== '') {
                return $key;
            }
        }

        return '';
    }

    private function endpoint(): string
    {
        return sprintf(
            'https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s',
            $this->model,
            $this->apiKey
        );
    }

    private function buildSystemInstruction(): string
    {
        return <<<'PROMPT'
You are a medical assistant AI supporting a licensed healthcare professional in analyzing patient records.

CRITICAL RULES:
1. Answer ONLY based on the patient context provided below. Do NOT fabricate, guess, or infer data.
2. If information is not explicitly stated in the context, clearly state: "This information is not available in the provided patient record."
3. Protect patient privacy: only discuss information relevant to the question asked.
4. Be concise, professional, and factual in all responses.
5. If the question asks about something outside the patient data (e.g., general medical advice), remind the healthcare provider to refer to clinical guidelines.

Respond in the same language as the question when possible. For English: respond in English. For French: respond in French.
PROMPT;
    }

    private function buildPrompt(string $context, string $question): string
    {
        return <<<PROMPT
PATIENT CONTEXT:
{$context}

QUESTION FROM HEALTHCARE PROVIDER:
{$question}

Please analyze the patient record above and answer the question based solely on the provided data.
PROMPT;
    }
}
