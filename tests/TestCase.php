<?php

namespace Laravilt\Notifications\Tests;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravilt\Notifications\NotificationsServiceProvider;
use Orchestra\Testbench\TestCase as Orchestra;

class TestCase extends Orchestra
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->loadMigrationsFrom(__DIR__.'/../database/migrations');

        // Load helper functions
        require_once __DIR__.'/../src/helpers.php';
    }

    protected function getPackageProviders($app): array
    {
        return [
            NotificationsServiceProvider::class,
        ];
    }

    protected function getEnvironmentSetUp($app): void
    {
        // Setup environment for testing
        config()->set('database.default', 'testing');

        config()->set('database.default', 'sqlite');
        config()->set('database.connections.sqlite.database', ':memory:');
    }
}
