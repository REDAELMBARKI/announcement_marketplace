<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ViewUserController;
use App\Http\Controllers\OpenAIController;
use App\Http\Controllers\Home\HomepageController;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\MediaController;
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

// Media upload routes
Route::post('/media/upload', [MediaController::class, 'upload']);
Route::post('/media/upload-multiple', [MediaController::class, 'uploadMultiple']);
Route::post('/media/link-to-announcement', [MediaController::class, 'linkToAnnouncement']);
Route::delete('/media/temporary/{mediaId}', [MediaController::class, 'deleteTemporary']);
Route::post('/media/cleanup-temporary', [MediaController::class, 'cleanupTemporary']);

// Admin routes
Route::prefix('admin')->group(function () {
    Route::get('/announcements', [AnnouncementController::class, 'getAllAnnouncementsForAdmin']);
    Route::get('/charities',    [AdminController::class, 'getAllCharities']);
    Route::get('/users',        [AdminController::class, 'getAllUsers']);
    Route::get('/stats',        [AdminController::class, 'getDashboardStats']);
});

// User Management Routes
Route::prefix('user-management')->group(function () {
    Route::get('/view-users', [ViewUserController::class, 'getViewUsers']);
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

// Homepage route
Route::get('/homepage', HomepageController::class)->name('homepage');



// Announcements routes (handles both donations and sales)
Route::post('/announcements', [AnnouncementController::class, 'store']);
Route::get('/announcements/{id}', [AnnouncementController::class, 'show']);
Route::delete('/announcements/{id}', [AnnouncementController::class, 'destroy']);
Route::put('/announcements/{announcementId}/status', [AnnouncementController::class, 'updateStatus']);

// User announcements routes
Route::prefix('user')->group(function () {
    Route::get('/announcements/{userId}', [AnnouncementController::class, 'getUserAnnouncements']);
    Route::get('/donations/{userId}', [AnnouncementController::class, 'getUserDonations']);
    Route::get('/sales/{userId}', [AnnouncementController::class, 'getUserSales']);
});

// Public announcements routes
Route::get('/announcements', [AnnouncementController::class, 'getAllAnnouncements']);

// Charity announcements routes
Route::get('/charities/{charityId}/announcements', [AnnouncementController::class, 'getCharityAnnouncements']);

// Admin announcements routes
Route::get('/admin/announcements', [AnnouncementController::class, 'getAllAnnouncementsForAdmin']);

// Reports routes
Route::get('/reports/donations', [ReportController::class, 'donations']);
Route::get('/reports/users', [ReportController::class, 'users']);
Route::get('/reports/sustainability', [ReportController::class, 'sustainability']);
Route::get('/reports/charities', [ReportController::class, 'charities']);
