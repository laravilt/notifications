<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Notifications API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your plugin. These
| routes are loaded by the ServiceProvider within a group which
| is assigned the "api" middleware group.
|
*/

Route::middleware(['api'])->prefix('api/notifications')->group(function () {
    // Add your API routes here
    // Example:
    // Route::get('/items', [ItemController::class, 'index']);
    // Route::post('/items', [ItemController::class, 'store']);
});
