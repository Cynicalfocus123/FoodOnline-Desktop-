<?php

namespace App\Http\Resources\Catalog;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductVariantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $discount = $this->compare_at_price_amount && (float)$this->compare_at_price_amount > 0
            ? (int) round((1 - ((float)$this->price_amount / (float)$this->compare_at_price_amount)) * 100)
            : null;
        return [
            'id'=>(string)$this->id,'uuid'=>$this->uuid,'title'=>$this->title,'sku'=>$this->sku,'gtin'=>$this->gtin,
            'size'=>$this->displaySize(),'net_content_value'=>$this->net_content_value,'net_content_unit'=>$this->net_content_unit,
            'pack_count'=>$this->pack_count,'package_type'=>$this->package_type,'price'=>$this->price_amount,
            'old_price'=>$this->compare_at_price_amount,'discount_percent'=>$discount,'currency_code'=>$this->currency_code,
            'availability_status'=>$this->availability_status,'in_stock'=>$this->availability_status==='in_stock','is_default'=>$this->is_default,
        ];
    }
}
