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

use App\Http\Controllers\UserProfileController;

Route::get('/user/{id}', [UserProfileController::class, 'show'])->name('user.show');
Route::put('/user/{id}', [UserProfileController::class, 'update'])->name('user.update');

 



Route::post('/login', [AuthController::class, 'login']);
Route::post('/signup', [AuthController::class, 'signup']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:api');


// Media upload routes
Route::post('/media/upload', [MediaController::class, 'upload'])->name('media.upload');
Route::post('/media/upload-multiple', [MediaController::class, 'uploadMultiple'])->name('media.upload-multiple');
Route::post('/media/link-to-announcement', [MediaController::class, 'linkToAnnouncement'])->name('media.link-to-announcement');
Route::delete('/media/temporary/{mediaId}', [MediaController::class, 'deleteTemporary'])->name('media.delete-temporary');
Route::post('/media/cleanup-temporary', [MediaController::class, 'cleanupTemporary'])->name('media.cleanup-temporary');

// Categories routes
Route::get('/categories', function () {
    $superCategories = \App\Models\Category::with('children')
        ->whereNull('parent_id')
        ->where('is_active', true)
        ->orderBy('sort_order')
        ->get();
    
    return response()->json([
        'status' => 'success',
        'categories' => $superCategories,
    ]);
})->name('categories.index');



// Admin routes (JWT protected)
Route::prefix('admin')->middleware('auth:api')->group(function () {
    Route::get('/announcements', [AnnouncementController::class, 'getAllAnnouncementsForAdmin']);
    Route::get('/charities',    [AdminController::class, 'getAllCharities']);
    Route::get('/users',        [AdminController::class, 'getAllUsers']);
    Route::get('/stats',        [AdminController::class, 'getDashboardStats']);
    Route::get('/donations',    [AdminController::class, 'getAllDonations']);
});

// User Management Routes
Route::prefix('user-management')->middleware('auth:api')->group(function () {
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
})->name('remote-sessions');

// OpenAI Integration Route
Route::post('/ask-faq', [OpenAIController::class, 'ask'])->name('ask-faq');

// Homepage route
Route::get('/homepage', HomepageController::class)->name('homepage');



// Announcements routes (handles both donations and sales)
Route::get('/marketplace/init-data', [AnnouncementController::class, 'getMarketplaceInitData'])->name('marketplace.init-data');
Route::get('/marketplace/listings', [AnnouncementController::class, 'getMarketplaceListings'])->name('marketplace.listings');
Route::post('/announcements', [AnnouncementController::class, 'store'])->name('announcements.store');
Route::get('/announcements/{id}', [AnnouncementController::class, 'show'])->name('announcements.show');
Route::post('/announcements/{productId}/favorite', [AnnouncementController::class, 'toggleFavorite'])->name('announcements.favorite');
Route::delete('/announcements/{id}', [AnnouncementController::class, 'destroy'])->name('announcements.destroy');
Route::put('/announcements/{announcementId}/status', [AnnouncementController::class, 'updateStatus'])->name('announcements.update-status');

// User announcements routes
Route::prefix('user')->name('user.')->group(function () {
    Route::get('/announcements/{userId}', [AnnouncementController::class, 'getUserAnnouncements'])->name('announcements');
    Route::get('/donations/{userId}', [AnnouncementController::class, 'getUserDonations'])->name('donations');
    Route::get('/sales/{userId}', [AnnouncementController::class, 'getUserSales'])->name('sales');
});

// Public announcements routes
Route::get('/announcements', [AnnouncementController::class, 'getAllAnnouncements'])->name('announcements.all');

// Charity announcements routes
Route::get('/charities/{charityId}/announcements', [AnnouncementController::class, 'getCharityAnnouncements'])->name('charity.announcements');


// Admin announcements routes
Route::get('/admin/announcements', [AnnouncementController::class, 'getAllAnnouncementsForAdmin'])->name('admin.announcements.all');


// Reports routes
Route::prefix('reports')->name('reports.')->group(function () {
    Route::get('/donations', [ReportController::class, 'donations'])->name('donations');
    Route::get('/users', [ReportController::class, 'users'])->name('users');
    Route::get('/sustainability', [ReportController::class, 'sustainability'])->name('sustainability');
    Route::get('/charities', [ReportController::class, 'charities'])->name('charities');
});
