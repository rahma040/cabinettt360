<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PrescriptionTemplate extends Model
{
    use HasFactory;

    protected $fillable = ['doctor_id', 'name', 'template_data'];

    protected $casts = [
        'template_data' => 'array',
    ];

    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }
}