<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
class BuyerBusiness extends Model
{
    protected $fillable=['legal_name','registration_number','status','country','profile','approved_at','approved_by'];
    protected $casts=['profile'=>'array','approved_at'=>'datetime'];
    public function members(): BelongsToMany { return $this->belongsToMany(User::class,'buyer_memberships')->withPivot('membership_role'); }
    public function kycSubmissions(): HasMany { return $this->hasMany(KycSubmission::class); }
}
