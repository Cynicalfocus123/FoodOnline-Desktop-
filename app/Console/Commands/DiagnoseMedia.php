<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use App\Services\Media\MediaStorageManager;

class DiagnoseMedia extends Command
{
    protected $signature = 'media:diagnose';
    protected $description = 'Report safe managed-media configuration diagnostics without exposing secrets.';
    public function handle(MediaStorageManager $storage): int
    {
        $disk = $storage->disk();
        $this->table(['Check', 'Result'], [
            ['Uploads enabled', config('foodonlines.media.uploads_enabled') ? 'yes' : 'no'],
            ['Upload capability', $storage->uploadsAvailable() ? 'available' : 'unavailable'],
            ['Filesystem resolvable', $this->diskResolves($disk) ? 'yes' : 'no'],
            ['Public delivery URL', config('foodonlines.media.local_public_url') || config('foodonlines.media.r2_public_url') ? 'configured' : 'missing'],
            ['Cleanup schedule', 'media:cleanup hourly'],
        ]);
        return $storage->uploadsAvailable() && $this->diskResolves($disk) ? self::SUCCESS : self::FAILURE;
    }
    private function diskResolves(string $disk): bool { try { Storage::disk($disk); return true; } catch (\Throwable) { return false; } }
}
