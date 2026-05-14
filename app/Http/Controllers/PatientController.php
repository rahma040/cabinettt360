<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Patient;
use App\Models\DocumentMedical;
use App\Models\Visite;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Tymon\JWTAuth\Facades\JWTAuth;
use Carbon\Carbon;

class PatientController extends Controller
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

    protected function getPatientForCurrentUser($user)
    {
        return Patient::with(['documents', 'visites', 'doctor:id,name,email'])
            ->where('email', $user->email)
            ->first();
    }

    protected function resolvePatientDoctorId(Patient $patient)
    {
        if ($patient->doctor_id) {
            return $patient->doctor_id;
        }

        $doctor = User::where('role', 'medecin')
            ->where('verified', true)
            ->orderBy('id')
            ->first();

        return $doctor?->id;
    }

    protected function normalizePrescriptionFiles($value): array
    {
        if (empty($value)) {
            return [];
        }

        if (is_string($value)) {
            return json_decode($value, true) ?? [];
        }

        return is_array($value) ? $value : [];
    }

    public function profile()
    {
        $user = $this->getCurrentUser();

        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        if ($user->role !== 'patient') {
            return response()->json(['error' => 'Accès réservé aux patients'], 403);
        }

        $patient = $this->getPatientForCurrentUser($user);

        return response()->json([
            'user' => $user,
            'patient' => $patient,
            'message' => 'Profil patient chargé avec succès',
        ]);
    }

    public function patientAppointments()
    {
        $user = $this->getCurrentUser();

        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        if ($user->role !== 'patient') {
            return response()->json(['error' => 'Accès réservé aux patients'], 403);
        }

        $patient = $this->getPatientForCurrentUser($user);

        if (!$patient) {
            return response()->json(['error' => 'Patient non trouvé'], 404);
        }

        $appointments = Appointment::with('doctor:id,name')
            ->where('patient_id', $patient->id)
            ->orderBy('appointment_date')
            ->orderBy('start_time')
            ->get();

        return response()->json([
            'patient' => $patient,
            'appointments' => $appointments,
        ]);
    }

    public function storePatientAppointment(Request $request)
    {
        $user = $this->getCurrentUser();

        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        if ($user->role !== 'patient') {
            return response()->json(['error' => 'Accès réservé aux patients'], 403);
        }

        $patient = $this->getPatientForCurrentUser($user);

        if (!$patient) {
            return response()->json(['error' => 'Patient non trouvé'], 404);
        }

        $validated = $request->validate([
            'appointment_date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'notes' => 'nullable|string',
        ]);

        $doctorId = $this->resolvePatientDoctorId($patient);

        if (!$doctorId) {
            return response()->json([
                'error' => 'Aucun médecin n\'est encore associé à votre dossier. Veuillez contacter le secrétariat.'
            ], 422);
        }

        $appointment = Appointment::create([
            'doctor_id' => $doctorId,
            'patient_id' => $patient->id,
            'appointment_date' => Carbon::parse($validated['appointment_date'])->format('Y-m-d'),
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'status' => 'scheduled',
            'request_status' => 'pending',
            'notes' => $validated['notes'] ?? null,
        ]);

        $doctor = User::find($doctorId);
        $doctorName = $doctor ? $doctor->name : 'Médecin';

        Visite::create([
            'patient_id' => $patient->id,
            'date_visite' => $validated['appointment_date'],
            'motif' => 'Rendez-vous',
            'diagnostic' => null,
            'prescription_texte' => null,
            'prescription_fichiers' => null,
            'montant' => 0,
            'statut_paiement' => 'en_attente',
            'medecin' => $doctorName,
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json($appointment->load('patient:id,nom,prenom'), 201);
    }


    public function index()
    {
        $user = $this->getCurrentUser();
        
        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }
        
        try {
            $doctorId = $this->getEffectiveDoctorId($user);
            
            $patients = Patient::where('doctor_id', $doctorId)
                ->with(['visites' => function($q) {
                    $q->latest()->limit(5);
                }])
                ->get();
            
            return response()->json($patients);
        } catch (\Exception $e) {
            Log::error('Error fetching patients: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur lors du chargement des patients'], 500);
        }
    }


    public function store(Request $request)
    {
        $user = $this->getCurrentUser();
        
        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }
        
        try {
            $data = $request->all();
            $data['doctor_id'] = $this->getEffectiveDoctorId($user);
            
            $patient = Patient::create($data);
            return response()->json($patient, 201);
        } catch (\Exception $e) {
            Log::error('Error creating patient: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur lors de la création du patient'], 500);
        }
    }

    public function show($id)
    {
        $user = $this->getCurrentUser();
        
        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }
        
        try {
            $doctorId = $this->getEffectiveDoctorId($user);
            
            $patient = Patient::where('doctor_id', $doctorId)
                ->with(['documents', 'visites'])
                ->findOrFail($id);
                

            if ($patient->visites) {
                foreach ($patient->visites as $visite) {
                    if ($visite->prescription_fichiers && is_string($visite->prescription_fichiers)) {
                        $visite->prescription_fichiers = json_decode($visite->prescription_fichiers, true) ?? [];
                    }
                }
            }
                
            return response()->json($patient);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'Patient non trouvé'], 404);
        } catch (\Exception $e) {
            Log::error('Error showing patient: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur lors du chargement du patient'], 500);
        }
    }


    public function update(Request $request, $id)
    {
        $user = $this->getCurrentUser();
        
        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }
        
        try {
            $doctorId = $this->getEffectiveDoctorId($user);
            
            $patient = Patient::where('doctor_id', $doctorId)->findOrFail($id);
            $patient->update($request->all());
            
            return response()->json($patient);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'Patient non trouvé'], 404);
        } catch (\Exception $e) {
            Log::error('Error updating patient: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur lors de la mise à jour du patient'], 500);
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
            
            $patient = Patient::where('doctor_id', $doctorId)->findOrFail($id);
            

            foreach ($patient->documents as $document) {
                if ($document->fichier_path && Storage::disk('public')->exists($document->fichier_path)) {
                    Storage::disk('public')->delete($document->fichier_path);
                }
            }
            

            foreach ($patient->visites as $visite) {
                $files = json_decode($visite->prescription_fichiers, true) ?? [];
                foreach ($files as $file) {
                    if (isset($file['path']) && Storage::disk('public')->exists($file['path'])) {
                        Storage::disk('public')->delete($file['path']);
                    }
                }
            }
            
            $patient->delete();
            
            return response()->json(['message' => 'Patient supprimé avec succès']);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'Patient non trouvé'], 404);
        } catch (\Exception $e) {
            Log::error('Error deleting patient: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur lors de la suppression du patient'], 500);
        }
    }



    public function uploadDocument(Request $request, $id)
    {
        $user = $this->getCurrentUser();
        
        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }
        
        try {
            $doctorId = $this->getEffectiveDoctorId($user);
            $patient = Patient::where('doctor_id', $doctorId)->findOrFail($id);
            
            Log::info('Upload document request', [
                'headers' => $request->headers->all(),
                'all_files' => $request->allFiles(),
                'has_file' => $request->hasFile('document'),
                'file_keys' => array_keys($request->allFiles()),
                'content_type' => $request->header('Content-Type')
            ]);
            

            $request->validate([
                'document' => 'required|file|mimes:pdf,jpg,jpeg,png|max:20480', // 400Kb max - must fixed soon
                'titre' => 'nullable|string|max:255',
                'type' => 'nullable|string|in:scan,analyse_sang,radio,ordonnance,autre',
                'date_document' => 'nullable|date',
                'notes' => 'nullable|string'
            ]);
            
            $data = [
                'patient_id' => $patient->id,
                'titre' => $request->input('titre'),
                'type' => $request->input('type', 'autre'),
                'date_document' => $request->input('date_document'),
                'notes' => $request->input('notes')
            ];
            

            if ($request->hasFile('document')) {
                $file = $request->file('document');
                

                if ($file->isValid()) {
                    $originalName = $file->getClientOriginalName();
                    $extension = $file->getClientOriginalExtension();
                    $fileName = time() . '_' . uniqid() . '.' . $extension;
                    
                    $path = $file->storeAs('documents/' . $patient->id, $fileName, 'public');
                    
                    $data['fichier_path'] = $path;
                    $data['fichier_nom'] = $originalName;
                    
                    Log::info('Document uploaded successfully', [
                        'patient_id' => $patient->id,
                        'file_name' => $fileName,
                        'original_name' => $originalName,
                        'path' => $path,
                        'file_size' => $file->getSize(),
                        'file_mime' => $file->getMimeType()
                    ]);
                } else {
                    Log::error('File is invalid', ['error' => $file->getErrorMessage()]);
                    return response()->json(['error' => 'Fichier invalide: ' . $file->getErrorMessage()], 400);
                }
            } else {
                Log::error('No file found in request', [
                    'all_files' => $request->allFiles(),
                    'has_file' => $request->hasFile('document'),
                    'file_keys' => array_keys($request->allFiles())
                ]);
                return response()->json(['error' => 'Aucun fichier trouvé dans la requête. Utilisez le champ "document"'], 400);
            }

            $document = DocumentMedical::create($data);
            
            return response()->json($document, 201);
            
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::error('Patient not found: ' . $e->getMessage());
            return response()->json(['error' => 'Patient non trouvé'], 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation error: ' . json_encode($e->errors()));
            return response()->json(['error' => 'Erreur de validation', 'details' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Erreur upload document: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Erreur lors de l\'upload: ' . $e->getMessage()], 500);
        }
    }

    public function viewDocument($id, $documentId)
    {
        $token = request()->query('token');
        if ($token) {
            try {
                $user = JWTAuth::setToken($token)->authenticate();
                if (!$user) {
                    return response()->json(['error' => 'Non authentifié'], 401);
                }
            } catch (\Exception $e) {
                return response()->json(['error' => 'Token invalide'], 401);
            }
        } else {
            $user = $this->getCurrentUser();
            if (!$user) {
                return response()->json(['error' => 'Non authentifié'], 401);
            }
        }
        
        try {
            $doctorId = $this->getEffectiveDoctorId($user);
            $patient = Patient::where('doctor_id', $doctorId)->findOrFail($id);
            $document = DocumentMedical::where('patient_id', $patient->id)->findOrFail($documentId);
            
            if (!$document->fichier_path) {
                return response()->json(['error' => 'Chemin du fichier non trouvé'], 404);
            }
            
            $fullPath = storage_path('app/public/' . $document->fichier_path);
            
            if (!file_exists($fullPath)) {
                Log::error('Fichier non trouvé: ' . $fullPath);
                return response()->json(['error' => 'Fichier non trouvé sur le serveur'], 404);
            }

            return response()->file($fullPath);
            
        } catch (\Exception $e) {
            Log::error('Erreur view document: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur lors de l\'accès au document'], 500);
        }
    }

    public function downloadDocument($id, $documentId)
    {
        $token = request()->query('token');
        if ($token) {
            try {
                $user = JWTAuth::setToken($token)->authenticate();
                if (!$user) {
                    return response()->json(['error' => 'Non authentifié'], 401);
                }
            } catch (\Exception $e) {
                return response()->json(['error' => 'Token invalide'], 401);
            }
        } else {
            $user = $this->getCurrentUser();
            if (!$user) {
                return response()->json(['error' => 'Non authentifié'], 401);
            }
        }
        
        try {
            $doctorId = $this->getEffectiveDoctorId($user);
            $patient = Patient::where('doctor_id', $doctorId)->findOrFail($id);
            $document = DocumentMedical::where('patient_id', $patient->id)->findOrFail($documentId);
            
            if (!$document->fichier_path) {
                return response()->json(['error' => 'Chemin du fichier non trouvé'], 404);
            }
            
            if (!Storage::disk('public')->exists($document->fichier_path)) {
                Log::error('Fichier non trouvé: ' . $document->fichier_path);
                return response()->json(['error' => 'Fichier non trouvé sur le serveur'], 404);
            }

            $fullPath = storage_path('app/public/' . $document->fichier_path);
            return response()->download($fullPath, $document->fichier_nom);
            
        } catch (\Exception $e) {
            Log::error('Erreur download document: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur lors du téléchargement'], 500);
        }
    }

    public function deleteDocument($id, $documentId)
    {
        $user = $this->getCurrentUser();
        
        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }
        
        try {
            $doctorId = $this->getEffectiveDoctorId($user);
            $patient = Patient::where('doctor_id', $doctorId)->findOrFail($id);
            $document = DocumentMedical::where('patient_id', $patient->id)->findOrFail($documentId);
            
            if ($document->fichier_path && Storage::disk('public')->exists($document->fichier_path)) {
                Storage::disk('public')->delete($document->fichier_path);
            }
            
            $document->delete();
            return response()->json(['message' => 'Document supprimé avec succès']);
            
        } catch (\Exception $e) {
            Log::error('Erreur delete document: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur lors de la suppression'], 500);
        }
    }


    public function addVisite(Request $request, $id)
    {
        $user = $this->getCurrentUser();
        
        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }
        
        try {
            $doctorId = $this->getEffectiveDoctorId($user);
            $patient = Patient::where('doctor_id', $doctorId)->findOrFail($id);
            
            Log::info('Adding visite for patient', [
                'patient_id' => $patient->id,
                'request_data' => $request->except(['prescription_fichiers'])
            ]);
            
            $data = [
                'patient_id' => $patient->id,
                'date_visite' => $request->date_visite,
                'motif' => $request->motif,
                'diagnostic' => $request->diagnostic,
                'prescription_texte' => $request->prescription_texte,
                'montant' => $request->montant,
                'statut_paiement' => $request->statut_paiement ?? 'en_attente',
                'medecin' => $request->medecin,
                'notes' => $request->notes,
                'statut' => $request->statut ?? 'planifié',
            ];
            
            if ($request->hasFile('prescription_fichiers')) {
                $files = $request->file('prescription_fichiers');
                $prescriptionFiles = [];
                
                foreach ($files as $file) {
                    if ($file->isValid()) {
                        $fileName = time() . '_' . uniqid() . '_' . $file->getClientOriginalName();
                        $path = $file->storeAs('prescriptions/' . $patient->id, $fileName, 'public');
                        $prescriptionFiles[] = [
                            'path' => $path,
                            'nom' => $file->getClientOriginalName()
                        ];
                        
                        Log::info('Prescription file uploaded', [
                            'patient_id' => $patient->id,
                            'file_name' => $fileName,
                            'path' => $path
                        ]);
                    }
                }
                
                if (!empty($prescriptionFiles)) {
                    $data['prescription_fichiers'] = json_encode($prescriptionFiles);
                }
            }

            $visite = Visite::create($data);
            
            $visite->prescription_fichiers = $this->normalizePrescriptionFiles($visite->prescription_fichiers);
            
            Log::info('Visite created successfully', ['visite_id' => $visite->id]);
            
            return response()->json($visite, 201);
            
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::error('Patient not found for addVisite: ' . $e->getMessage());
            return response()->json(['error' => 'Patient non trouvé'], 404);
        } catch (\Exception $e) {
            Log::error('Erreur add visite: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Erreur lors de l\'ajout de la visite: ' . $e->getMessage()], 500);
        }
    }

    public function updateVisite(Request $request, $id, $visiteId)
    {
        $user = $this->getCurrentUser();
        
        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }
        
        try {
            Log::info('Update visite request received', [
                'patient_id' => $id,
                'visite_id' => $visiteId,
                'request_data' => $request->all(),
                'user_id' => $user->id
            ]);


            Log::info('Statut value from request: ' . ($request->statut ?? 'null'));

            $doctorId = $this->getEffectiveDoctorId($user);
            $patient = Patient::where('doctor_id', $doctorId)->findOrFail($id);
            $visite = Visite::where('patient_id', $patient->id)->findOrFail($visiteId);

            $updateData = $request->all();

            unset($updateData['patient_id']);
            unset($updateData['id']);
            unset($updateData['created_at']);
            unset($updateData['updated_at']);
            unset($updateData['prescription_fichiers']); 

            Log::info('Updating visite with data', ['update_data' => $updateData]);

            $visite->update($updateData);


            $visite = $visite->fresh();


            $visite->prescription_fichiers = $this->normalizePrescriptionFiles($visite->prescription_fichiers);

            Log::info('Visite updated successfully', [
                'visite_id' => $visite->id,
                'new_status' => $visite->statut,
                'new_payment_status' => $visite->statut_paiement
            ]);

            return response()->json($visite);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::error('Patient or visite not found for updateVisite: ' . $e->getMessage());
            return response()->json(['error' => 'Patient ou visite non trouvé'], 404);
        } catch (\Exception $e) {
            Log::error('Erreur update visite: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Erreur lors de la mise à jour: ' . $e->getMessage()], 500);
        }
    }

    public function deleteVisite($id, $visiteId)
    {
        $user = $this->getCurrentUser();
        
        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }
        
        try {
            $doctorId = $this->getEffectiveDoctorId($user);
            $patient = Patient::where('doctor_id', $doctorId)->findOrFail($id);
            $visite = Visite::where('patient_id', $patient->id)->findOrFail($visiteId);
            
            $files = $this->normalizePrescriptionFiles($visite->prescription_fichiers);

            foreach ($files as $file) {
                if (isset($file['path']) && Storage::disk('public')->exists($file['path'])) {
                    Storage::disk('public')->delete($file['path']);
                }
            }
            
            $visite->delete();
            return response()->json(['message' => 'Visite supprimée avec succès']);
            
        } catch (\Exception $e) {
            Log::error('Erreur delete visite: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur lors de la suppression'], 500);
        }
    }

    public function viewPrescription($id, $visiteId, $fileIndex)
    {
        $token = request()->query('token');
        if ($token) {
            try {
                $user = JWTAuth::setToken($token)->authenticate();
                if (!$user) {
                    return response()->json(['error' => 'Non authentifié'], 401);
                }
            } catch (\Exception $e) {
                return response()->json(['error' => 'Token invalide'], 401);
            }
        } else {
            $user = $this->getCurrentUser();
            if (!$user) {
                return response()->json(['error' => 'Non authentifié'], 401);
            }
        }
        
        try {
            $doctorId = $this->getEffectiveDoctorId($user);
            $patient = Patient::where('doctor_id', $doctorId)->findOrFail($id);
            $visite = Visite::where('patient_id', $patient->id)->findOrFail($visiteId);
            
            $files = [];
            $files = $this->normalizePrescriptionFiles($visite->prescription_fichiers);
            
            if (!isset($files[$fileIndex])) {
                return response()->json(['error' => 'Fichier non trouvé'], 404);
            }
            
            $file = $files[$fileIndex];
            if (!isset($file['path']) || !Storage::disk('public')->exists($file['path'])) {
                return response()->json(['error' => 'Fichier non trouvé sur le serveur'], 404);
            }
            
            $fullPath = storage_path('app/public/' . $file['path']);
            return response()->file($fullPath);
            
        } catch (\Exception $e) {
            Log::error('Erreur view prescription: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur lors de l\'accès au fichier'], 500);
        }
    }

    public function downloadPrescription($id, $visiteId, $fileIndex)
    {
        $token = request()->query('token');
        if ($token) {
            try {
                $user = JWTAuth::setToken($token)->authenticate();
                if (!$user) {
                    return response()->json(['error' => 'Non authentifié'], 401);
                }
            } catch (\Exception $e) {
                return response()->json(['error' => 'Token invalide'], 401);
            }
        } else {
            $user = $this->getCurrentUser();
            if (!$user) {
                return response()->json(['error' => 'Non authentifié'], 401);
            }
        }
        
        try {
            $doctorId = $this->getEffectiveDoctorId($user);
            $patient = Patient::where('doctor_id', $doctorId)->findOrFail($id);
            $visite = Visite::where('patient_id', $patient->id)->findOrFail($visiteId);
            
            $files = [];
            $files = $this->normalizePrescriptionFiles($visite->prescription_fichiers);
            
            if (!isset($files[$fileIndex])) {
                return response()->json(['error' => 'Fichier non trouvé'], 404);
            }
            
            $file = $files[$fileIndex];
            if (!isset($file['path']) || !Storage::disk('public')->exists($file['path'])) {
                return response()->json(['error' => 'Fichier non trouvé sur le serveur'], 404);
            }
            
            $fullPath = storage_path('app/public/' . $file['path']);
            return response()->download($fullPath, $file['nom']);
            
        } catch (\Exception $e) {
            Log::error('Erreur download prescription: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur lors du téléchargement'], 500);
        }
    }

    public function addPrescriptionFile(Request $request, $id, $visiteId)
    {
        $user = $this->getCurrentUser();
        
        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }
        
        try {
            $doctorId = $this->getEffectiveDoctorId($user);
            $patient = Patient::where('doctor_id', $doctorId)->findOrFail($id);
            $visite = Visite::where('patient_id', $patient->id)->findOrFail($visiteId);
            
            $request->validate([
                'prescription_file' => 'required|file|mimes:pdf|max:20480', // Max 20MB
            ]);
            
            $file = $request->file('prescription_file');
            if (!$file->isValid()) {
                return response()->json(['error' => 'Fichier invalide'], 400);
            }
            
            $fileName = time() . '_' . uniqid() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('prescriptions/' . $patient->id, $fileName, 'public');
            
            $newFile = [
                'path' => $path,
                'nom' => $file->getClientOriginalName(),
                'type' => 'pdf'
            ];
            
            $existingFiles = $visite->prescription_fichiers;
            if (is_string($existingFiles)) {
                $existingFiles = json_decode($existingFiles, true) ?? [];
            } elseif (is_null($existingFiles)) {
                $existingFiles = [];
            }
            
            $existingFiles[] = $newFile;
            $visite->prescription_fichiers = json_encode($existingFiles);
            $visite->save();
            
            return response()->json($visite);
            
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'Patient ou visite non trouvé'], 404);
        } catch (\Exception $e) {
            Log::error('Erreur add prescription file: ' . $e->getMessage());
            return response()->json(['error' => 'Erreur lors de l\'ajout du fichier'], 500);
        }
    }
}