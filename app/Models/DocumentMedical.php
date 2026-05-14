<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DocumentMedical extends Model
{
    use HasFactory;

    protected $table = 'documents_medicaux';

    protected $fillable = [
        'patient_id', 'titre', 'type', 'fichier_path', 'fichier_nom', 'date_document', 'notes'
    ];

    protected $casts = [
        'date_document' => 'date',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
}