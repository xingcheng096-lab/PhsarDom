<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class ProductPricingTier extends Model { protected $fillable=['product_id','minimum_quantity','maximum_quantity','unit_price']; protected $casts=['minimum_quantity'=>'integer','maximum_quantity'=>'integer','unit_price'=>'decimal:2']; }
