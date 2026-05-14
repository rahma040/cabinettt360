<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PasswordResetRequest extends Model
{
    protected $table = 'password_reset_requests';
    
    protected $fillable = [
        'login_email',
        'contact_method',
        'contact_email',
        'contact_phone',
        'message',
        'status',
    ];
    
    protected $casts = [
        'contact_method' => 'string',
        'status' => 'string',
    ];
}