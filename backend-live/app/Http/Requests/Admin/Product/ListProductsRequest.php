<?php
namespace App\Http\Requests\Admin\Product;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
class ListProductsRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()?->role === 'admin'; }
    public function rules(): array { return ['search'=>['sometimes','string','max:255'],'status'=>['sometimes',Rule::in(Product::STATUSES)],'category_id'=>['sometimes','integer'],'category_uuid'=>['sometimes','uuid'],'category_slug'=>['sometimes','string','max:160'],'brand_id'=>['sometimes','integer'],'brand_uuid'=>['sometimes','uuid'],'brand_slug'=>['sometimes','string','max:160'],'country_of_origin_code'=>['sometimes','regex:/^[A-Za-z]{2}$/'],'storage_type'=>['sometimes',Rule::in(Product::STORAGE_TYPES)],'is_featured'=>['sometimes','boolean'],'availability_status'=>['sometimes',Rule::in(ProductVariant::AVAILABILITY_STATUSES)],'min_price'=>['sometimes','numeric','min:0'],'max_price'=>['sometimes','numeric','gte:min_price'],'sort'=>['sometimes',Rule::in(['name','created_at','updated_at','published_at','default_variant_price'])],'direction'=>['sometimes',Rule::in(['asc','desc'])],'page'=>['sometimes','integer','min:1'],'per_page'=>['sometimes','integer','min:1','max:100']]; }
}
