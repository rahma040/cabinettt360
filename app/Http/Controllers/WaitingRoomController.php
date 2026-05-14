<?php

namespace App\Http\Controllers;

use App\Models\WaitingRoom;
use App\Models\Patient;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Tymon\JWTAuth\Facades\JWTAuth;
use Carbon\Carbon;

class WaitingRoomController extends Controller
{
    protected function getCurrentUser()
    {
        try {
            return JWTAuth::parseToken()->authenticate();
        } catch (\Exception $e) {
            Log::error('Error getting current user: ' . $e->getMessage());
            return null;
        }
    }

    protected function getEffectiveDoctorId($user)
    {
        if ($user->role === 'secretaire') {
            return $user->doctor_id;
        }
        return $user->id;
    }

    public function index()
    {
        $user = $this->getCurrentUser();
        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        try {
            $doctorId = $this->getEffectiveDoctorId($user);

            $waitingEntries = WaitingRoom::where('doctor_id', $doctorId)
                ->whereIn('status', ['waiting', 'in_consultation'])
                ->with(['patient', 'appointment'])
                ->orderBy('slot', 'asc') 
                ->get();

            return response()->json($waitingEntries);
        } catch (\Exception $e) {
            Log::error('Error fetching waiting room: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur lors du chargement de la salle d\'attente'], 500);
        }
    }


    public function availablePatients()
    {
        $user = $this->getCurrentUser();
        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        try {
            $doctorId = $this->getEffectiveDoctorId($user);
            $today = Carbon::today()->toDateString();

            $appointments = Appointment::where('doctor_id', $doctorId)
                ->whereDate('appointment_date', $today)
                ->with('patient')
                ->get();

            $activePatientIds = WaitingRoom::where('doctor_id', $doctorId)
                ->whereIn('status', ['waiting', 'in_consultation'])
                ->pluck('patient_id')
                ->toArray();

            $available = $appointments->filter(function ($appointment) use ($activePatientIds) {
                return !in_array($appointment->patient_id, $activePatientIds);
            })->map(function ($appointment) {
                $patientName = '';
                if ($appointment->patient) {
                    $patientName = trim(($appointment->patient->nom ?? '') . ' ' . ($appointment->patient->prenom ?? ''));
                }
                $reason = $appointment->notes ?? 'Motif non spécifié';
                $time = $appointment->start_time ? Carbon::parse($appointment->start_time)->format('H:i') : 'Horaire non défini';

                return [
                    'patient_id'     => $appointment->patient_id,
                    'appointment_id' => $appointment->id,
                    'patient_name'   => $patientName,
                    'reason'         => $reason,
                    'time'           => $time,
                ];
            })->values();

            return response()->json($available);
        } catch (\Exception $e) {
            Log::error('Error in availablePatients: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur lors du chargement des patients disponibles'], 500);
        }
    }

    public function store(Request $request)
    {
        $user = $this->getCurrentUser();
        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        $request->validate([
            'patient_id'    => 'required|integer|exists:patients,id',
            'appointment_id'=> 'nullable|integer|exists:appointments,id',
            'slot'          => 'required|integer|min:0|max:19', 
        ]);

        try {
            $doctorId = $this->getEffectiveDoctorId($user);

            $patient = Patient::where('doctor_id', $doctorId)->find($request->patient_id);
            if (!$patient) {
                return response()->json(['error' => 'Patient non trouvé ou non associé à votre docteur'], 404);
            }

            $existingSlot = WaitingRoom::where('doctor_id', $doctorId)
                ->where('slot', $request->slot)
                ->whereIn('status', ['waiting', 'in_consultation'])
                ->first();

            if ($existingSlot) {
                return response()->json(['error' => 'Ce slot est déjà occupé'], 400);
            }

            $existingPatient = WaitingRoom::where('patient_id', $request->patient_id)
                ->where('doctor_id', $doctorId)
                ->whereIn('status', ['waiting', 'in_consultation'])
                ->first();

            if ($existingPatient) {
                return response()->json(['error' => 'Ce patient est déjà dans la salle d\'attente'], 400);
            }

            $waiting = WaitingRoom::create([
                'patient_id'     => $request->patient_id,
                'doctor_id'      => $doctorId,
                'secretary_id'   => $user->id,
                'appointment_id' => $request->appointment_id,
                'slot'           => $request->slot,
                'status'         => 'waiting',
                'arrived_at'     => now(),
            ]);

            $waiting->load('patient', 'appointment');

            return response()->json($waiting, 201);
        } catch (\Exception $e) {
            Log::error('Error adding to waiting room: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur lors de l\'ajout à la salle d\'attente'], 500);
        }
    }


    public function update(Request $request, $id)
    {
        $user = $this->getCurrentUser();
        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        $request->validate([
            'status' => 'required|in:waiting,in_consultation,completed,cancelled',
        ]);

        try {
            $doctorId = $this->getEffectiveDoctorId($user);

            $waiting = WaitingRoom::where('doctor_id', $doctorId)->findOrFail($id);

            $data = ['status' => $request->status];

            if ($request->status === 'in_consultation' && !$waiting->called_at) {
                $data['called_at'] = now();
            } elseif (in_array($request->status, ['completed', 'cancelled']) && !$waiting->left_at) {
                $data['left_at'] = now();
            }

            $waiting->update($data);

            return response()->json($waiting);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'Entrée non trouvée'], 404);
        } catch (\Exception $e) {
            Log::error('Error updating waiting room entry: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur lors de la mise à jour'], 500);
        }
    }


    public function destroy($id)
    {
        $user = $this->getCurrentUser();
        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        try {
            $doctorId = $this->getEffectiveDoctorId($user);
            $waiting = WaitingRoom::where('doctor_id', $doctorId)->findOrFail($id);
            $waiting->delete();

            return response()->json(['message' => 'Patient retiré de la salle d\'attente']);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'Entrée non trouvée'], 404);
        } catch (\Exception $e) {
            Log::error('Error deleting waiting room entry: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur lors de la suppression'], 500);
        }
    }
}