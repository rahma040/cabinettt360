<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\DocumentMedical;
use App\Models\Patient;
use App\Models\User;
use App\Models\Visite;
use Carbon\Carbon;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use RuntimeException;

class DoctorAssistantService
{
    private string $apiKey;

    private string $model;

    public function __construct()
    {
        $this->apiKey = (string) config('services.gemini.api_key');
        $this->model = (string) config('services.gemini.model', 'gemini-2.0-flash');
    }

    public function chat(User $doctor, string $message, array $history = []): array
    {
        if (trim($message) === '') {
            throw new RuntimeException('Le message ne peut pas être vide.');
        }

        if ($this->apiKey === '') {
            throw new RuntimeException('La clé Gemini est manquante.');
        }

        $context = $this->buildContext($doctor, $message);
        $answer = $this->generateAnswer($doctor, $message, $history, $context);

        return [
            'answer' => $answer,
            'context' => $context,
        ];
    }

    private function generateAnswer(User $doctor, string $message, array $history, array $context): string
    {
        $payload = [
            'systemInstruction' => [
                'parts' => [[
                    'text' => $this->buildSystemInstruction(),
                ]],
            ],
            'contents' => $this->buildContents($doctor, $message, $history, $context),
            'generationConfig' => [
                'temperature' => 0.2,
                'topP' => 0.9,
                'topK' => 40,
                'maxOutputTokens' => 900,
            ],
        ];

        try {
            $response = Http::timeout(60)
                ->retry(2, 400)
                ->acceptJson()
                ->post($this->endpoint(), $payload)
                ->throw();
        } catch (RequestException $e) {
            throw new RuntimeException('Impossible de joindre Gemini: ' . $e->getMessage(), 0, $e);
        }

        $answer = data_get($response->json(), 'candidates.0.content.parts.0.text');

        if (!is_string($answer) || trim($answer) === '') {
            throw new RuntimeException('Gemini n’a pas retourné de réponse exploitable.');
        }

        return trim($answer);
    }

    private function endpoint(): string
    {
        return sprintf(
            'https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s',
            $this->model,
            $this->apiKey
        );
    }

    private function buildSystemInstruction(): string
    {
        return <<<'PROMPT'
Tu es un assistant clinique et administratif professionnel, réservé au médecin connecté.
Réponds uniquement à partir du contexte fourni dans la requête. N'invente jamais de données.
Si une information manque, dis clairement qu'elle n'est pas disponible dans le contexte.
Protège la confidentialité: n'expose que les données utiles à la demande du médecin.
Réponds en français, avec des réponses courtes, structurées et actionnables.
Quand la demande concerne un patient, précise son identité et les éléments utiles du dossier.
Quand la demande concerne un rendez-vous, différencie clairement les demandes en attente, les rendez-vous acceptés, les prochains rendez-vous et les rendez-vous passés.
PROMPT;
    }

    private function buildContents(User $doctor, string $message, array $history, array $context): array
    {
        $conversation = [];

        foreach (array_slice($history, -8) as $item) {
            $role = $item['role'] ?? 'user';
            $content = trim((string) ($item['content'] ?? ''));

            if ($content === '') {
                continue;
            }

            $conversation[] = [
                'role' => $role === 'assistant' ? 'model' : 'user',
                'parts' => [[ 'text' => $content ]],
            ];
        }

        $conversation[] = [
            'role' => 'user',
            'parts' => [[
                'text' => $this->buildUserPrompt($doctor, $message, $context),
            ]],
        ];

        return $conversation;
    }

    private function buildUserPrompt(User $doctor, string $message, array $context): string
    {
        return "Médecin: {$doctor->name}\nMessage: {$message}\n\nContexte JSON:\n" . json_encode($context, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    }

    private function buildContext(User $doctor, string $message): array
    {
        $doctorId = $doctor->id;
        $keywords = $this->extractKeywords($message);
        $patients = $this->findPatients($doctorId, $keywords, $message);
        $patientIds = $patients->pluck('id')->all();

        $pendingAppointments = $this->pendingAppointments($doctorId, $patientIds);
        $upcomingAppointments = $this->upcomingAppointments($doctorId, $patientIds);
        $pastAppointments = $this->pastAppointments($doctorId, $patientIds);
        $recentVisits = $this->recentVisits($doctorId, $patientIds);
        $recentDocuments = $this->recentDocuments($doctorId, $patientIds);

        $pendingPatients = $patients->map(function ($patient) use ($doctorId) {
            $lastVisit = Visite::whereHas('patient', function ($query) use ($doctorId, $patient) {
                $query->where('doctor_id', $doctorId)->where('id', $patient->id);
            })->orderByDesc('date_visite')->first();

            return [
                'id' => $patient->id,
                'name' => trim(($patient->nom ?? '') . ' ' . ($patient->prenom ?? '')),
                'email' => $patient->email,
                'telephone' => $patient->telephone,
                'age' => $patient->age,
                'groupe_sanguin' => $patient->groupe_sanguin,
                'notes' => $patient->notes_doctor,
                'last_visit_date' => $lastVisit && $lastVisit->date_visite
                    ? Carbon::parse($lastVisit->date_visite)->format('Y-m-d')
                    : null,
            ];
        })->values()->all();

        $summary = [
            'doctor' => [
                'id' => $doctor->id,
                'name' => $doctor->name,
                'email' => $doctor->email,
            ],
            'stats' => [
                'patients_count' => Patient::where('doctor_id', $doctorId)->count(),
                'pending_requests_count' => Appointment::where('doctor_id', $doctorId)->where('request_status', 'pending')->count(),
                'upcoming_appointments_count' => Appointment::where('doctor_id', $doctorId)->where('request_status', 'accepted')->whereDate('appointment_date', '>=', Carbon::today())->count(),
                'recent_visits_count' => Visite::whereHas('patient', fn ($query) => $query->where('doctor_id', $doctorId))->count(),
                'documents_count' => DocumentMedical::whereHas('patient', fn ($query) => $query->where('doctor_id', $doctorId))->count(),
            ],
            'requested_topic' => $message,
        ];

        $suggestions = [
            'Résume les demandes de rendez-vous en attente.',
            'Montre-moi les patients sans visite récente.',
            'Prépare un aperçu clinique du patient recherché.',
        ];

        return [
            'summary' => $summary,
            'patients' => $pendingPatients,
            'appointments' => [
                'pending' => $pendingAppointments,
                'upcoming' => $upcomingAppointments,
                'past' => $pastAppointments,
            ],
            'visits' => $recentVisits,
            'documents' => $recentDocuments,
            'suggestions' => $suggestions,
        ];
    }

    private function extractKeywords(string $message): array
    {
        $tokens = preg_split('/\s+/u', Str::lower(trim($message))) ?: [];

        return array_values(array_filter(array_map(function ($token) {
            $clean = preg_replace('/[^\pL\pN@._-]+/u', '', $token);
            return mb_strlen($clean) >= 3 ? $clean : null;
        }, $tokens)));
    }

    private function findPatients(int $doctorId, array $keywords, string $message)
    {
        $query = Patient::where('doctor_id', $doctorId);

        if (empty($keywords)) {
            return $query->orderByDesc('updated_at')->limit(6)->get();
        }

        $query->where(function ($builder) use ($keywords, $message) {
            foreach ($keywords as $keyword) {
                $like = '%' . $keyword . '%';
                $builder->orWhere('nom', 'like', $like)
                    ->orWhere('prenom', 'like', $like)
                    ->orWhere('email', 'like', $like)
                    ->orWhere('telephone', 'like', $like)
                    ->orWhere('adresse', 'like', $like)
                    ->orWhere('notes_doctor', 'like', $like)
                    ->orWhere('allergies', 'like', $like)
                    ->orWhere('antecedents_medicaux', 'like', $like)
                    ->orWhere('medicaments_actuels', 'like', $like);
            }

            if (Str::contains(Str::lower($message), ['patient', 'dossier', 'consult', 'visite'])) {
                $builder->orWhereNotNull('notes_doctor');
            }
        });

        $patients = $query->orderByDesc('updated_at')->limit(6)->get();

        if ($patients->isEmpty()) {
            return Patient::where('doctor_id', $doctorId)->orderByDesc('updated_at')->limit(6)->get();
        }

        return $patients;
    }

    private function pendingAppointments(int $doctorId, array $patientIds)
    {
        return Appointment::with('patient:id,nom,prenom,email,telephone')
            ->where('doctor_id', $doctorId)
            ->where('request_status', 'pending')
            ->when(!empty($patientIds), fn ($query) => $query->whereIn('patient_id', $patientIds))
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(fn ($appointment) => $this->formatAppointment($appointment))
            ->values()
            ->all();
    }

    private function upcomingAppointments(int $doctorId, array $patientIds)
    {
        return Appointment::with('patient:id,nom,prenom,email,telephone')
            ->where('doctor_id', $doctorId)
            ->where('request_status', 'accepted')
            ->whereDate('appointment_date', '>=', Carbon::today())
            ->when(!empty($patientIds), fn ($query) => $query->whereIn('patient_id', $patientIds))
            ->orderBy('appointment_date')
            ->orderBy('start_time')
            ->limit(10)
            ->get()
            ->map(fn ($appointment) => $this->formatAppointment($appointment))
            ->values()
            ->all();
    }

    private function pastAppointments(int $doctorId, array $patientIds)
    {
        return Appointment::with('patient:id,nom,prenom,email,telephone')
            ->where('doctor_id', $doctorId)
            ->where(function ($query) {
                $query->where('request_status', 'accepted')
                    ->orWhere('status', 'completed');
            })
            ->whereDate('appointment_date', '<', Carbon::today())
            ->when(!empty($patientIds), fn ($query) => $query->whereIn('patient_id', $patientIds))
            ->orderByDesc('appointment_date')
            ->orderByDesc('start_time')
            ->limit(8)
            ->get()
            ->map(fn ($appointment) => $this->formatAppointment($appointment))
            ->values()
            ->all();
    }

    private function recentVisits(int $doctorId, array $patientIds)
    {
        return Visite::with('patient:id,nom,prenom,email,telephone')
            ->whereHas('patient', fn ($query) => $query->where('doctor_id', $doctorId))
            ->when(!empty($patientIds), fn ($query) => $query->whereIn('patient_id', $patientIds))
            ->orderByDesc('date_visite')
            ->limit(8)
            ->get()
            ->map(function ($visit) {
                return [
                    'id' => $visit->id,
                    'patient' => trim(($visit->patient->nom ?? '') . ' ' . ($visit->patient->prenom ?? '')),
                    'date_visite' => optional($visit->date_visite)->format('Y-m-d'),
                    'motif' => $visit->motif,
                    'diagnostic' => $visit->diagnostic,
                    'statut' => $visit->statut,
                    'statut_paiement' => $visit->statut_paiement,
                ];
            })
            ->values()
            ->all();
    }

    private function recentDocuments(int $doctorId, array $patientIds)
    {
        return DocumentMedical::with('patient:id,nom,prenom,email,telephone')
            ->whereHas('patient', fn ($query) => $query->where('doctor_id', $doctorId))
            ->when(!empty($patientIds), fn ($query) => $query->whereHas('patient', fn ($patientQuery) => $patientQuery->whereIn('id', $patientIds)))
            ->orderByDesc('created_at')
            ->limit(8)
            ->get()
            ->map(function ($document) {
                return [
                    'id' => $document->id,
                    'patient' => trim(($document->patient->nom ?? '') . ' ' . ($document->patient->prenom ?? '')),
                    'titre' => $document->titre,
                    'type' => $document->type,
                    'date_document' => optional($document->date_document)->format('Y-m-d'),
                ];
            })
            ->values()
            ->all();
    }

    private function formatAppointment($appointment): array
    {
        return [
            'id' => $appointment->id,
            'patient' => $appointment->patient ? trim(($appointment->patient->nom ?? '') . ' ' . ($appointment->patient->prenom ?? '')) : null,
            'patient_email' => $appointment->patient?->email,
            'appointment_date' => optional($appointment->appointment_date)->format('Y-m-d'),
            'start_time' => $appointment->start_time,
            'end_time' => $appointment->end_time,
            'status' => $appointment->status,
            'request_status' => $appointment->request_status ?? 'accepted',
            'notes' => $appointment->notes,
        ];
    }
}
