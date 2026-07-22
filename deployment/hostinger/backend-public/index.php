<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

/**
 * The normal Laravel layout keeps this entry in <project>/public, while the
 * Hostinger layout can expose the same file from public_html/api and keep the
 * project private elsewhere. A public_html/api copy can provide a local,
 * non-versioned backend-path.php file that returns the absolute project path.
 */
function foodonlinesBackendBasePath(string $publicPath): ?string
{
    $configuredPath = null;
    $pathFile = $publicPath.'/backend-path.php';

    if (is_file($pathFile)) {
        $value = require $pathFile;
        $configuredPath = is_string($value) ? $value : null;
    }

    $configuredPath ??= $_SERVER['FOODONLINES_BACKEND_PATH'] ?? getenv('FOODONLINES_BACKEND_PATH') ?: null;

    $candidates = [
        $configuredPath,
        dirname($publicPath),
    ];

    // Covers standard Hostinger private folders placed beside a domain or
    // directly inside the account home without exposing the resolved path.
    for ($level = 0, $parent = dirname($publicPath); $level < 6; $level++, $parent = dirname($parent)) {
        $candidates[] = $parent;
        foreach (glob($parent.'/*/bootstrap/app.php') ?: [] as $bootstrapFile) {
            $candidates[] = dirname(dirname($bootstrapFile));
        }
    }

    foreach (array_unique(array_filter($candidates, 'is_string')) as $candidate) {
        $basePath = rtrim($candidate, '/\\');
        if (is_file($basePath.'/artisan') && is_file($basePath.'/bootstrap/app.php') && is_file($basePath.'/vendor/autoload.php')) {
            return $basePath;
        }
    }

    return null;
}

$backendBasePath = foodonlinesBackendBasePath(__DIR__);

if ($backendBasePath === null) {
    error_log('FoodOnlines API entry could not resolve the private Laravel application. Configure public_html/api/backend-path.php.');
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo '{"message":"Service configuration is incomplete."}';
    exit;
}

if (file_exists($maintenance = $backendBasePath.'/storage/framework/maintenance.php')) {
    require $maintenance;
}

require $backendBasePath.'/vendor/autoload.php';

/** @var Application $app */
$app = require_once $backendBasePath.'/bootstrap/app.php';
$app->usePublicPath(__DIR__);
$app->handleRequest(Request::capture());
