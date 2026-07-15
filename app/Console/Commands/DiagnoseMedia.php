<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class DiagnoseMedia extends Command
{
    protected $signature = 'media:diagnose';
    protected $description = 'Report safe Cloudflare R2/media configuration diagnostics without exposing secrets.';
    public function handle(): int
    {
        $disk = (string) config('foodonlines.media.disk', 'r2'); $config = (array) config('filesystems.disks.'.$disk, []); $credentials = ! empty($config['key']) && ! empty($config['secret']) && ! empty($config['bucket']) && ! empty($config['endpoint']);
        $this->table(['Check', 'Result'], [['Disk', $disk], ['Uploads enabled', config('foodonlines.media.uploads_enabled') ? 'yes' : 'no'], ['Credentials present', $credentials ? 'yes' : 'no'], ['Bucket configured', empty($config['bucket']) ? 'no' : 'yes'], ['Endpoint configured', empty($config['endpoint']) ? 'no' : 'yes'], ['Public URL configured', config('foodonlines.media.public_url') ? 'yes' : 'no'], ['Disk resolvable', $this->diskResolves($disk) ? 'yes' : 'no'], ['Cleanup schedule', 'media:cleanup hourly']]);
        return self::SUCCESS;
    }
    private function diskResolves(string $disk): bool { try { Storage::disk($disk); return true; } catch (\Throwable) { return false; } }
}
