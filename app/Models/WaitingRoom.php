<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WaitingRoom extends Model
{
    use HasFactory;

    protected $table = 'waiting_room';

    protected $fillable = [
        'patient_id',
        'doctor_id',
        'secretary_id',
        'appointment_id',
        'slot', 
        'status',
        'arrived_at',
        'called_at',
        'left_at',
    ];

    protected $casts = [
        'arrived_at' => 'datetime',
        'called_at'  => 'datetime',
        'left_at'    => 'datetime',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function secretary()
    {
        return $this->belongsTo(User::class, 'secretary_id');
    }

    public function appointment()
    {
        return $this->belongsTo(Appointment::class);
    }
}