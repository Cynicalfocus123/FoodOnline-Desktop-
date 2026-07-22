<?php

namespace Tests;

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Cache;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    public function createApplication(): Application
    {
        // PHPUnit must never inherit the production environment declared in .env.example.
        putenv('APP_ENV=testing');
        $_ENV['APP_ENV'] = 'testing';
        $_SERVER['APP_ENV'] = 'testing';

        /** @var Application $app */
        $app = require dirname(__DIR__).'/bootstrap/app.php';
        $app->make(Kernel::class)->bootstrap();
        $app->detectEnvironment(fn (): string => 'testing');
        $app['config']->set('app.env', 'testing');
        $app['config']->set('database.default', 'sqlite');
        $app['config']->set('database.connections.sqlite.database', ':memory:');
        $app['config']->set('cache.default', 'array');
        $app['config']->set('cache.limiter', 'array');
        $app['config']->set('cache.stores.array', ['driver' => 'array', 'serialize' => false]);
        $app['config']->set('queue.default', 'sync');
        $app['config']->set('session.driver', 'array');
        $app['cache']->setDefaultDriver('array');
        $app['cache']->forgetDriver('array');
        $app->forgetInstance('cache.rateLimiter');

        return $app;
    }
}
