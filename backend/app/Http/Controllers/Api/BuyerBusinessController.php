<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\BuyerBusiness;
use App\Models\KycSubmission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class BuyerBusinessController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data=$request->validate(['legal_name'=>['required','string','max:255','unique:buyer_businesses,legal_name'],'registration_number'=>['nullable','string','max:100','unique:buyer_businesses,registration_number'],'country'=>['nullable','string','max:100'],'profile'=>['nullable','array']]);
        $business=DB::transaction(function() use($request,$data){$b=BuyerBusiness::create($data+['country'=>$data['country']??'Cambodia','status'=>'Pending']);$b->members()->attach($request->user(),['membership_role'=>'owner']);return $b;});
        return response()->json(['business'=>$business],201);
    }
    public function show(Request $request, BuyerBusiness $business): JsonResponse
    { abort_unless($request->user()->hasRole('admin') || $business->members()->whereKey($request->user()->id)->exists(),403); return response()->json($business->load('kycSubmissions')); }
    public function submitKyc(Request $request, BuyerBusiness $business): JsonResponse
    { abort_unless($business->members()->whereKey($request->user()->id)->exists(),403); $data=$request->validate(['metadata'=>['required','array'],'documents'=>['nullable','array'],'documents.*.document_type'=>['required_with:documents','string'],'documents.*.storage_path'=>['required_with:documents','string']]); $kyc=DB::transaction(function() use($business,$data){$k=$business->kycSubmissions()->create(['metadata'=>$data['metadata'],'status'=>'Pending']);foreach($data['documents']??[] as $doc)$k->documents()->create($doc+['original_name'=>$doc['original_name']??'metadata','mime_type'=>$doc['mime_type']??null,'size_bytes'=>$doc['size_bytes']??null]);return $k;});return response()->json($kyc->load('documents'),201); }
    public function reviewKyc(Request $request, KycSubmission $submission): JsonResponse
    { abort_unless($request->user()->hasRole('admin')||$request->user()->hasRole('super_admin'),403);$data=$request->validate(['status'=>['required','in:Approved,Rejected'],'rejection_reason'=>['required_if:status,Rejected','nullable','string']]);DB::transaction(function()use($request,$submission,$data){$submission->update(['status'=>$data['status'],'reviewer_id'=>$request->user()->id,'reviewed_at'=>now(),'rejection_reason'=>$data['rejection_reason']??null]);$submission->business()->update(['status'=>$data['status'],'approved_at'=>$data['status']==='Approved'?now():null,'approved_by'=>$request->user()->id]);});return response()->json($submission->fresh('business'));}
}
