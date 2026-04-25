<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'super_category_id',
        'listing_mode',
        'listing_type',
        'title',
        'description',
        'price',
        'currency',
        'price_negotiable',
        'pickup_address',
        'contact_phone',
        'handover_method',
        'status',
        'condition',
        'gender',
        'age_range',
        'brand',
        'season',
        'sizes',
        'colors',
        'views_count',
        'favorites_count',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'price_negotiable' => 'boolean',
        'sizes' => 'array',
        'colors' => 'array',
        'views_count' => 'integer',
        'favorites_count' => 'integer',
    ];

    /**
     * attributes hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'user_id',
        'super_category_id',
        'deleted_at',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function superCategory(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'super_category_id');
    }

    public function subCategories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'subcategory_product');
    }

    // Backward compatibility alias
    public function categories(): BelongsToMany
    {
        return $this->subCategories();
    }

    // Get all categories (super + sub) as a merged collection
    public function allCategories()
    {
        $super = $this->superCategory ? [$this->superCategory] : [];
        $subs = $this->subCategories->all();
        return collect(array_merge($super, $subs));
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'product_tag');
    }

    public function items(): HasMany
    {
        return $this->hasMany(ProductItem::class);
    }

    public function addresses(): MorphMany
    {
        return $this->morphMany(Address::class, 'addressable');
    }

    public function media(): MorphMany
    {
        return $this->morphMany(Media::class, 'mediable');
    }

    public function thumbnail(): MorphOne
    {
        return $this->morphOne(Media::class, 'mediable')
            ->where('collection', 'thumbnail')
            ->orderBy('sort_order');
    }

    public function gallery(): MorphMany
    {
        return $this->morphMany(Media::class, 'mediable')
            ->where('collection', 'gallery')
            ->orderBy('sort_order');
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    public function reports(): HasMany
    {
        return $this->hasMany(Report::class);
    }
}
