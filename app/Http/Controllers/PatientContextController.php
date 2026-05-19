<?php

namespace App\Http\Controllers;

use App\Services\GeminiService;
use App\Services\PatientContextService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Tymon\JWTAuth\Facades\JWTAuth;

class PatientContextController extends Controller
{
    public function ask(Request $request, PatientContextService $contextService, GeminiService $geminiService)
    {
        // Authenticate user
        try {
            $user = JWTAuth::parseToken()->authenticate();
        } catch (\Exception $e) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        if (!$user || $user->role !== 'medecin') {
            return response()->json(['error' => 'Access restricted to doctors'], 403);
        }

        // Validate request
        $validated = $request->validate([
            'patient_id' => 'required|integer|exists:patients,id',
            'question' => 'required|string|max:5000',
        ]);

        try {
            // Build or retrieve cached context (30 minutes)
            $cacheKey = 'patient_context_' . $validated['patient_id'];
            $context = Cache::remember($cacheKey, 60 * 30, function () use ($validated, $contextService) {
                return $contextService->buildContext($validated['patient_id']);
            });

            // Get answer from Gemini
            $answer = $geminiService->ask($context, $validated['question']);

            return response()->json([
                'answer' => $answer,
            ]);
        } catch (\Throwable $e) {
            report($e);

            return response()->json([
                'error' => 'Unable to generate response at this time.',
            ], 500);
        }
    }
}
