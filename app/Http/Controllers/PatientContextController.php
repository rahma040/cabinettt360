<?php

namespace App\Http\Controllers;

use OpenApi\Annotations as OA;
use App\Services\GeminiService;
use App\Services\PatientContextService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Tymon\JWTAuth\Facades\JWTAuth;

class PatientContextController extends Controller
{
    /**
     * @OA\Post(
     *   path="/doctor/patient-context/ask",
     *   tags={"PatientContext"},
     *   summary="Ask a question about a patient's context",
     *   security={{"bearerAuth":{}}},
    *   @OA\RequestBody(
    *     required=true,
    *     @OA\MediaType(
    *       mediaType="application/json",
    *       @OA\Schema(
    *         type="object",
    *         required={"patient_id","question"},
    *         @OA\Property(property="patient_id", type="integer", example=12, description="ID of the patient to query"),
    *         @OA\Property(property="question", type="string", example="Summarize the latest visits and prescriptions", description="Free-text question for the assistant")
    *       )
    *     )
    *   ),
     *   @OA\Response(response=200, description="Assistant answer", @OA\JsonContent(type="object")),
     *   @OA\Response(response=401, description="Unauthenticated"),
     *   @OA\Response(response=403, description="Access restricted to doctors"),
     *   @OA\Response(response=422, description="Validation error"),
     *   @OA\Response(response=500, description="Server error")
     * )
     */
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
