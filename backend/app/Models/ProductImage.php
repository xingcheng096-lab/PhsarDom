<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class ProductImage extends Model { protected $fillable=['product_id','storage_path','alt_text','is_primary']; protected $casts=['is_primary'=>'boolean']; }
