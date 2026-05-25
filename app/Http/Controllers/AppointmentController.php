<?php

namespace App\Http\Controllers;

use OpenApi\Annotations as OA;
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

    /**
     * @OA\Get(
     *   path="/appointments",
     *   tags={"Appointment"},
     *   summary="List appointments for the current doctor",
     *   security={{"bearerAuth":{}}},
     *   @OA\Parameter(name="start_date", in="query", @OA\Schema(type="string", format="date")),
     *   @OA\Parameter(name="end_date", in="query", @OA\Schema(type="string", format="date")),
     *   @OA\Response(response=200, description="List of appointments", @OA\JsonContent(type="array", @OA\Items(type="object"))),
     *   @OA\Response(response=401, description="Unauthorized")
     * )
     */


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

    /**
     * @OA\Post(
     *   path="/appointments",
     *   tags={"Appointment"},
     *   summary="Create an appointment",
     *   security={{"bearerAuth":{}}},
        *   @OA\RequestBody(
        *     required=true,
        *     @OA\MediaType(
        *       mediaType="application/json",
        *       @OA\Schema(
        *         type="object",
        *         required={"patient_id","appointment_date","start_time","end_time"},
        *         @OA\Property(property="patient_id", type="integer", description="Existing patient ID", example=12),
        *         @OA\Property(property="appointment_date", type="string", format="date", example="2026-06-15"),
        *         @OA\Property(property="start_time", type="string", example="09:00"),
        *         @OA\Property(property="end_time", type="string", example="09:30"),
        *         @OA\Property(property="status", type="string", description="scheduled|completed|cancelled", example="scheduled"),
        *         @OA\Property(property="notes", type="string", description="Optional notes", example="Follow-up visit")
        *       )
        *     )
        *   ),
     *   @OA\Response(response=201, description="Appointment created", @OA\JsonContent(type="object")),
     *   @OA\Response(response=401, description="Unauthorized"),
     *   @OA\Response(response=422, description="Validation error")
     * )
     */


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

    /**
     * @OA\Get(
     *   path="/appointments/{id}",
     *   tags={"Appointment"},
     *   summary="Get appointment details",
     *   security={{"bearerAuth":{}}},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\Response(response=200, description="Appointment details", @OA\JsonContent(type="object")),
     *   @OA\Response(response=401, description="Unauthorized"),
     *   @OA\Response(response=404, description="Not found")
     * )
     */


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

    /**
     * @OA\Put(
     *   path="/appointments/{id}",
     *   tags={"Appointment"},
     *   summary="Update an appointment",
     *   security={{"bearerAuth":{}}},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
        *   @OA\RequestBody(
        *     @OA\MediaType(
        *       mediaType="application/json",
        *       @OA\Schema(
        *         type="object",
        *         @OA\Property(property="patient_id", type="integer", example=12),
        *         @OA\Property(property="appointment_date", type="string", format="date", example="2026-06-15"),
        *         @OA\Property(property="start_time", type="string", example="09:00"),
        *         @OA\Property(property="end_time", type="string", example="09:30"),
        *         @OA\Property(property="status", type="string", example="scheduled"),
        *         @OA\Property(property="notes", type="string", example="Updated notes")
        *       )
        *     )
        *   ),
     *   @OA\Response(response=200, description="Appointment updated", @OA\JsonContent(type="object")),
     *   @OA\Response(response=401, description="Unauthorized"),
     *   @OA\Response(response=404, description="Not found")
     * )
     */


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

    /**
     * @OA\Delete(
     *   path="/appointments/{id}",
     *   tags={"Appointment"},
     *   summary="Delete an appointment",
     *   security={{"bearerAuth":{}}},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\Response(response=200, description="Appointment deleted"),
     *   @OA\Response(response=401, description="Unauthorized"),
     *   @OA\Response(response=404, description="Not found")
     * )
     */

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

    /**
     * @OA\Get(
     *   path="/appointments/pending-requests",
     *   tags={"Appointment"},
     *   summary="Get pending appointment requests",
     *   security={{"bearerAuth":{}}},
     *   @OA\Response(response=200, description="Pending requests", @OA\JsonContent(type="array", @OA\Items(type="object"))),
     *   @OA\Response(response=401, description="Unauthorized")
     * )
     */

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

    /**
     * @OA\Post(
     *   path="/appointments/{id}/accept-request",
     *   tags={"Appointment"},
     *   summary="Accept an appointment request",
     *   security={{"bearerAuth":{}}},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\Response(response=200, description="Appointment request accepted", @OA\JsonContent(type="object")),
     *   @OA\Response(response=401, description="Unauthorized"),
     *   @OA\Response(response=404, description="Not found")
     * )
     */

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

    /**
     * @OA\Post(
     *   path="/appointments/{id}/deny-request",
     *   tags={"Appointment"},
     *   summary="Deny an appointment request",
     *   security={{"bearerAuth":{}}},
     *   @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *   @OA\Response(response=200, description="Appointment request denied", @OA\JsonContent(type="object")),
     *   @OA\Response(response=401, description="Unauthorized"),
     *   @OA\Response(response=404, description="Not found")
     * )
     */
}