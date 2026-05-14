<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    use HasFactory;

    protected $fillable = [
        'doctor_id', 'nom', 'prenom', 'age', 'poids', 'taille', 'email', 'telephone',
        'adresse', 'groupe_sanguin', 'antecedents_medicaux', 'antecedents_chirurgicaux',
        'antecedents_familiaux', 'allergies', 'medicaments_actuels', 'notes_doctor'
    ];

    protected $casts = [
        'date_naissance' => 'date',
    ];

    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function documents()
    {
        return $this->hasMany(DocumentMedical::class);
    }

    public function visites()
    {
        return $this->hasMany(Visite::class)->orderBy('date_visite', 'desc');
    }

    public function getNomCompletAttribute()
    {
        return ($this->nom ?? '') . ' ' . ($this->prenom ?? '');
    }
}