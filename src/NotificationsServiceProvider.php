<?php

namespace Laravilt\Notifications;

use Illuminate\Support\ServiceProvider;

class NotificationsServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Merge config
        $this->mergeConfigFrom(
            __DIR__.'/../config/laravilt-notifications.php',
            'laravilt-notifications'
        );
    }

    /**
     * Boot services.
     */
    public function boot(): void
    {
        // Load views
        $this->loadViewsFrom(__DIR__.'/../resources/views', 'notifications');

        // Load translations
        $this->loadTranslationsFrom(__DIR__.'/../resources/lang', 'notifications');

        if ($this->app->runningInConsole()) {
            // Publish config
            $this->publishes([
                __DIR__.'/../config/laravilt-notifications.php' => config_path('laravilt-notifications.php'),
            ], 'laravilt-notifications-config');

            // Publish assets
            $this->publishes([
                __DIR__.'/../dist' => public_path('vendor/laravilt/notifications'),
            ], 'laravilt-notifications-assets');

            // Publish views
            $this->publishes([
                __DIR__.'/../resources/views' => resource_path('views/vendor/notifications'),
            ], 'notifications-views');
        }
    }
}
