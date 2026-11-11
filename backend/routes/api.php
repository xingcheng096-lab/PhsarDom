<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\BuyerBusinessController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ProcurementController;

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'application' => App::environment(),
        'laravel' => App::version(),
    ]);
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/auth/login', [AuthController::class, 'login'])->middleware(['throttle:login']);
Route::post('/auth/register', [AuthController::class, 'register'])->middleware(['throttle:login']);
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
});
Route::get('/admin/ping', fn () => response()->json(['status' => 'ok']))
    ->middleware(['auth:sanctum', 'role:admin']);
Route::middleware(['auth:sanctum', 'role:admin,super_admin'])->prefix('admin')->group(function () {
    Route::get('/users', [AdminController::class, 'users']);
    Route::get('/roles', [AdminController::class, 'roles']);
    Route::get('/permissions', [AdminController::class, 'permissions']);
    Route::get('/audit-logs', [AdminController::class, 'audit']);
    Route::get('/kyc-submissions', [AdminController::class, 'kyc']);
    Route::post('/users/{user}/roles', [AdminController::class, 'assignRole']);
    Route::delete('/users/{user}/roles/{role}', [AdminController::class, 'revokeRole']);
    Route::patch('/users/{user}/status', [AdminController::class, 'setStatus']);
    Route::post('/roles/{role}/permissions', [AdminController::class, 'attachPermission']);
    Route::delete('/roles/{role}/permissions/{permission}', [AdminController::class, 'revokePermission']);
});
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);
Route::get('/categories', [ProductController::class, 'categories']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/buyer-businesses', [BuyerBusinessController::class, 'store']);
    Route::get('/buyer-businesses/{business}', [BuyerBusinessController::class, 'show']);
    Route::post('/buyer-businesses/{business}/kyc', [BuyerBusinessController::class, 'submitKyc']);
    Route::post('/kyc-submissions/{submission}/review', [BuyerBusinessController::class, 'reviewKyc']);
    Route::post('/rfqs', [ProcurementController::class, 'createRfq']);
    Route::get('/rfqs', [ProcurementController::class, 'rfqs']);
    Route::get('/quotations', [ProcurementController::class, 'quotations']);
    Route::get('/purchase-orders', [ProcurementController::class, 'purchaseOrders']);
    Route::post('/quotations/{quotation}/accept', [ProcurementController::class, 'acceptQuotation']);
});
Route::middleware(['auth:sanctum','role:admin,super_admin'])->post('/quotations', [ProcurementController::class, 'issueQuotation']);
Route::middleware(['auth:sanctum','role:admin,super_admin'])->post('/products', [ProductController::class, 'store']);
Route::middleware(['auth:sanctum','role:admin,super_admin'])->group(function () {
    Route::patch('/products/{product}', [ProductController::class, 'update']);
    Route::post('/products/{product}/pricing-tiers', [ProductController::class, 'addTier']);
    Route::delete('/products/{product}/pricing-tiers/{tier}', [ProductController::class, 'deleteTier']);
    Route::post('/products/{product}/archive', [ProductController::class, 'archive']);
});
