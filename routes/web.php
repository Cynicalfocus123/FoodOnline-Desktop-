<?php

use App\Mail\RegistrationSuccessMail;
use Illuminate\Support\Facades\Route;

if (app()->environment(['local', 'development', 'dev'])) {
    Route::get('/dev/preview/emails/registration-success/{role?}', function (?string $role = 'customer') {
        $normalizedRole = strtolower(trim((string) $role));

        abort_unless(in_array($normalizedRole, ['customer', 'supplier', 'partner'], true), 404);

        return new RegistrationSuccessMail(
            recipient: [
                'email' => 'preview@foodonlines.com',
                'first_name' => 'Alex',
                'account_type' => $normalizedRole,
            ],
            accountType: $normalizedRole,
        );
    })->name('dev.preview.emails.registration-success');
}
