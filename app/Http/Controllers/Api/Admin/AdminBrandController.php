<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Brand\ListBrandsRequest;
use App\Http\Requests\Admin\Brand\StoreBrandRequest;
use App\Http\Requests\Admin\Brand\UpdateBrandRequest;
use App\Http\Resources\Admin\AdminBrandResource;
use App\Models\Brand;
use Illuminate\Http\JsonResponse;

class AdminBrandController extends Controller
{
    public function index(ListBrandsRequest $request)
    {
        $f=$request->validated(); $q=Brand::query();
        if(isset($f['search'])){$q->where(fn($x)=>$x->where('name','like','%'.$f['search'].'%')->orWhere('slug','like','%'.$f['search'].'%'));}
        if(array_key_exists('is_active',$f)){$q->where('is_active',$request->boolean('is_active'));}
        if(isset($f['country_code'])){$q->where('country_code',strtoupper($f['country_code']));}
        $q->orderBy($f['sort']??'sort_order',$f['direction']??'asc')->orderBy('name')->orderBy('id');
        return AdminBrandResource::collection($q->paginate((int)($f['per_page']??25))->withQueryString());
    }
    public function store(StoreBrandRequest $request): JsonResponse
    {
        $brand=Brand::query()->create([...$request->validated(),'created_by'=>$request->user()->id,'updated_by'=>$request->user()->id]);
        return (new AdminBrandResource($brand))->response()->setStatusCode(201);
    }
    public function show(Brand $brand): AdminBrandResource { return new AdminBrandResource($brand); }
    public function update(UpdateBrandRequest $request,Brand $brand): AdminBrandResource { $brand->fill([...$request->validated(),'updated_by'=>$request->user()->id])->save(); return new AdminBrandResource($brand->fresh()); }
    public function destroy(Brand $brand): JsonResponse { $brand->forceFill(['is_active'=>false,'updated_by'=>request()->user()->id])->save(); return response()->json(null,204); }
}
