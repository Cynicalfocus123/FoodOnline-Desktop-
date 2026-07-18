<?php

namespace App\Http\Controllers\Api\Catalog;

use App\Http\Controllers\Controller;
use App\Http\Resources\Catalog\BrandResource;
use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BrandController extends Controller
{
    public function index(Request $request)
    {
        $f=$request->validate(['search'=>['sometimes','string','max:150'],'country_code'=>['sometimes','regex:/^[A-Za-z]{2}$/'],'sort'=>['sometimes',Rule::in(['name','sort_order'])],'page'=>['sometimes','integer','min:1'],'per_page'=>['sometimes','integer','min:1','max:100']]);
        $q=Brand::query()->active()->whereHas('products',fn($p)=>$p->published()->whereHas('category',fn($c)=>$c->published()->where('visibility','public'))->whereHas('defaultVariant'));
        if(isset($f['search'])){$q->where('name','like','%'.$f['search'].'%');} if(isset($f['country_code'])){$q->where('country_code',strtoupper($f['country_code']));}
        $q->orderBy($f['sort']??'sort_order')->orderBy('name')->orderBy('id');
        return BrandResource::collection($q->paginate((int)($f['per_page']??24))->withQueryString());
    }
}
