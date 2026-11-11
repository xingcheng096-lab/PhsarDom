<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\{BuyerBusiness,Product,PurchaseOrder,PurchaseOrderItem,Quotation,QuotationItem,Rfq,RfqItem};
use Illuminate\Http\{JsonResponse,Request};
use Illuminate\Support\Facades\DB;

class ProcurementController extends Controller
{
    public function createRfq(Request $request): JsonResponse
    {
        $data=$request->validate(['buyer_business_id'=>['required','integer'],'message'=>['nullable','string'],'items'=>['required','array','min:1'],'items.*.product_id'=>['required','exists:products,id'],'items.*.quantity'=>['required','integer','min:1'],'items.*.target_unit_price'=>['nullable','numeric','gt:0']]);
        $business=BuyerBusiness::whereKey($data['buyer_business_id'])->whereHas('members',fn($q)=>$q->whereKey($request->user()->id))->firstOrFail();
        abort_unless($business->status === 'Approved', 403, 'Buyer business is not approved.');
        $rfq=DB::transaction(function()use($data,$business,$request){$r=Rfq::create(['buyer_business_id'=>$business->id,'created_by'=>$request->user()->id,'status'=>'Submitted','message'=>$data['message']??null]); foreach($data['items'] as $item){$p=Product::whereKey($item['product_id'])->where('status','Published')->firstOrFail(); abort_if($item['quantity']<$p->moq,422,'Quantity is below product MOQ.'); $r->items()->create($item);} return $r;});
        return response()->json($rfq->load('items.product'),201);
    }
    public function issueQuotation(Request $request): JsonResponse
    {
        abort_unless($request->user()->hasRole('admin')||$request->user()->hasRole('super_admin'),403);
        $data=$request->validate(['rfq_id'=>['required','exists:rfqs,id'],'expires_at'=>['nullable','date','after_or_equal:today'],'items'=>['required','array','min:1'],'items.*.product_id'=>['required','exists:products,id'],'items.*.quantity'=>['required','integer','min:1'],'items.*.unit_price'=>['required','numeric','gt:0']]);
        $rfq=Rfq::with('items')->findOrFail($data['rfq_id']);
        $q=DB::transaction(function()use($data,$rfq,$request){$items=collect($data['items']); abort_unless($items->pluck('product_id')->sort()->values()->all()===$rfq->items->pluck('product_id')->sort()->values()->all(),422,'Quotation items do not match RFQ.'); $total=$items->sum(fn($i)=>$i['quantity']*$i['unit_price']); $quote=Quotation::create(['rfq_id'=>$rfq->id,'buyer_business_id'=>$rfq->buyer_business_id,'issued_by'=>$request->user()->id,'status'=>'Issued','expires_at'=>$data['expires_at']??null,'total_amount'=>$total]); foreach($data['items'] as $item)$quote->items()->create($item+['line_total'=>$item['quantity']*$item['unit_price']]); $rfq->update(['status'=>'Quoted']); return $quote;});
        return response()->json($q->load('items.product','rfq'),201);
    }
    public function acceptQuotation(Request $request, Quotation $quotation): JsonResponse
    {
        abort_unless($quotation->buyer_business_id && $quotation->rfq()->whereHas('business.members',fn($q)=>$q->whereKey($request->user()->id))->exists(),403);
        $existing = PurchaseOrder::where('quotation_id', $quotation->id)->first();
        if ($existing) {
            return response()->json($existing->load('items'), 200);
        }
        abort_if($quotation->status!=='Issued',422,'Quotation is not available.'); abort_if($quotation->expires_at && $quotation->expires_at->isPast(),422,'Quotation has expired.');
        $po=DB::transaction(function()use($quotation){$existing=PurchaseOrder::where('quotation_id',$quotation->id)->first(); if($existing)return $existing; $quotation->load('items'); $po=PurchaseOrder::create(['quotation_id'=>$quotation->id,'buyer_business_id'=>$quotation->buyer_business_id,'status'=>'Confirmed','total_amount'=>$quotation->total_amount]); foreach($quotation->items as $item)$po->items()->create(['product_id'=>$item->product_id,'quantity'=>$item->quantity,'unit_price'=>$item->unit_price,'line_total'=>$item->line_total]); $quotation->update(['status'=>'Accepted']); return $po;});
        return response()->json($po->load('items'),$po->wasRecentlyCreated?201:200);
    }
    public function rfqs(Request $request){return response()->json(Rfq::with('items.product')->whereHas('business.members',fn($q)=>$q->whereKey($request->user()->id))->latest()->paginate());}
    public function quotations(Request $request){return response()->json(Quotation::with('items.product','rfq')->whereHas('rfq.business.members',fn($q)=>$q->whereKey($request->user()->id))->latest()->paginate());}
    public function purchaseOrders(Request $request){return response()->json(PurchaseOrder::with('items','quotation')->whereHas('quotation.rfq.business.members',fn($q)=>$q->whereKey($request->user()->id))->latest()->paginate());}
}
