<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

$backendBasePath = dirname(__DIR__);

if (file_exists($maintenance = $backendBasePath.'/storage/framework/maintenance.php')) {
    require $maintenance;
}

require $backendBasePath.'/vendor/autoload.php';

/** @var Application $app */
$app = require_once $backendBasePath.'/bootstrap/app.php';
$app->usePublicPath(__DIR__);
$app->handleRequest(Request::capture());
