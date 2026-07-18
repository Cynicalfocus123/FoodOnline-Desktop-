<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Media\MediaStorageManager;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LocalMediaController extends Controller
{
    public function __invoke(string $path, MediaStorageManager $storage): StreamedResponse
    {
        $managed = $storage->parseManagedReference('local://media/'.ltrim($path, '/'));
        abort_unless($managed && $managed['provider'] === MediaStorageManager::LOCAL, 404);

        $disk = Storage::disk($managed['disk']);
        abort_unless($disk->exists($managed['key']), 404);

        return $disk->response($managed['key'], null, [
            'Cache-Control' => 'public, max-age=31536000, immutable',
            'Content-Disposition' => 'inline',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
