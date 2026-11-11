<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class PurchaseOrder extends Model { protected $fillable=['quotation_id','buyer_business_id','status','total_amount']; protected $casts=['total_amount'=>'decimal:2']; public function quotation(){return $this->belongsTo(Quotation::class);} public function items(){return $this->hasMany(PurchaseOrderItem::class);} }
