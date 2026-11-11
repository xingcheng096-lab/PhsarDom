<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
class Product extends Model
{
    protected $fillable=['category_id','sku','name','description','status','moq','available_stock','unit'];
    protected $casts=['moq'=>'integer','available_stock'=>'integer'];
    public function category(): BelongsTo { return $this->belongsTo(Category::class); }
    public function pricingTiers(): HasMany { return $this->hasMany(ProductPricingTier::class); }
    public function images(): HasMany { return $this->hasMany(ProductImage::class); }
}
