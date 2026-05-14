<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DoctorTask extends Model
{
    use HasFactory;

    protected $fillable = [
        'doctor_id',
        'task',
        'time',
        'priority',
        'status',
        'note',
    ];

    protected $casts = [
        'time' => 'datetime',
        'priority' => 'string',
        'status' => 'string',
    ];

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }
}