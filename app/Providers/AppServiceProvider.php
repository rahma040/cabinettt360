<?php

namespace App\Providers;

use App\Services\GeminiService;
use App\Services\PatientContextService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(PatientContextService::class, function () {
            return new PatientContextService();
        });

        $this->app->singleton(GeminiService::class, function () {
            return new GeminiService();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
