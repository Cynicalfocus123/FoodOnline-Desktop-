<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Product\ListProductsRequest;
use App\Http\Requests\Admin\Product\StoreProductRequest;
use App\Http\Requests\Admin\Product\UpdateProductRequest;
use App\Http\Resources\Admin\AdminProductResource;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\Catalog\ProductPublicationService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;

class AdminProductController extends Controller
{
    public function __construct(private readonly ProductPublicationService $publication) {}
    public function index(ListProductsRequest $request)
    {
        $f=$request->validated(); $q=Product::query()->with(['category','brand','defaultVariant','primaryMedia']);
        if(isset($f['search'])){$term=$f['search'];$q->where(fn(Builder $x)=>$x->where('name','like','%'.$term.'%')->orWhere('slug','like','%'.$term.'%')->orWhereHas('brand',fn($b)=>$b->where('name','like','%'.$term.'%'))->orWhereHas('variants',fn($v)=>$v->where('sku','like','%'.$term.'%')->orWhere('gtin','like','%'.$term.'%')));}
        foreach(['status','category_id','brand_id','storage_type','is_featured'] as $field){if(array_key_exists($field,$f)){$q->where($field,$f[$field]);}}
        if(isset($f['category_uuid'])){$q->whereHas('category',fn($x)=>$x->where('uuid',$f['category_uuid']));} if(isset($f['category_slug'])){$q->whereHas('category',fn($x)=>$x->where('slug',$f['category_slug']));}
        if(isset($f['brand_uuid'])){$q->whereHas('brand',fn($x)=>$x->where('uuid',$f['brand_uuid']));} if(isset($f['brand_slug'])){$q->whereHas('brand',fn($x)=>$x->where('slug',$f['brand_slug']));}
        if(isset($f['country_of_origin_code'])){$q->where('country_of_origin_code',strtoupper($f['country_of_origin_code']));}
        foreach(['availability_status','min_price','max_price'] as $field){if(isset($f[$field])){$q->whereHas('defaultVariant',function($x)use($field,$f){match($field){'availability_status'=>$x->where('availability_status',$f[$field]),'min_price'=>$x->where('price_amount','>=',$f[$field]),default=>$x->where('price_amount','<=',$f[$field])};});}}
        $sort=$f['sort']??'created_at';$dir=$f['direction']??'desc';
        if($sort==='default_variant_price'){$q->orderBy(ProductVariant::select('price_amount')->whereColumn('product_id','products.id')->where('is_active',true)->where('is_default',true)->limit(1),$dir);}else{$q->orderBy($sort,$dir);} $q->orderBy('id');
        return AdminProductResource::collection($q->paginate((int)($f['per_page']??25))->withQueryString());
    }
    public function store(StoreProductRequest $request): JsonResponse { $p=Product::query()->create([...$request->validated(),'status'=>'draft','created_by'=>$request->user()->id,'updated_by'=>$request->user()->id]); return (new AdminProductResource($this->detail($p)))->response()->setStatusCode(201); }
    public function show(Product $product): AdminProductResource { return new AdminProductResource($this->detail($product)); }
    public function update(UpdateProductRequest $request,Product $product): AdminProductResource { $product->fill([...$request->validated(),'updated_by'=>$request->user()->id])->save(); return new AdminProductResource($this->detail($product->fresh())); }
    public function destroy(Product $product): JsonResponse { $this->publication->archive($product,request()->user()); return response()->json(null,204); }
    public function publish(Product $product): AdminProductResource { return new AdminProductResource($this->detail($this->publication->publish($product,request()->user()))); }
    public function restore(Product $product): AdminProductResource { return new AdminProductResource($this->detail($this->publication->restore($product,request()->user()))); }
    private function detail(Product $product): Product { return $product->load(['category','brand','defaultVariant','primaryMedia','nutritionFacts','variants'=>fn($q)=>$q->ordered(),'media'=>fn($q)=>$q->ordered()]); }
}
