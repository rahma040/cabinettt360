<?php

namespace App\Http\Controllers;

use OpenApi\Annotations as OA;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use App\Models\PasswordResetRequest;
use App\Models\User;
use App\Models\Communication;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;

class PasswordResetController extends Controller
{
    /**
     * @OA\Post(
     *   path="/password-reset-request",
     *   tags={"PasswordReset"},
     *   summary="Create a password reset request",
     *   @OA\RequestBody(required=true, @OA\JsonContent(
     *     required={"login_email","contact_method"},
     *     @OA\Property(property="login_email", type="string", format="email", example="user@example.com"),
     *     @OA\Property(property="contact_method", type="string", enum={"email","phone"}, example="email"),
     *     @OA\Property(property="contact_email", type="string", format="email", example="contact@example.com"),
     *     @OA\Property(property="contact_phone", type="string", example="0612345678"),
     *     @OA\Property(property="message", type="string", example="Please help reset my password")
     *   )),
     *   @OA\Response(response=200, description="Request created", @OA\JsonContent(type="object")),
     *   @OA\Response(response=404, description="No matching account"),
     *   @OA\Response(response=422, description="Validation error"),
     *   @OA\Response(response=500, description="Server error")
     * )
     */
    public function sendRequest(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'login_email'    => 'required|email',
            'contact_method' => 'required|in:email,phone',
            'contact_email'  => 'required_if:contact_method,email|nullable|email',
            'contact_phone'  => 'required_if:contact_method,phone|nullable|string|min:8',
            'message'        => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Check if the login email exists in the users table
        $user = User::where('email', $request->login_email)->first();
        if (!$user) {
            return response()->json(['error' => 'Aucun compte associé à cet email de connexion.'], 404);
        }

        $resetRequest = PasswordResetRequest::create([
            'login_email'    => $request->login_email,
            'contact_method' => $request->contact_method,
            'contact_email'  => $request->contact_email,
            'contact_phone'  => $request->contact_phone,
            'message'        => $request->message,
            'status'         => 'pending',
        ]);

        $contactValue = $request->contact_method === 'email' 
            ? $request->contact_email 
            : $request->contact_phone;

        $adminEmail = 'admin@gmail.com';

        try {
            Mail::raw(
                "Demande de réinitialisation de mot de passe\n" .
                "ID: {$resetRequest->id}\n" .
                "Date: {$resetRequest->created_at}\n\n" .
                "Email de connexion : {$request->login_email}\n" .
                "Méthode de contact : " . ($request->contact_method === 'email' ? 'Email' : 'Téléphone') . "\n" .
                "Contact : $contactValue\n\n" .
                "Message : " . ($request->message ?? 'Aucune note'),
                function ($mail) use ($adminEmail) {
                    $mail->to($adminEmail)
                         ->subject('Demande de réinitialisation de mot de passe');
                }
            );
        } catch (\Exception $e) {
            \Log::error('Password reset email failed: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Votre demande a été enregistrée. L\'administrateur vous contactera sous 24h.'
        ], 200);
    }

    /**
     * @OA\Get(
     *   path="/admin/password-reset-requests",
     *   tags={"PasswordReset"},
     *   summary="List password reset requests",
     *   security={{"bearerAuth":{}}},
     *   @OA\Response(response=200, description="Requests list", @OA\JsonContent(type="array", @OA\Items(type="object"))),
     *   @OA\Response(response=401, description="Non authentifié"),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Server error")
     * )
     */
    public function getPendingRequests()
    {
        try {
            $admin = JWTAuth::parseToken()->authenticate();
            if ($admin->role !== 'admin') {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $requests = PasswordResetRequest::orderBy('created_at', 'desc')->get();
            return response()->json($requests);
        } catch (\Exception $e) {
            \Log::error('getPendingRequests error: ' . $e->getMessage());
            return response()->json(['error' => 'Internal server error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * @OA\Get(
     *   path="/admin/get-user-by-email",
     *   tags={"PasswordReset"},
     *   summary="Find a user by login email",
     *   security={{"bearerAuth":{}}},
     *   @OA\Parameter(name="login_email", in="query", required=true, @OA\Schema(type="string", format="email")),
     *   @OA\Response(response=200, description="User found", @OA\JsonContent(type="object")),
     *   @OA\Response(response=401, description="Non authentifié"),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=404, description="User not found"),
     *   @OA\Response(response=422, description="Validation error"),
     *   @OA\Response(response=500, description="Server error")
     * )
     */
    public function getUserByLoginEmail(Request $request)
    {
        try {
            $admin = JWTAuth::parseToken()->authenticate();
            if ($admin->role !== 'admin') {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $validator = Validator::make($request->all(), [
                'login_email' => 'required|email'
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $user = User::where('email', $request->login_email)->first();
            if (!$user) {
                return response()->json(['error' => 'Aucun utilisateur trouvé avec cet email'], 404);
            }

            return response()->json($user);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Internal server error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * @OA\Post(
     *   path="/admin/reset-password",
     *   tags={"PasswordReset"},
     *   summary="Reset a user's password",
     *   security={{"bearerAuth":{}}},
     *   @OA\RequestBody(required=true, @OA\JsonContent(
     *     required={"user_id","new_password"},
     *     @OA\Property(property="user_id", type="integer", example=42),
     *     @OA\Property(property="new_password", type="string", format="password", example="NewPass123"),
     *     @OA\Property(property="request_id", type="integer", example=7)
     *   )),
     *   @OA\Response(response=200, description="Password reset", @OA\JsonContent(type="object")),
     *   @OA\Response(response=401, description="Non authentifié"),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=422, description="Validation error"),
     *   @OA\Response(response=500, description="Server error")
     * )
     */
    public function resetUserPassword(Request $request)
    {
        try {
            $admin = JWTAuth::parseToken()->authenticate();
            if ($admin->role !== 'admin') {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $validator = Validator::make($request->all(), [
                'user_id' => 'required|exists:users,id',
                'new_password' => 'required|string|min:8|max:12',
                'request_id' => 'nullable|exists:password_reset_requests,id'
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $user = User::find($request->user_id);
            $oldPassword = $user->password;
            $user->password = Hash::make($request->new_password);
            $user->save();

            if ($request->has('request_id')) {
                $resetRequest = PasswordResetRequest::find($request->request_id);
                if ($resetRequest) {
                    $resetRequest->status = 'processed';
                    $resetRequest->save();
                }
            }

            $communication = Communication::create([
                'sender_id' => $admin->id,
                'recipient_email' => $user->email,
                'message' => "Bonjour {$user->name},\n\nVotre mot de passe a été réinitialisé par l'administrateur.\n\nUn email contenant votre nouveau mot de passe vous a été envoyé.\n\nPour des raisons de sécurité, veuillez le modifier dès votre prochaine connexion.\n\nCordialement,\nL'équipe CabiDoc",
                'file_path' => null
            ]);

            try {
                Mail::raw(
                    "Bonjour {$user->name},\n\n" .
                    "Votre mot de passe a été réinitialisé par l'administrateur.\n" .
                    "Nouveau mot de passe : {$request->new_password}\n\n" .
                    "Veuillez vous connecter et changer votre mot de passe immédiatement.\n\n" .
                    "Cordialement,\nL'équipe MediCare",
                    function ($mail) use ($user) {
                        $mail->to($user->email)
                             ->subject('Réinitialisation de votre mot de passe');
                    }
                );
            } catch (\Exception $e) {
                \Log::error('Password reset notification failed: ' . $e->getMessage());
            }

            return response()->json([
                'message' => 'Mot de passe réinitialisé et notification envoyée'
            ]);
        } catch (\Exception $e) {
            \Log::error('resetUserPassword error: ' . $e->getMessage());
            return response()->json(['error' => 'Internal server error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * @OA\Get(
     *   path="/admin/search-users",
     *   tags={"PasswordReset"},
     *   summary="Search users for password reset",
     *   security={{"bearerAuth":{}}},
     *   @OA\Parameter(name="search", in="query", required=false, @OA\Schema(type="string")),
     *   @OA\Response(response=200, description="Users list", @OA\JsonContent(type="array", @OA\Items(type="object"))),
     *   @OA\Response(response=401, description="Non authentifié"),
     *   @OA\Response(response=403, description="Unauthorized"),
     *   @OA\Response(response=500, description="Server error")
     * )
     */
    public function searchUsers(Request $request)
    {
        try {
            $admin = JWTAuth::parseToken()->authenticate();
            if ($admin->role !== 'admin') {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $search = $request->get('search', '');
            $users = User::where('name', 'like', "%{$search}%")
                         ->orWhere('email', 'like', "%{$search}%")
                         ->get(['id', 'name', 'email', 'role']);
            return response()->json($users);
        } catch (\Exception $e) {
            \Log::error('searchUsers error: ' . $e->getMessage());
            return response()->json(['error' => 'Internal server error: ' . $e->getMessage()], 500);
        }
    }
}