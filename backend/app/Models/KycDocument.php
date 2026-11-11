<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class KycDocument extends Model
{
    protected $fillable=['kyc_submission_id','document_type','storage_path','original_name','mime_type','size_bytes'];
}
