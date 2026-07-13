<?php

namespace App\Http\Resources\Catalog;

use Illuminate\Http\Resources\Json\ResourceCollection;

class CategoryCollection extends ResourceCollection
{
    public $collects = CategoryResource::class;
}
