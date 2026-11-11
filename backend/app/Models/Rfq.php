<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Rfq extends Model { protected $fillable=['buyer_business_id','created_by','status','message']; public function business(){return $this->belongsTo(BuyerBusiness::class,'buyer_business_id');} public function items(){return $this->hasMany(RfqItem::class);} }
