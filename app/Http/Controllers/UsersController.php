<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use App\Models\Patient;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;

class UsersController extends Controller
{

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|max:12',
            'role' => 'sometimes|in:admin,medecin,secretaire,patient',
            'licence_document' => 'required_if:role,medecin|nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $licencePath = null;
        if ($request->hasFile('licence_document')) {
            $licencePath = $request->file('licence_document')->store('doctor_licences', 'public');
        }

        $role = $request->role ?? 'patient';
        $verified = ($role === 'medecin') ? false : true;

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $role,
            'verified' => $verified,
            'licence_document' => $licencePath,
        ]);

        $token = JWTAuth::fromUser($user);

        $message = ($role === 'medecin')
            ? 'Inscription réussie. Votre compte sera activé par un administrateur.'
            : 'Utilisateur enregistré avec succès';

        return response()->json([
            'message' => $message,
            'user' => $user,
            'token' => $token
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|min:8|max:12',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['error' => 'Adresse email invalide'], 401);
        }

        if (!Hash::check($request->password, $user->password)) {
            return response()->json(['error' => 'Mot de passe incorrect'], 401);
        }

        if ($user->role === 'medecin' && !$user->verified) {
            return response()->json(['error' => 'Votre compte est en attente de vérification par un administrateur.'], 403);
        }

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'message' => 'Connexion réussie',
            'token' => $token,
            'user' => $user->makeHidden(['password', 'created_at', 'updated_at', 'licence_document']),
        ]);
    }

    public function dashboard(Request $request)
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();
        } catch (\Tymon\JWTAuth\Exceptions\TokenExpiredException $e) {
            return response()->json(['error' => 'Le token a expiré'], 401);
        } catch (\Tymon\JWTAuth\Exceptions\TokenInvalidException $e) {
            return response()->json(['error' => 'Le token est invalide'], 401);
        } catch (\Tymon\JWTAuth\Exceptions\JWTException $e) {
            return response()->json(['error' => 'Token non fourni'], 401);
        }

        $dashboardMessage = '';
        switch($user->role) {
            case 'admin':
                $dashboardMessage = 'Bienvenue sur votre tableau de bord administrateur';
                break;
            case 'medecin':
                $dashboardMessage = 'Bienvenue sur votre tableau de bord médecin';
                break;
            case 'secretaire':
                $dashboardMessage = 'Bienvenue sur votre tableau de bord secrétaire';
                break;
            case 'patient':
                $dashboardMessage = 'Bienvenue sur votre tableau de bord patient';
                break;
            default:
                $dashboardMessage = 'Bienvenue sur votre tableau de bord';
        }

        return response()->json([
            'user' => $user,
            'message' => $dashboardMessage,
            'role' => $user->role
        ]);
    }

    public function logout(Request $request)
    {
        try {
            $token = JWTAuth::getToken();
            if (!$token) {
                return response()->json(['error' => 'Token non fourni'], 401);
            }
            JWTAuth::invalidate($token);
            return response()->json(['message' => 'Déconnexion réussie']);
        } catch (\Tymon\JWTAuth\Exceptions\JWTException $e) {
            return response()->json(['error' => 'Échec de la déconnexion'], 500);
        }
    }

    public function index()
    {
        $admin = JWTAuth::parseToken()->authenticate();
        if ($admin->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        $users = User::all();
        return response()->json($users);
    }

    public function totalUsers()
    {
        $total = User::count();
        return response()->json(['total' => $total]);
    }

    public function totalByRole($role)
    {
        $total = User::where('role', $role)->count();
        return response()->json(['total' => $total]);
    }

    public function storeSecretary(Request $request)
    {
        try {
            $doctor = JWTAuth::parseToken()->authenticate();
        } catch (\Exception $e) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        if ($doctor->role !== 'medecin') {
            return response()->json(['error' => 'Seuls les médecins peuvent créer des secrétaires'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|max:12',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $secretary = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'secretaire',
            'doctor_id' => $doctor->id,
        ]);

        return response()->json([
            'message' => 'Secrétaire créé avec succès',
            'secretary' => $secretary
        ], 201);
    }

    public function storePatientUser(Request $request)
    {
        try {
            $actor = JWTAuth::parseToken()->authenticate();
        } catch (\Exception $e) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        if (!in_array($actor->role, ['medecin', 'secretaire'])) {
            return response()->json(['error' => 'Accès réservé aux médecins et secrétaires'], 403);
        }

        $doctorId = ($actor->role === 'secretaire') ? $actor->doctor_id : $actor->id;

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|max:12',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'patient',
            'doctor_id' => $doctorId,
        ]);

        // Create a Patient profile record linked by email
        $names = explode(' ', trim($request->name), 2);
        $nom = $names[0] ?? $request->name;
        $prenom = $names[1] ?? '';

        Patient::updateOrCreate([
            'email' => $request->email,
        ], [
            'doctor_id' => $doctorId,
            'nom' => $nom,
            'prenom' => $prenom,
            'telephone' => null,
            'adresse' => null,
        ]);

        return response()->json([
            'message' => 'Patient (compte) créé avec succès',
            'patient_user' => $user
        ], 201);
    }

    public function getMyPatientUsers()
    {
        try {
            $actor = JWTAuth::parseToken()->authenticate();
        } catch (\Exception $e) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        if (!in_array($actor->role, ['medecin', 'secretaire'])) {
            return response()->json(['error' => 'Accès réservé aux médecins et secrétaires'], 403);
        }

        $doctorId = ($actor->role === 'secretaire') ? $actor->doctor_id : $actor->id;

        $patients = User::where('doctor_id', $doctorId)
                        ->where('role', 'patient')
                        ->get(['id', 'name', 'email', 'created_at']);

        return response()->json($patients);
    }

    public function destroyPatientUser($id)
    {
        try {
            $actor = JWTAuth::parseToken()->authenticate();
        } catch (\Exception $e) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        if (!in_array($actor->role, ['medecin', 'secretaire'])) {
            return response()->json(['error' => 'Accès réservé aux médecins et secrétaires'], 403);
        }

        $doctorId = ($actor->role === 'secretaire') ? $actor->doctor_id : $actor->id;

        $patientUser = User::where('id', $id)
                           ->where('doctor_id', $doctorId)
                           ->where('role', 'patient')
                           ->first();

        if (!$patientUser) {
            return response()->json(['error' => 'Patient non trouvé'], 404);
        }

        // delete the related patient profile if exists
        Patient::where('email', $patientUser->email)->where('doctor_id', $doctorId)->delete();

        $patientUser->delete();

        return response()->json(['message' => 'Compte patient supprimé avec succès']);
    }

    public function getMySecretaries()
    {
        try {
            $doctor = JWTAuth::parseToken()->authenticate();
        } catch (\Exception $e) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        if ($doctor->role !== 'medecin') {
            return response()->json(['error' => 'Accès réservé aux médecins'], 403);
        }

        $secretaries = User::where('doctor_id', $doctor->id)
                           ->where('role', 'secretaire')
                           ->get(['id', 'name', 'email', 'created_at']);

        return response()->json($secretaries);
    }

    public function destroySecretary($id)
    {
        try {
            $doctor = JWTAuth::parseToken()->authenticate();
        } catch (\Exception $e) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        if ($doctor->role !== 'medecin') {
            return response()->json(['error' => 'Accès réservé aux médecins'], 403);
        }

        $secretary = User::where('id', $id)
                         ->where('doctor_id', $doctor->id)
                         ->where('role', 'secretaire')
                         ->first();

        if (!$secretary) {
            return response()->json(['error' => 'Secrétaire non trouvé'], 404);
        }

        $secretary->delete();

        return response()->json(['message' => 'Secrétaire supprimé avec succès']);
    }

    public function storeUser(Request $request)
    {
        $admin = JWTAuth::parseToken()->authenticate();
        if ($admin->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|max:12',
            'role' => 'required|in:admin,medecin,secretaire,patient'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ]);

        return response()->json([
            'message' => 'Utilisateur créé avec succès',
            'user' => $user
        ], 201);
    }

    public function updateUser(Request $request, $id)
    {
        $admin = JWTAuth::parseToken()->authenticate();
        if ($admin->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $user = User::find($id);
        if (!$user) {
            return response()->json(['error' => 'Utilisateur non trouvé'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'password' => 'sometimes|string|min:8|max:12',
            'role' => 'sometimes|in:admin,medecin,secretaire,patient'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->has('name')) $user->name = $request->name;
        if ($request->has('email')) $user->email = $request->email;
        if ($request->has('password')) $user->password = Hash::make($request->password);
        if ($request->has('role')) $user->role = $request->role;
        $user->save();

        return response()->json([
            'message' => 'Utilisateur mis à jour',
            'user' => $user
        ]);
    }

    public function destroyUser($id)
    {
        $admin = JWTAuth::parseToken()->authenticate();
        if ($admin->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $user = User::find($id);
        if (!$user) {
            return response()->json(['error' => 'Utilisateur non trouvé'], 404);
        }

        if ($user->id === $admin->id) {
            return response()->json(['error' => 'Vous ne pouvez pas supprimer votre propre compte'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'Utilisateur supprimé']);
    }

    public function getUnverifiedDoctors()
    {
        $admin = JWTAuth::parseToken()->authenticate();
        if ($admin->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $doctors = User::where('role', 'medecin')
                       ->where('verified', false)
                       ->get(['id', 'name', 'email', 'created_at', 'licence_document']);

        return response()->json($doctors);
    }

    public function verifyDoctor($id)
    {
        try {
            $admin = JWTAuth::parseToken()->authenticate();
            if ($admin->role !== 'admin') {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $doctor = User::where('id', $id)->where('role', 'medecin')->first();
            if (!$doctor) {
                return response()->json(['error' => 'Médecin non trouvé'], 404);
            }

            $doctor->verified = true;
            $doctor->save();

            return response()->json(['message' => 'Compte médecin vérifié avec succès']);
        } catch (\Exception $e) {
            \Log::error('verifyDoctor error: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur interne: ' . $e->getMessage()], 500);
        }
    }

    public function viewLicenceDocument(Request $request, $id)
        {
            try {
                $token = $request->query('token') ?? $request->bearerToken();
                if (!$token) {
                    return response()->json(['error' => 'Token non fourni'], 401);
                }

                try {
                    $admin = JWTAuth::setToken($token)->authenticate();
                } catch (\Exception $e) {
                    return response()->json(['error' => 'Token invalide ou expiré'], 401);
                }

                if ($admin->role !== 'admin') {
                    return response()->json(['error' => 'Unauthorized'], 403);
                }

                $doctor = User::where('id', $id)->where('role', 'medecin')->first();
                if (!$doctor || !$doctor->licence_document) {
                    return response()->json(['error' => 'Document non trouvé'], 404);
                }

                if (!\Storage::disk('public')->exists($doctor->licence_document)) {
                    return response()->json(['error' => 'Fichier introuvable sur le disque'], 404);
                }

                $file = \Storage::disk('public')->get($doctor->licence_document);
                $mime = \Storage::disk('public')->mimeType($doctor->licence_document);

                return response($file, 200)
                    ->header('Content-Type', $mime)
                    ->header('Content-Disposition', 'inline');
            } catch (\Exception $e) {
                \Log::error('viewLicenceDocument error: ' . $e->getMessage());
                return response()->json(['error' => 'Erreur interne: ' . $e->getMessage()], 500);
            }
        }

    public function updateProfile(Request $request)
        {
            try {
                $user = JWTAuth::parseToken()->authenticate();
            } catch (\Exception $e) {
                return response()->json(['error' => 'Non authentifié'], 401);
            }

            $rules = [
                'name' => 'sometimes|string|max:255',
                'email' => 'sometimes|email|unique:users,email,' . $user->id,
            ];

            if ($request->has('password') && !empty($request->password)) {
                $rules['current_password'] = 'required|string';
                $rules['password'] = 'required|string|min:8|max:12|confirmed';
            }

            $validator = Validator::make($request->all(), $rules);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            if ($request->has('password') && !empty($request->password)) {
                if (!Hash::check($request->current_password, $user->password)) {
                    return response()->json(['error' => 'Mot de passe actuel incorrect'], 422);
                }
                $user->password = Hash::make($request->password);
            }

            if ($request->has('name')) {
                $user->name = $request->name;
            }
            if ($request->has('email')) {
                $user->email = $request->email;
            }

            $user->save();

            return response()->json([
                'message' => 'Profil mis à jour avec succès',
                'user' => $user->makeHidden(['password', 'created_at', 'updated_at', 'licence_document']),
            ]);
        }
}