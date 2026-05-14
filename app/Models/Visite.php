<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Visite extends Model
{
    use HasFactory;

    protected $table = 'visites';

    protected $fillable = [
        'patient_id',
        'date_visite',
        'motif',
        'diagnostic',
        'prescription_texte',
        'prescription_fichiers',
        'montant',
        'statut_paiement',
        'medecin',
        'notes',
        'statut',  
    ];

    protected $casts = [
        'date_visite' => 'date',
        'prescription_fichiers' => 'array',
        'statut' => 'string',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
}