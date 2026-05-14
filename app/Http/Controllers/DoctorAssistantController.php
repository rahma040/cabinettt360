<?php

namespace App\Http\Controllers;

use App\Services\DoctorAssistantService;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;

class DoctorAssistantController extends Controller
{
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
            report($e);

            return response()->json([
                'error' => 'Impossible de générer une réponse pour le moment.',
            ], 500);
        }
    }
}
