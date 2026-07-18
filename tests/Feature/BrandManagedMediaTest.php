<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\MediaUpload;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\Concerns\CreatesAdminTokens;
use Tests\TestCase;

class BrandManagedMediaTest extends TestCase
{
    use CreatesAdminTokens, RefreshDatabase;

    public function test_brand_logo_completion_stores_canonical_path_and_public_url(): void
    {
        [$admin,$token]=$this->adminToken(); Storage::fake('r2'); config(['foodonlines.media.r2_public_url'=>'https://media.foodonlines.com']);
        $brand=Brand::factory()->create(); $bytes=base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=');
        $uuid=(string)Str::uuid();$key='brands/'.$brand->uuid.'/logo-'.$uuid.'.png';Storage::disk('r2')->put($key,$bytes);
        $upload=MediaUpload::query()->create(['uuid'=>$uuid,'purpose'=>'brand_logo','target_type'=>'brand','target_id'=>$brand->id,'target_field'=>'logo_path','disk'=>'r2','object_key'=>$key,'original_filename'=>'logo.png','expected_mime_type'=>'image/png','expected_size_bytes'=>strlen($bytes),'status'=>'pending','expires_at'=>now()->addMinute(),'created_by'=>$admin->id]);
        $this->withToken($token)->postJson('/api/v1/admin/media-uploads/'.$upload->uuid.'/complete')->assertOk()->assertJsonPath('data.logo_path','r2://'.$key)->assertJsonPath('data.logo_url','https://media.foodonlines.com/'.$key);
    }
}
