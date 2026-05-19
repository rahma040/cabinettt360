<?php

namespace App\Services;

use App\Models\Patient;
use Carbon\Carbon;
use RuntimeException;

class PatientContextService
{
    /**
     * Build a structured plain-text context for a specific patient.
     *
     * @param int $patientId
     * @return string
     * @throws RuntimeException
     */
    public function buildContext(int $patientId): string
    {
        $patient = Patient::with(['doctor', 'visites', 'documents'])->find($patientId);

        if (!$patient) {
            throw new RuntimeException("Patient with ID {$patientId} not found.");
        }

        $context = "# PATIENT RECORD\n\n";

        // Basic patient information
        $context .= "## Basic Information\n";
        $context .= "Name: " . trim(($patient->nom ?? '') . ' ' . ($patient->prenom ?? '')) . "\n";
        $context .= "Age: " . ($patient->age ?? 'N/A') . "\n";
        $context .= "Email: " . ($patient->email ?? 'N/A') . "\n";
        $context .= "Phone: " . ($patient->telephone ?? 'N/A') . "\n";
        $context .= "Address: " . ($patient->adresse ?? 'N/A') . "\n";
        $context .= "\n";

        // Physical measurements
        $context .= "## Physical Measurements\n";
        $context .= "Weight (kg): " . ($patient->poids ?? 'N/A') . "\n";
        $context .= "Height (cm): " . ($patient->taille ?? 'N/A') . "\n";
        if ($patient->poids && $patient->taille) {
            $heightM = ($patient->taille / 100);
            $bmi = $patient->poids / ($heightM * $heightM);
            $context .= "BMI: " . number_format($bmi, 2) . "\n";
        }
        $context .= "\n";

        // Medical history
        $context .= "## Medical History\n";
        $context .= "Blood Group: " . ($patient->groupe_sanguin ?? 'N/A') . "\n";
        $context .= "Medical History: " . ($patient->antecedents_medicaux ?? 'None recorded') . "\n";
        $context .= "Surgical History: " . ($patient->antecedents_chirurgicaux ?? 'None recorded') . "\n";
        $context .= "Family History: " . ($patient->antecedents_familiaux ?? 'None recorded') . "\n";
        $context .= "Allergies: " . ($patient->allergies ?? 'None recorded') . "\n";
        $context .= "Current Medications: " . ($patient->medicaments_actuels ?? 'None recorded') . "\n";
        $context .= "\n";

        // Doctor notes
        if ($patient->notes_doctor) {
            $context .= "## Doctor Notes\n";
            $context .= $patient->notes_doctor . "\n";
            $context .= "\n";
        }

        // Recent visits (last 10)
        $recentVisits = $patient->visites->take(10);
        if ($recentVisits->isNotEmpty()) {
            $context .= "## Recent Visits (Last 10)\n";
            foreach ($recentVisits as $visite) {
                $context .= "- Date: " . ($visite->date_visite ? Carbon::parse($visite->date_visite)->format('Y-m-d') : 'N/A') . "\n";
                $context .= "  Reason: " . ($visite->motif ?? 'N/A') . "\n";
                if ($visite->diagnostic) {
                    $context .= "  Diagnosis: " . $visite->diagnostic . "\n";
                }
                if ($visite->prescription_texte) {
                    $context .= "  Prescription: " . $visite->prescription_texte . "\n";
                }
                $context .= "\n";
            }
        }

        // Medical documents
        $documents = $patient->documents;
        if ($documents->isNotEmpty()) {
            $context .= "## Medical Documents\n";
            foreach ($documents as $doc) {
                $context .= "- " . ($doc->titre ?? 'Untitled') . " ";
                $context .= "(" . ($doc->type ?? 'Unknown type') . ") ";
                $context .= "Date: " . ($doc->date_document ? Carbon::parse($doc->date_document)->format('Y-m-d') : 'N/A') . "\n";
                if ($doc->notes) {
                    $context .= "  Notes: " . $doc->notes . "\n";
                }
            }
            $context .= "\n";
        }

        // Assigned doctor
        if ($patient->doctor) {
            $context .= "## Assigned Doctor\n";
            $context .= "Name: " . ($patient->doctor->name ?? 'N/A') . "\n";
            $context .= "Email: " . ($patient->doctor->email ?? 'N/A') . "\n";
        }

        return $context;
    }
}
