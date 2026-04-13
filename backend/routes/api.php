<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\DonationController;
use App\Http\Controllers\DonationItemController;
use App\Http\Controllers\CharityController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ViewUserController;
use App\Http\Controllers\OpenAIController;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Http\Controllers\ReportController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| These routes are for your React front-end SPA and existing tests.
|
*/

// Test & debug endpoints
Route::get('/status', function () {
    return response()->json(['message' => 'Laravel API working']);
});
Route::get('/test-db', function () {
    return response()->json([
        'tables' => DB::select("SELECT name FROM sqlite_master WHERE type='table'")
    ]);
});
Route::get('/users', function () {
    try {
        $users = DB::table('users')->get();

        return response()->json([
            'status' => 'success',
            'users' => $users
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage()
        ], 500);
    }
});


Route::get('/api/test-users', function() {
    try {
        $users = DB::table('users')->get();
        return response()->json(['status' => 'success', 'users' => $users]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage()
        ], 500);
    }
});

//end of testing routes


// Authenrtication routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/signup', [AuthController::class, 'signup']);
Route::post('/logout', [AuthController::class, 'logout']);
use App\Http\Controllers\UserProfileController;

Route::get('/user/{id}', [UserProfileController::class, 'show']);
Route::put('/user/{id}', [UserProfileController::class, 'update']);

 
// Inventory routes
Route::get('/inventory', [InventoryController::class, 'index']);
Route::get('/inventory/{id}', [InventoryController::class, 'show']);
Route::post('/inventory/{id}/distribute', [InventoryController::class, 'distribute']);


// Donations
Route::get('/donations', [DonationController::class, 'getAllDonations']); 
Route::get('/donations/{id}', [DonationController::class, 'show']);
Route::post('/donations', [DonationController::class, 'store']);
Route::get('/donations/user/{donorId}', [DonationController::class, 'getUserDonations']);
Route::post('/donations/{donationId}/status', [DonationController::class, 'updateStatus']);

// Donation items
Route::get('/donation-items', [DonationItemController::class, 'index']);
Route::get('/donation-items/{id}', [DonationItemController::class, 'show']);

// Charities
Route::get('/charities', [CharityController::class, 'index']);
Route::get('/charities/{id}', [CharityController::class, 'show']);
Route::post('/charities', [CharityController::class, 'store']);
Route::put('/charities/{id}', [CharityController::class, 'update']);  
Route::delete('/charities/{id}', [CharityController::class, 'destroy']);



// Charity — Get all donations assigned to this charity
Route::get('/charity/{charityId}/donations', [DonationController::class, 'getCharityDonations']);


// Admin routes
Route::prefix('admin')->group(function () {
    Route::get('/donations',  [AdminController::class, 'getAllDonations']);
    Route::get('/charities',  [AdminController::class, 'getAllCharities']);
    Route::get('/users',      [AdminController::class, 'getAllUsers']);
    Route::get('/stats',      [AdminController::class, 'getDashboardStats']);
});

// User Management Routes
Route::prefix('user-management')->group(function () {
    Route::get('/view-users', [ViewUserController::class, 'getViewUsers']);
    Route::get('/charities-list', [CharityController::class, 'getCharitiesList']);
    Route::get('/roles', [ViewUserController::class, 'getRoles']);
    Route::put('/users/{id}', [ViewUserController::class, 'updateUser']);
    Route::delete('/users/{id}', [ViewUserController::class, 'deleteUser']);
});

Route::post('/remote-sessions', function (Request $request) {
    return response()->json([
        'status' => 'success',
        'session_id' => (string) Str::uuid(), 
    ]);
});

// OpenAI Integration Route
Route::post('/ask-faq', [OpenAIController::class, 'ask']);
Route::post('/ask-faq', [OpenAIController::class, 'ask'])
    ->middleware('throttle:3,1');
// The above line limits to 3 requests per minute per IP address to prevent spam

// Reports routes
Route::get('/reports/donations', [ReportController::class, 'donations']);
Route::get('/reports/users', [ReportController::class, 'users']);
Route::get('/reports/sustainability', [ReportController::class, 'sustainability']);
Route::get('/reports/charities', [ReportController::class, 'charities']);
