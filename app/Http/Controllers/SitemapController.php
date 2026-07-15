<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function products(): Response { $urls = Product::query()->published()->whereHas('category', fn ($q) => $q->published()->where('visibility', 'public'))->get(['slug', 'updated_at'])->map(fn ($product) => $this->url('/#product/'.$product->slug, $product->updated_at)); return $this->xml($urls); }
    public function categories(): Response { $urls = Category::query()->published()->where('visibility', 'public')->get(['slug', 'updated_at'])->map(fn ($category) => $this->url('/#category/'.$category->slug, $category->updated_at)); return $this->xml($urls); }
    public function index(): Response { $base = rtrim((string) config('foodonlines.frontend_url'), '/'); return response('<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>'.$base.'/sitemaps/products.xml</loc></sitemap><sitemap><loc>'.$base.'/sitemaps/categories.xml</loc></sitemap></sitemapindex>', 200, ['Content-Type' => 'application/xml; charset=UTF-8']); }
    private function xml($urls): Response { $body = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'; foreach ($urls as $url) { $body .= '<url><loc>'.e($url['loc']).'</loc>'.($url['lastmod'] ? '<lastmod>'.$url['lastmod'].'</lastmod>' : '').'</url>'; } return response($body.'</urlset>', 200, ['Content-Type' => 'application/xml; charset=UTF-8']); }
    private function url(string $loc, $updated): array { return ['loc' => rtrim((string) config('foodonlines.frontend_url'), '/').$loc, 'lastmod' => $updated?->toAtomString()]; }
}
