<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Quotation extends Model { protected $fillable=['rfq_id','buyer_business_id','issued_by','status','expires_at','total_amount']; protected $casts=['expires_at'=>'date','total_amount'=>'decimal:2']; public function rfq(){return $this->belongsTo(Rfq::class);} public function items(){return $this->hasMany(QuotationItem::class);} public function purchaseOrder(){return $this->hasOne(PurchaseOrder::class);} }
