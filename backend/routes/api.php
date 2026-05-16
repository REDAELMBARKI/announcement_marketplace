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
use App\Http\Controllers\ChatController;
use App\Http\Controllers\UserProfileController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\FoundationController;
use App\Http\Controllers\CharityController;
use Illuminate\Support\Str;
use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| These routes are for your React front-end SPA.
|
*/

// --- Public Routes ---

// Test & debug endpoints
Route::get('/status', function () {
    return response()->json(['message' => 'Laravel API working']);
});

Route::get('/test-db', function () {
    return response()->json([
        'tables' => DB::select("SELECT name FROM sqlite_master WHERE type='table'")
    ]);
});

// Authentication routes
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/signup', [AuthController::class, 'signup'])->name('signup');

// Homepage & General data
Route::get('/homepage', HomepageController::class)->name('homepage');
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

Route::get('/foundations', [FoundationController::class, 'index'])->name('foundations.index');

// Marketplace routes
Route::get('/marketplace/init-data', [AnnouncementController::class, 'getMarketplaceInitData'])->name('marketplace.init-data');
Route::get('/marketplace/listings', [AnnouncementController::class, 'getMarketplaceListings'])->name('marketplace.listings');

// Announcement display routes
Route::get('/announcements', [AnnouncementController::class, 'getAllAnnouncements'])->name('announcements.all');
Route::get('/announcements/{announcement:slug}', [AnnouncementController::class, 'showBySlug'])->name('announcements.show');
Route::get('/announcements/{announcement:slug}/reviews', [AnnouncementController::class, 'getReviews'])->name('announcements.reviews');
Route::get('/announcements/{announcement:slug}/offers', [AnnouncementController::class, 'getOffers'])->name('announcements.offers');

// User Public Profile
Route::get('/users/{user:slug}', [UserProfileController::class, 'show'])->name('user.show');
Route::get('/user/{id}', [UserProfileController::class, 'show']); // Legacy/Direct ID support

// OpenAI Integration
Route::post('/ask-faq', [OpenAIController::class, 'ask'])->name('ask-faq');

// Remote sessions
Route::post('/remote-sessions', function (Request $request) {
    return response()->json([
        'status' => 'success',
        'session_id' => (string) Str::uuid(), 
    ]);
})->name('remote-sessions');


// --- Authenticated Routes ---
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    Route::get('/me', [AuthController::class, 'me'])->name('me');
    
    // Profile Management
    Route::put('/users/{user:slug}', [UserProfileController::class, 'update'])->name('user.update');
    Route::put('/user/{id}', [UserProfileController::class, 'update']); // Legacy/Direct ID support

    // Media upload routes
    Route::post('/media/upload', [MediaController::class, 'upload'])->name('media.upload');
    Route::post('/media/upload-multiple', [MediaController::class, 'uploadMultiple'])->name('media.upload-multiple');
    Route::post('/media/link-to-announcement', [MediaController::class, 'linkToAnnouncement'])->name('media.link-to-announcement');
    Route::delete('/media/temporary/{mediaId}', [MediaController::class, 'deleteTemporary'])->name('media.delete-temporary');
    Route::post('/media/cleanup-temporary', [MediaController::class, 'cleanupTemporary'])->name('media.cleanup-temporary');

    // Announcement Management (Authenticated)
    Route::post('/announcements', [AnnouncementController::class, 'store'])->name('announcements.store');
    Route::put('/announcements/{announcement:slug}', [AnnouncementController::class, 'update'])->name('announcements.update');
    Route::delete('/announcements/{announcement:slug}', [AnnouncementController::class, 'destroy'])->name('announcements.destroy');
    Route::put('/announcements/{announcement:slug}/status', [AnnouncementController::class, 'updateStatus'])->name('announcements.update-status');
    Route::post('/announcements/{announcement:slug}/favorite', [AnnouncementController::class, 'toggleFavorite'])->name('announcements.favorite');

    // Reviews & Offers (Authenticated)
    Route::post('/announcements/{announcement:slug}/reviews', [AnnouncementController::class, 'storeReview'])->name('announcements.reviews.store');
    Route::put('/reviews/{review}', [AnnouncementController::class, 'updateReview'])->name('reviews.update');
    Route::delete('/reviews/{review}', [AnnouncementController::class, 'destroyReview'])->name('reviews.destroy');

    Route::post('/announcements/{announcement:slug}/offers', [AnnouncementController::class, 'makeOffer'])->name('announcements.offers.store');
    Route::put('/offers/{offer}/accept', [AnnouncementController::class, 'acceptOffer'])->name('offers.accept');
    Route::put('/offers/{offer}/reject', [AnnouncementController::class, 'rejectOffer'])->name('offers.reject');
    Route::put('/offers/{offer}/counter', [AnnouncementController::class, 'counterOffer'])->name('offers.counter');
    Route::put('/offers/{offer}/accept-counter', [AnnouncementController::class, 'acceptCounterOffer'])->name('offers.accept-counter');

    // Chat routes
    Route::get('/conversations', [ChatController::class, 'getUserConversations'])->name('conversations.index');
    Route::post('/announcements/{announcement:slug}/conversation', [ChatController::class, 'getOrCreateConversation'])->name('conversations.get-or-create');
    Route::get('/conversations/{conversation:slug}/messages', [ChatController::class, 'getMessages'])->name('conversations.messages');
    Route::post('/conversations/{conversation:slug}/messages', [ChatController::class, 'sendMessage'])->name('conversations.messages.send');
    Route::put('/conversations/{conversation:slug}/read', [ChatController::class, 'markAsRead'])->name('conversations.read');

    // Admin & Moderation Routes
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('/stats', [AdminController::class, 'getDashboardStats'])->name('stats');
        Route::get('/stats/type-split', [AdminController::class, 'getAnnouncementTypeSplit'])->name('stats.type-split');
        Route::get('/stats/funnel', [AdminController::class, 'getAnnouncementFunnel'])->name('stats.funnel');
        Route::get('/stats/categories', [AdminController::class, 'getTopCategories'])->name('stats.categories');
        Route::get('/stats/user-retention', [AdminController::class, 'getUserRetention'])->name('stats.user-retention');
        Route::get('/stats/hourly-activity', [AdminController::class, 'getHourlyActivity'])->name('stats.hourly-activity');
        Route::get('/moderation/pending', [AdminController::class, 'getPendingModeration'])->name('moderation.pending');
        
        Route::get('/announcements', [AnnouncementController::class, 'getAllAnnouncementsForAdmin'])->name('announcements.index');
        Route::get('/inventory', [AdminController::class, 'getAllInventory'])->name('inventory.index');
        Route::get('/donations', [AdminController::class, 'getAllDonations'])->name('donations.index');
        Route::get('/charities', [CharityController::class, 'index'])->name('charities.index');
        Route::post('/charities', [CharityController::class, 'store'])->name('charities.store');
        Route::get('/users', [AdminController::class, 'getAllUsers'])->name('users.index');
    });

    // User Management Routes
    Route::prefix('user-management')->name('user-management.')->group(function () {
        Route::get('/view-users', [ViewUserController::class, 'getViewUsers'])->name('view-users');
        Route::get('/roles', [ViewUserController::class, 'getRoles'])->name('roles');
        Route::put('/users/{id}', [ViewUserController::class, 'updateUser'])->name('users.update');
        Route::delete('/users/{id}', [ViewUserController::class, 'deleteUser'])->name('users.destroy');
    });

    // Reports routes
    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('/users', [ReportController::class, 'users'])->name('users');
        Route::get('/top-users', [ReportController::class, 'topUsers'])->name('top-users');
        Route::get('/user-activity', [ReportController::class, 'userActivity'])->name('user-activity');
        Route::get('/location', [ReportController::class, 'usersByCity'])->name('location');
        Route::get('/sales', [ReportController::class, 'sales'])->name('sales');
        Route::get('/donations', [ReportController::class, 'donations'])->name('donations');
        Route::get('/listings-performance', [ReportController::class, 'listingsPerformance'])->name('listings-performance');
        Route::get('/inventory', [ReportController::class, 'inventoryByCategory'])->name('inventory');
        Route::get('/time-based', [ReportController::class, 'timeBased'])->name('time-based');
        Route::get('/sustainability', [ReportController::class, 'sustainability'])->name('sustainability');
        Route::get('/charities', [ReportController::class, 'charities'])->name('charities');
    });
});

// User announcements & specific types (Support both slug and ID for flexibility)
Route::get('/user/{user}/announcements', [AnnouncementController::class, 'getUserAnnouncementsBySlug'])->name('user.announcements');
Route::get('/user/{user}/donations', [AnnouncementController::class, 'getUserDonations'])->name('user.donations');
Route::get('/user/{user}/sales', [AnnouncementController::class, 'getUserSales'])->name('user.sales');

// Legacy/Alternative prefixes for compatibility
Route::get('/users/{user:slug}/announcements', [AnnouncementController::class, 'getUserAnnouncementsBySlug'])->name('users.user.announcements');
Route::get('/users/{user:slug}/donations', [AnnouncementController::class, 'getUserDonations'])->name('users.donations');
Route::get('/users/{user:slug}/sales', [AnnouncementController::class, 'getUserSales'])->name('users.sales');

// Charity announcements routes
Route::get('/charities/{charityId}/announcements', [AnnouncementController::class, 'getCharityAnnouncements'])->name('charity.announcements');
