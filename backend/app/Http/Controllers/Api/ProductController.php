<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class ProductController extends Controller
{
    public function index(Request $request): JsonResponse { $q=Product::with(['category','pricingTiers','images'])->where('status','Published')->when($request->filled('search'),fn($q)=>$q->where(function($q)use($request){$s='%'.$request->string('search').'%';$q->where('name','ilike',$s)->orWhere('sku','ilike',$s);}))->when($request->filled('category_id'),fn($q)=>$q->where('category_id',$request->integer('category_id')));return response()->json($q->paginate(min($request->integer('per_page',20),100))); }
    public function show(Product $product): JsonResponse { abort_unless($product->status==='Published',404);return response()->json($product->load(['category','pricingTiers','images'])); }
    public function categories(): JsonResponse { return response()->json(Category::where('is_active',true)->orderBy('name')->get()); }
    public function store(Request $request): JsonResponse { abort_unless($request->user()->hasRole('admin')||$request->user()->hasRole('super_admin'),403);$d=$request->validate(['category_id'=>['nullable','exists:categories,id'],'sku'=>['required','string','unique:products,sku'],'name'=>['required','string'],'description'=>['nullable','string'],'moq'=>['required','integer','min:1'],'available_stock'=>['nullable','integer','min:0'],'unit'=>['nullable','string']]);return response()->json(Product::create($d+['status'=>'Published']),201); }
    public function update(Request $request, Product $product): JsonResponse { abort_unless($request->user()->hasRole('admin')||$request->user()->hasRole('super_admin'),403);$d=$request->validate(['category_id'=>['nullable','exists:categories,id'],'name'=>['sometimes','string'],'description'=>['nullable','string'],'moq'=>['sometimes','integer','min:1'],'available_stock'=>['sometimes','integer','min:0'],'unit'=>['sometimes','string'],'status'=>['sometimes','in:Published,Archived,Draft']]);$product->update($d);return response()->json($product->fresh(['category','pricingTiers','images'])); }
    public function archive(Request $request, Product $product): JsonResponse { abort_unless($request->user()->hasRole('admin')||$request->user()->hasRole('super_admin'),403);$product->update(['status'=>'Archived']);return response()->json(['status'=>'Archived']); }
    public function addTier(Request $request, Product $product): JsonResponse { abort_unless($request->user()->hasRole('admin')||$request->user()->hasRole('super_admin'),403);$d=$request->validate(['minimum_quantity'=>['required','integer','min:1'],'maximum_quantity'=>['nullable','integer','gte:minimum_quantity'],'unit_price'=>['required','numeric','gt:0']]);$tier=$product->pricingTiers()->create($d);return response()->json($tier,201); }
    public function deleteTier(Request $request, Product $product, $tier): JsonResponse { abort_unless($request->user()->hasRole('admin')||$request->user()->hasRole('super_admin'),403);$product->pricingTiers()->whereKey($tier)->firstOrFail()->delete();return response()->json(['deleted'=>true]); }
}
