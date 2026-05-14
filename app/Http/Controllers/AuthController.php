<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function getCurrentUser(Request $request)
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();
            
            if (!$user) {
                return response()->json(['error' => 'Utilisateur non trouvé'], 404);
            }
            
            $payload = JWTAuth::getPayload();
            $jti = $payload->get('jti');
            
            $integrityHash = $this->generateIntegrityHash($user, $jti);
            
            return response()->json([
                'id'            => $user->id,
                'name'          => $user->name,
                'email'         => $user->email,
                'role'          => $user->role,
                'integrity_hash' => $integrityHash,
            ]);
        } catch (\Tymon\JWTAuth\Exceptions\TokenExpiredException $e) {
            return response()->json(['error' => 'Token expiré'], 401);
        } catch (\Tymon\JWTAuth\Exceptions\TokenInvalidException $e) {
            return response()->json(['error' => 'Token invalide'], 401);
        } catch (\Tymon\JWTAuth\Exceptions\JWTException $e) {
            return response()->json(['error' => 'Token non fourni'], 401);
        }
    }

    private function generateIntegrityHash($user, $jti)
    {
        $data = json_encode([
            $user->id,
            $user->email,
            $user->role,
            $jti,
        ]);
        return hash_hmac('sha256', $data, config('app.key'));
    }
}