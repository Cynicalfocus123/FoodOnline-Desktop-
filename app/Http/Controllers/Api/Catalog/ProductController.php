<?php

namespace App\Http\Controllers\Api\Catalog;

use App\Http\Controllers\Controller;
use App\Http\Resources\Catalog\ProductDetailResource;
use App\Http\Resources\Catalog\ProductListResource;
use App\Models\Category;
use App\Models\CategoryAlias;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $f=$request->validate([
            'search'=>['sometimes','string','max:255'],'category'=>['sometimes','string','max:160'],'brand'=>['sometimes','string','max:160'],
            'country_of_origin'=>['sometimes','regex:/^[A-Za-z]{2}$/'],'storage_type'=>['sometimes',Rule::in(Product::STORAGE_TYPES)],
            'availability'=>['sometimes',Rule::in(ProductVariant::AVAILABILITY_STATUSES)],'featured'=>['sometimes','boolean'],
            'min_price'=>['sometimes','numeric','min:0'],'max_price'=>['sometimes','numeric','gte:min_price'],
            'sort'=>['sometimes',Rule::in(['featured','newest','price_asc','price_desc','name_asc','name_desc'])],
            'page'=>['sometimes','integer','min:1'],'per_page'=>['sometimes','integer','min:1','max:100'],
        ]);
        $q=$this->visibleQuery('public')->with(['category','brand','defaultVariant','primaryMedia']);
        if(isset($f['search'])){$term=$f['search'];$q->where(fn(Builder $x)=>$x->where('name','like','%'.$term.'%')->orWhereHas('brand',fn($b)=>$b->where('name','like','%'.$term.'%'))->orWhereHas('variants',fn($v)=>$v->active()->where(fn($i)=>$i->where('sku','like','%'.$term.'%')->orWhere('gtin','like','%'.$term.'%'))));}
        if(isset($f['category'])){$category=Category::query()->published()->where('slug',$f['category'])->first();if(!$category){$category=CategoryAlias::query()->where('alias_slug',$f['category'])->where('is_active',true)->first()?->category()->published()->first();}if(!$category){abort(404);} $q->where('category_id',$category->id);}
        if(isset($f['brand'])){$q->whereHas('brand',fn($x)=>$x->where('slug',$f['brand'])->orWhere('uuid',$f['brand']));}
        if(isset($f['country_of_origin'])){$q->where('country_of_origin_code',strtoupper($f['country_of_origin']));}
        if(isset($f['storage_type'])){$q->where('storage_type',$f['storage_type']);} if(isset($f['featured'])){$q->where('is_featured',$request->boolean('featured'));}
        if(isset($f['availability'])){$q->whereHas('defaultVariant',fn($x)=>$x->where('availability_status',$f['availability']));}
        if(isset($f['min_price'])){$q->whereHas('defaultVariant',fn($x)=>$x->where('price_amount','>=',$f['min_price']));} if(isset($f['max_price'])){$q->whereHas('defaultVariant',fn($x)=>$x->where('price_amount','<=',$f['max_price']));}
        $sort=$f['sort']??'featured';
        match($sort){
            'newest'=>$q->orderByDesc('published_at'),'price_asc'=>$this->orderPrice($q,'asc'),'price_desc'=>$this->orderPrice($q,'desc'),
            'name_asc'=>$q->orderBy('name'),'name_desc'=>$q->orderByDesc('name'),default=>$q->orderByDesc('is_featured')->orderByDesc('published_at'),
        }; $q->orderBy('id');
        return ProductListResource::collection($q->paginate((int)($f['per_page']??24))->withQueryString());
    }
    public function show(string $product): ProductDetailResource
    {
        $item=$this->visibleQuery(['public','catalog_only'])->where('slug',$product)->with(['category','brand','defaultVariant','primaryMedia','activeVariants','nutritionFacts','media'=>fn($q)=>$q->ordered()])->firstOrFail();
        return new ProductDetailResource($item);
    }
    private function visibleQuery(string|array $visibility): Builder
    {
        return Product::query()->published()->whereHas('category',fn($q)=>$q->published()->whereIn('visibility',(array)$visibility))->whereHas('defaultVariant')->whereHas('primaryMedia');
    }
    private function orderPrice(Builder $query,string $direction): Builder
    {
        return $query->orderBy(ProductVariant::select('price_amount')->whereColumn('product_id','products.id')->where('is_active',true)->where('is_default',true)->limit(1),$direction);
    }
}
