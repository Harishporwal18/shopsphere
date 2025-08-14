<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;

Route::prefix('v1')->group(function () {
    // Products
    Route::apiResource('products', ProductController::class);
    Route::patch('products/{id}/stock', [ProductController::class, 'updateStock']);
    Route::get('products/stats/summary', [ProductController::class, 'stats']);

    // Categories
    Route::apiResource('categories', CategoryController::class);
});

// Health check
Route::get('health', function () {
    return response()->json([
        'service' => 'Product Service',
        'status' => 'healthy',
        'timestamp' => now()->toISOString(),
        'version' => '1.0.0'
    ]);
});
