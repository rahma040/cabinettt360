<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Visite;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use Carbon\Carbon;

class AppointmentController extends Controller
{

    private function getDoctorId($user)
    {
        if ($user->role === 'secretaire') {
            return $user->doctor_id;
        }
        return $user->id;
    }


    public function index(Request $request)
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();
        } catch (\Exception $e) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $doctorId = $this->getDoctorId($user);

        $query = Appointment::with('patient:id,nom,prenom,email')
            ->where('doctor_id', $doctorId);


        if ($request->has('start_date') && $request->has('end_date')) {
            $startDate = Carbon::parse($request->start_date)->startOfDay();
            $endDate = Carbon::parse($request->end_date)->endOfDay();

            $query->whereBetween('appointment_date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')]);
        }

        $appointments = $query->orderBy('appointment_date')->orderBy('start_time')->get();

        return response()->json($appointments);
    }


    public function store(Request $request)
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();
        } catch (\Exception $e) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'appointment_date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'status' => 'sometimes|in:scheduled,completed,cancelled',
            'notes' => 'nullable|string',
        ]);


        $validated['status'] = $validated['status'] ?? 'scheduled';
        $validated['doctor_id'] = $this->getDoctorId($user);


        $appointment = Appointment::create($validated);


        if ($user->role === 'secretaire') {
            $doctor = \App\Models\User::find($user->doctor_id);
            $doctorName = $doctor ? $doctor->name : $user->name; 
        } else {
            $doctorName = $user->name;
        }

        Visite::create([
            'patient_id'          => $validated['patient_id'],
            'date_visite'         => $validated['appointment_date'],
            'motif'               => 'Rendez-vous',                    
            'diagnostic'          => null,
            'prescription_texte'  => null,
            'prescription_fichiers'=> null,
            'montant'             => 0,
            'statut_paiement'     => 'en_attente',                      
            'medecin'             => $doctorName,                      
            'notes'               => $validated['notes'] ?? null,
        ]);

        return response()->json($appointment->load('patient:id,nom,prenom'), 201);
    }


    public function show($id)
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();
        } catch (\Exception $e) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $doctorId = $this->getDoctorId($user);

        $appointment = Appointment::with('patient:id,nom,prenom,email')
            ->where('doctor_id', $doctorId)
            ->findOrFail($id);

        return response()->json($appointment);
    }


    public function update(Request $request, $id)
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();
        } catch (\Exception $e) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $doctorId = $this->getDoctorId($user);

        $appointment = Appointment::where('doctor_id', $doctorId)->findOrFail($id);

        $validated = $request->validate([
            'patient_id' => 'sometimes|exists:patients,id',
            'appointment_date' => 'sometimes|date',
            'start_time' => 'sometimes|date_format:H:i',
            'end_time' => 'sometimes|date_format:H:i|after:start_time',
            'status' => 'sometimes|in:scheduled,completed,cancelled',
            'notes' => 'nullable|string',
        ]);

        $appointment->update($validated);

        return response()->json($appointment->load('patient:id,nom,prenom,email'));
    }


    public function destroy($id)
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();
        } catch (\Exception $e) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $doctorId = $this->getDoctorId($user);

        $appointment = Appointment::where('doctor_id', $doctorId)->findOrFail($id);
        $appointment->delete();

        return response()->json(['message' => 'Appointment deleted']);
    }

    public function getPendingRequests()
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();
        } catch (\Exception $e) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $doctorId = $this->getDoctorId($user);

        $appointments = Appointment::with('patient:id,nom,prenom,email,telephone')
            ->where('doctor_id', $doctorId)
            ->where('request_status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($appointments);
    }

    public function acceptRequest($id)
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();
        } catch (\Exception $e) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $doctorId = $this->getDoctorId($user);

        $appointment = Appointment::where('doctor_id', $doctorId)
            ->where('request_status', 'pending')
            ->findOrFail($id);

        $appointment->update(['request_status' => 'accepted']);

        return response()->json(['message' => 'Appointment request accepted', 'appointment' => $appointment->load('patient:id,nom,prenom,email')]);
    }

    public function denyRequest($id)
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();
        } catch (\Exception $e) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $doctorId = $this->getDoctorId($user);

        $appointment = Appointment::where('doctor_id', $doctorId)
            ->where('request_status', 'pending')
            ->findOrFail($id);

        $appointment->update(['request_status' => 'denied']);

        return response()->json(['message' => 'Appointment request denied', 'appointment' => $appointment]);
    }
}