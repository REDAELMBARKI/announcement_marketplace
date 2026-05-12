<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FoundationController;
use App\Http\Controllers\Home\HomepageController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\OpenAIController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\UserProfileController;
use App\Http\Controllers\ViewUserController;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| These routes are for your React front-end SPA and existing tests.
|
*/

// --- Test & Debug Endpoints ---
Route::get('/status', function () {
    return response()->json(['message' => 'Laravel API working']);
});

Route::get('/test-db', function () {
    return response()->json([
        'tables' => DB::select("SELECT name FROM sqlite_master WHERE type='table'"),
    ]);
});

Route::get('/users', function () {
    try {
        $users = DB::table('users')->get();
        return response()->json(['status' => 'success', 'users' => $users]);
    } catch (\Exception $e) {
        return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
    }
});

Route::get('/api/test-users', function () {
    try {
        $users = DB::table('users')->get();
        return response()->json(['status' => 'success', 'users' => $users]);
    } catch (\Exception $e) {
        return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
    }
});


// --- Authentication Routes ---
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/signup', [AuthController::class, 'signup'])->name('signup');

Route::middleware('auth:api')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    Route::get('/me', [AuthController::class, 'me'])->name('me');
});


// --- User Profile Routes ---
Route::get('/users/{user:slug}', [UserProfileController::class, 'show'])->name('user.show');

Route::middleware('auth:api')->group(function () {
    Route::put('/users/{user:slug}', [UserProfileController::class, 'update'])->name('user.update');
    Route::post('/user/avatar', [UserProfileController::class, 'uploadAvatar'])->name('user.avatar');
});


// --- Marketplace & Announcements (Reda's things) ---
Route::get('/homepage', HomepageController::class)->name('homepage');
Route::get('/foundations', [FoundationController::class, 'index'])->name('foundations.index');
Route::get('/marketplace/init-data', [AnnouncementController::class, 'getMarketplaceInitData'])->name('marketplace.init-data');
Route::get('/marketplace/listings', [AnnouncementController::class, 'getMarketplaceListings'])->name('marketplace.listings');
Route::get('/announcements', [AnnouncementController::class, 'getAllAnnouncements'])->name('announcements.all');
Route::get('/announcements/{announcement:slug}', [AnnouncementController::class, 'showBySlug'])->name('announcements.show');

// Reviews & Offers (Public)
Route::get('/announcements/{announcement:slug}/reviews', [AnnouncementController::class, 'getReviews'])->name('announcements.reviews');
Route::get('/announcements/{announcement:slug}/offers', [AnnouncementController::class, 'getOffers'])->name('announcements.offers');

// Authenticated Marketplace Actions
Route::middleware('auth:api')->group(function () {
    Route::post('/announcements', [AnnouncementController::class, 'store'])->name('announcements.store');
    Route::post('/announcements/{announcement:slug}/favorite', [AnnouncementController::class, 'toggleFavorite'])->name('announcements.favorite');
    Route::put('/announcements/{announcement:slug}', [AnnouncementController::class, 'update'])->name('announcements.update');
    Route::delete('/announcements/{announcement:slug}', [AnnouncementController::class, 'destroy'])->name('announcements.destroy');
    Route::put('/announcements/{announcement:slug}/status', [AnnouncementController::class, 'updateStatus'])->name('announcements.update-status');

    // Reviews & Offers Actions
    Route::post('/announcements/{announcement:slug}/reviews', [AnnouncementController::class, 'storeReview'])->name('announcements.reviews.store');
    Route::put('/reviews/{review}', [AnnouncementController::class, 'updateReview'])->name('reviews.update');
    Route::delete('/reviews/{review}', [AnnouncementController::class, 'destroyReview'])->name('reviews.destroy');

    Route::post('/announcements/{announcement:slug}/offers', [AnnouncementController::class, 'makeOffer'])->name('announcements.offers.store');
    Route::put('/offers/{offer}/accept', [AnnouncementController::class, 'acceptOffer'])->name('offers.accept');
    Route::put('/offers/{offer}/reject', [AnnouncementController::class, 'rejectOffer'])->name('offers.reject');
    Route::put('/offers/{offer}/counter', [AnnouncementController::class, 'counterOffer'])->name('offers.counter');
    Route::put('/offers/{offer}/accept-counter', [AnnouncementController::class, 'acceptCounterOffer'])->name('offers.accept-counter');
});


// --- User Specific Content ---
Route::prefix('users/{user:slug}')->name('users.')->group(function () {
    Route::get('announcements', [AnnouncementController::class, 'getUserAnnouncementsBySlug'])->name('user.announcements');
    Route::get('donations', [AnnouncementController::class, 'getUserDonations'])->name('donations');
    Route::get('sales', [AnnouncementController::class, 'getUserSales'])->name('sales');
});

Route::get('/charities/{charityId}/announcements', [AnnouncementController::class, 'getCharityAnnouncements'])->name('charity.announcements');


// --- Chat Routes (Reda's things) ---
Route::middleware('auth:api')->group(function () {
    Route::get('/conversations', [ChatController::class, 'getUserConversations'])->name('conversations.index');
    Route::post('/announcements/{announcement:slug}/conversation', [ChatController::class, 'getOrCreateConversation'])->name('conversations.get-or-create');
    Route::get('/conversations/{conversation:slug}/messages', [ChatController::class, 'getMessages'])->name('conversations.messages');
    Route::post('/conversations/{conversation:slug}/messages', [ChatController::class, 'sendMessage'])->name('conversations.messages.send');
    Route::put('/conversations/{conversation:slug}/read', [ChatController::class, 'markAsRead'])->name('conversations.read');
});


// --- Media Upload Routes ---
Route::middleware('auth:api')->group(function () {
    Route::post('/media/upload', [MediaController::class, 'upload'])->name('media.upload');
    Route::post('/media/upload-multiple', [MediaController::class, 'uploadMultiple'])->name('media.upload-multiple');
    Route::post('/media/link-to-announcement', [MediaController::class, 'linkToAnnouncement'])->name('media.link-to-announcement');
    Route::delete('/media/temporary/{mediaId}', [MediaController::class, 'deleteTemporary'])->name('media.delete-temporary');
    Route::post('/media/cleanup-temporary', [MediaController::class, 'cleanupTemporary'])->name('media.cleanup-temporary');
});


// --- Categories ---
Route::get('/categories', function () {
    $superCategories = Category::with('children')
        ->whereNull('parent_id')
        ->where('is_active', true)
        ->orderBy('sort_order')
        ->get();

    return response()->json([
        'status' => 'success',
        'categories' => $superCategories,
    ]);
})->name('categories.index');


// --- Admin & Dashboard Routes (Soufyan's Routes) ---
Route::middleware('auth:api')->group(function () {
    
    // Admin routes
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('/announcements', [AnnouncementController::class, 'getAllAnnouncementsForAdmin'])->name('announcements.index');
        Route::get('/charities', [AdminController::class, 'getAllCharities'])->name('charities.index');
        Route::get('/users', [AdminController::class, 'getAllUsers'])->name('users.index');
        Route::get('/stats', [AdminController::class, 'getDashboardStats'])->name('stats');
        
        // Detailed Admin Stats
        Route::get('/stats/type-split', [AdminController::class, 'getAnnouncementTypeSplit']);
        Route::get('/stats/funnel', [AdminController::class, 'getAnnouncementFunnel']);
        Route::get('/stats/categories', [AdminController::class, 'getTopCategories']);
        Route::get('/stats/user-retention', [AdminController::class, 'getUserRetention']);
        Route::get('/stats/hourly-activity', [AdminController::class, 'getHourlyActivity']);
        Route::get('/moderation/pending', [AdminController::class, 'getPendingModeration']);
        Route::get('/donations', [AdminController::class, 'getAllDonations']);
        Route::get('/inventory', [AdminController::class, 'getAllInventory']);
        Route::post('/charities', [AdminController::class, 'addCharity']);
        Route::put('/charities/{id}', [AdminController::class, 'updateCharity']);
        Route::delete('/charities/{id}', [AdminController::class, 'deleteCharity']);
    });

    // User Management
    Route::prefix('user-management')->name('user-management.')->group(function () {
        Route::get('/view-users', [ViewUserController::class, 'getViewUsers'])->name('view-users');
        Route::get('/roles', [ViewUserController::class, 'getRoles'])->name('roles');
        Route::get('/charities-list', [ViewUserController::class, 'getCharitiesList']);
        Route::put('/users/{id}', [ViewUserController::class, 'updateUser'])->name('users.update');
        Route::delete('/users/{id}', [ViewUserController::class, 'deleteUser'])->name('users.destroy');
    });

    // Dashboard stats
    Route::prefix('dashboard')->group(function () {
        Route::get('/stats', [DashboardController::class, 'stats']);
        Route::get('/activity', [DashboardController::class, 'activity']);
        Route::get('/top-announcements', [DashboardController::class, 'topAnnouncements']);
        Route::get('/categories', [DashboardController::class, 'categories']);
        Route::get('/status', [DashboardController::class, 'status']);
    });

    // Reports
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
        Route::get('/all', [ReportController::class, 'all'])->name('all');
        Route::get('/sustainability', [ReportController::class, 'sustainability'])->name('sustainability');
        Route::get('/charities', [ReportController::class, 'charities'])->name('charities');
    });
});


// --- Miscellaneous ---
Route::post('/remote-sessions', function (Request $request) {
    return response()->json([
        'status' => 'success',
        'session_id' => (string) Str::uuid(),
    ]);
})->name('remote-sessions');

Route::post('/ask-faq', [OpenAIController::class, 'ask'])->name('ask-faq');
