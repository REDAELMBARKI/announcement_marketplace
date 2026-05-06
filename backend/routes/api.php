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


// Authentication routes

use App\Http\Controllers\UserProfileController;

Route::get('/users/{user:slug}', [UserProfileController::class, 'show'])->name('user.show');
Route::put('/users/{user:slug}', [UserProfileController::class, 'update'])->name('user.update');

 


Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/signup', [AuthController::class, 'signup'])->name('signup');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

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

// Admin routes
Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('/announcements', [AnnouncementController::class, 'getAllAnnouncementsForAdmin'])->name('announcements.index');
    Route::get('/charities',    [AdminController::class, 'getAllCharities'])->name('charities.index');
    Route::get('/users',        [AdminController::class, 'getAllUsers'])->name('users.index');
    Route::get('/stats',        [AdminController::class, 'getDashboardStats'])->name('stats');
});

// User Management Routes
Route::prefix('user-management')->name('user-management.')->group(function () {
    Route::get('/view-users', [ViewUserController::class, 'getViewUsers'])->name('view-users');
    Route::get('/roles', [ViewUserController::class, 'getRoles'])->name('roles');
    Route::put('/users/{id}', [ViewUserController::class, 'updateUser'])->name('users.update');
    Route::delete('/users/{id}', [ViewUserController::class, 'deleteUser'])->name('users.destroy');
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
Route::post('/announcements/{announcement:slug}/favorite', [AnnouncementController::class, 'toggleFavorite'])->name('announcements.favorite');

// User announcements routes
Route::prefix('users/{user:slug}')->name('users.')->group(function () {
    Route::get('announcements', [AnnouncementController::class, 'getUserAnnouncementsBySlug'])->name('user.announcements');
    Route::get('donations', [AnnouncementController::class, 'getUserDonations'])->name('donations');
    Route::get('sales', [AnnouncementController::class, 'getUserSales'])->name('sales');
});

// Announcement management routes (show, update, delete, status)
Route::get('/announcements/{announcement:slug}', [AnnouncementController::class, 'showBySlug'])->name('announcements.show');
Route::put('/announcements/{announcement:slug}', [AnnouncementController::class, 'update'])->name('announcements.update');
Route::delete('/announcements/{announcement:slug}', [AnnouncementController::class, 'destroy'])->name('announcements.destroy');
Route::put('/announcements/{announcement:slug}/status', [AnnouncementController::class, 'updateStatus'])->name('announcements.update-status');


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
