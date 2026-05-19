<?php

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Replace CPANEL_USERNAME with your real cPanel username, for example: mstarhol
$backendBasePath = '/home/CPANEL_USERNAME/foodonlines-backend';

require $backendBasePath.'/vendor/autoload.php';

$app = require_once $backendBasePath.'/bootstrap/app.php';
$app->usePublicPath(__DIR__);

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$response = $kernel->handle(
    $request = Request::capture()
)->send();

$kernel->terminate($request, $response);
