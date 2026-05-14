<?php

namespace App\Http\Controllers;

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