<?php
namespace App\Http\Controllers;

use App\Models\Visite;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Tymon\JWTAuth\Facades\JWTAuth;

class SecretaryPaymentController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();
            
            if ($user->role !== 'secretaire') {
                return response()->json(['error' => 'Non autorisé'], 403);
            }
            
            $doctorId = $user->doctor_id;
            if (!$doctorId) {
                return response()->json(['error' => 'Secrétaire non rattaché à un médecin'], 400);
            }
            
            $visites = Visite::whereHas('patient', function($query) use ($doctorId) {
                    $query->where('doctor_id', $doctorId);
                })
                ->where('statut_paiement', '!=', 'payé') 
                ->with('patient')
                ->orderBy('date_visite', 'desc')
                ->get();
            
            return response()->json($visites);
            
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    
    public function finalize(Request $request, $visiteId)
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();
            
            if ($user->role !== 'secretaire') {
                return response()->json(['error' => 'Non autorisé'], 403);
            }
            
            $doctorId = $user->doctor_id;
            if (!$doctorId) {
                return response()->json(['error' => 'Secrétaire non rattaché à un médecin'], 400);
            }
            
            $visite = Visite::with('patient')
                ->whereHas('patient', function($query) use ($doctorId) {
                    $query->where('doctor_id', $doctorId);
                })
                ->find($visiteId);
                
            if (!$visite) {
                return response()->json(['error' => 'Visite non trouvée'], 404);
            }
            
            $visite->statut_paiement = 'payé';
            $visite->save();
            
            $receiptData = [
                'patient' => $visite->patient->nom . ' ' . $visite->patient->prenom,
                'date_visite' => $visite->date_visite,
                'montant' => $visite->montant,
                'medecin' => $visite->medecin ?? $visite->patient->doctor->name ?? 'Dr. ',
                'payment_date' => now()->format('d/m/Y H:i'),
                'visit_id' => $visite->id,
            ];
            
            return response()->json([
                'success' => true,
                'message' => 'Paiement finalisé',
                'receipt' => $receiptData
            ]);
            
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function paid(Request $request)
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();
            
            if ($user->role !== 'secretaire') {
                return response()->json(['error' => 'Non autorisé'], 403);
            }
            
            $doctorId = $user->doctor_id;
            if (!$doctorId) {
                return response()->json(['error' => 'Secrétaire non rattaché à un médecin'], 400);
            }
            
            $visites = Visite::whereHas('patient', function($query) use ($doctorId) {
                    $query->where('doctor_id', $doctorId);
                })
                ->where('statut_paiement', 'payé')
                ->with('patient')
                ->orderBy('date_visite', 'desc')
                ->get();
            
            return response()->json($visites);
            
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}