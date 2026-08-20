<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

// Hostinger deployments replace application source while preserving writable
// runtime folders. Remove a route cache created before the current API source
// so a new route cannot remain hidden behind an older cached route table.
$foodOnlinesRoutesSource = __DIR__.'/../routes/api.php';
foreach (glob(__DIR__.'/cache/routes-*.php') ?: [] as $foodOnlinesRouteCache) {
    if (is_file($foodOnlinesRoutesSource) && is_file($foodOnlinesRouteCache)
        && filemtime($foodOnlinesRoutesSource) > filemtime($foodOnlinesRouteCache)) {
        @unlink($foodOnlinesRouteCache);
    }
}

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'admin.token' => App\Http\Middleware\AuthenticateAdminToken::class,
            'user.token' => App\Http\Middleware\AuthenticateUserToken::class,
            'user.optional' => App\Http\Middleware\AuthenticateOptionalUserToken::class,
            'admin.permission' => App\Http\Middleware\RequireAdminPermission::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request, \Throwable $exception): bool => $request->is('api/*') || $request->expectsJson(),
        );

        $exceptions->render(function (NotFoundHttpException $exception, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            return response()->json([
                'message' => 'API endpoint or resource not found.',
            ], 404);
        });
    })
    ->create();
