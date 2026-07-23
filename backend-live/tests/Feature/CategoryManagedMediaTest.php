<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\MediaUpload;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\Concerns\CreatesAdminTokens;
use Tests\TestCase;

class CategoryManagedMediaTest extends TestCase
{
    use CreatesAdminTokens, RefreshDatabase;

    public function test_completion_updates_only_the_bound_category_field(): void
    {
        [$admin, $token] = $this->adminToken(); Storage::fake('r2');
        $category = Category::factory()->create(['image_path'=>'https://example.com/old.webp','icon_path'=>'images/icon.webp']);
        $bytes = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=');
        $uuid=(string)Str::uuid(); $key='categories/'.$category->uuid.'/image-'.$uuid.'.png'; Storage::disk('r2')->put($key,$bytes);
        $upload=MediaUpload::query()->create(['uuid'=>$uuid,'purpose'=>'category_image','target_type'=>'category','target_id'=>$category->id,'target_field'=>'image_path','disk'=>'r2','object_key'=>$key,'original_filename'=>'x.png','expected_mime_type'=>'image/png','expected_size_bytes'=>strlen($bytes),'status'=>'pending','expires_at'=>now()->addMinute(),'created_by'=>$admin->id]);
        $this->withToken($token)->postJson('/api/v1/admin/media-uploads/'.$upload->uuid.'/complete')->assertOk()->assertJsonPath('data.media.image_path','r2://'.$key);
        $this->assertSame('images/icon.webp',$category->fresh()->icon_path);
        $this->assertTrue(Storage::disk('r2')->exists($key));
    }
}
