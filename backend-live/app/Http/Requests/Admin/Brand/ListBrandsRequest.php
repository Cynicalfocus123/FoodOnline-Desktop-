<?php
namespace App\Http\Requests\Admin\Brand;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
class ListBrandsRequest extends FormRequest
{
    public function authorize(): bool { return $this->user()?->role === 'admin'; }
    public function rules(): array { return ['search'=>['sometimes','string','max:150'],'is_active'=>['sometimes','boolean'],'country_code'=>['sometimes','regex:/^[A-Za-z]{2}$/'],'sort'=>['sometimes',Rule::in(['name','sort_order','created_at','updated_at'])],'direction'=>['sometimes',Rule::in(['asc','desc'])],'page'=>['sometimes','integer','min:1'],'per_page'=>['sometimes','integer','min:1','max:100']]; }
}
