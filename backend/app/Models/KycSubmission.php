<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
class KycSubmission extends Model
{
    protected $fillable=['buyer_business_id','status','metadata','reviewer_id','reviewed_at','rejection_reason'];
    protected $casts=['metadata'=>'array','reviewed_at'=>'datetime'];
    public function business(): BelongsTo { return $this->belongsTo(BuyerBusiness::class,'buyer_business_id'); }
    public function documents(): HasMany { return $this->hasMany(KycDocument::class); }
}
