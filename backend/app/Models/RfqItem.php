<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class RfqItem extends Model { protected $fillable=['rfq_id','product_id','quantity','target_unit_price']; public function product(){return $this->belongsTo(Product::class);} }
