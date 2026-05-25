<?php

namespace App\Http\Controllers;

use OpenApi\Annotations as OA;
use App\Services\DoctorAssistantService;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;

class DoctorAssistantController extends Controller
{
    /**
     * @OA\Post(
     *   path="/doctor/assistant/chat",
     *   tags={"DoctorAssistant"},
     *   summary="Chat with the doctor assistant",
     *   security={{"bearerAuth":{}}},
     *   @OA\RequestBody(required=true, @OA\JsonContent(
     *     required={"message"},
     *     @OA\Property(property="message", type="string", example="Summarize my pending appointments"),
     *     @OA\Property(property="history", type="array", @OA\Items(type="object"))
     *   )),
     *   @OA\Response(response=200, description="Assistant response", @OA\JsonContent(type="object")),
     *   @OA\Response(response=401, description="Non authentifié"),
     *   @OA\Response(response=403, description="Accès réservé aux médecins"),
     *   @OA\Response(response=422, description="Validation error"),
     *   @OA\Response(response=500, description="Server error")
     * )
     */
    public function chat(Request $request, DoctorAssistantService $assistant)
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();
        } catch (\Exception $e) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        if (!$user || $user->role !== 'medecin') {
            return response()->json(['error' => 'Accès réservé aux médecins'], 403);
        }

        $validated = $request->validate([
            'message' => 'required|string|max:5000',
            'history' => 'nullable|array',
            'history.*.role' => 'nullable|in:user,assistant,system',
            'history.*.content' => 'nullable|string|max:5000',
        ]);

        try {
            $response = $assistant->chat($user, $validated['message'], $validated['history'] ?? []);

            return response()->json([
                'answer' => $response['answer'],
                'context' => $response['context'],
                'suggestions' => $response['context']['suggestions'] ?? [],
            ]);
        } catch (\Throwable $e) {
            \Log::error('Doctor assistant error', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return response()->json([
                'error' => 'Impossible de générer une réponse pour le moment.',
            ], 500);
        }
    }
}
