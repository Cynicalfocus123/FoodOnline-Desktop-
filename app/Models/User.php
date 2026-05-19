<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'business_type',
        'company_name',
        'contact_number',
        'email',
        'first_name',
        'last_name',
        'line_id',
        'name',
        'password',
        'phone',
        'registered_from',
        'role',
        'status',
    ];

    /**
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];
}
