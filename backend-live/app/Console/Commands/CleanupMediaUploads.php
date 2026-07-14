<?php

namespace App\Console\Commands;

use App\Models\MediaUpload;
use App\Services\Media\ManagedMediaDeletionService;
use Illuminate\Console\Command;

class CleanupMediaUploads extends Command
{
    protected $signature = 'media:cleanup {--limit=100 : Maximum records to inspect}';
    protected $description = 'Remove expired or cleanup-pending managed media uploads';

    public function handle(ManagedMediaDeletionService $deletion): int
    {
        $limit = min(1000, max(1, (int) $this->option('limit')));
        $uploads = MediaUpload::query()
            ->where(fn ($query) => $query->where(fn ($pending) => $pending->where('status', 'pending')->where('expires_at', '<=', now()))->orWhere('status', 'cleanup_pending'))
            ->orderBy('id')->limit($limit)->get();
        $cleaned = 0;
        foreach ($uploads as $upload) {
            if ($upload->status === 'pending') { $upload->forceFill(['status' => 'expired'])->save(); }
            if ($deletion->deletePath('r2://'.$upload->object_key)) { $cleaned++; }
        }
        $this->info("Media cleanup inspected {$uploads->count()} record(s); cleaned {$cleaned}.");
        return self::SUCCESS;
    }
}
