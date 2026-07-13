<?php

namespace App\Providers;

use App\Listeners\SendRegistrationSuccessEmail;
use Illuminate\Auth\Events\Registered;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        Registered::class => [
            SendRegistrationSuccessEmail::class,
        ],
    ];
}
