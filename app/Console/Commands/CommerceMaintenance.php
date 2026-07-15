<?php

namespace App\Console\Commands;

use App\Models\Cart;
use App\Models\CheckoutQuote;
use App\Models\OperationsHealthSnapshot;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CommerceMaintenance extends Command
{
    protected $signature = 'commerce:maintenance {--limit=500}';
    protected $description = 'Perform bounded, non-financial commerce retention maintenance and write an operations heartbeat.';
    public function handle(): int
    {
        $limit = max(1, (int) $this->option('limit')); $guestDays = max(1, (int) config('foodonlines.retention.guest_cart_days', 30)); $quoteDays = max(1, (int) config('foodonlines.retention.quote_days', 30));
        $quotes = CheckoutQuote::query()->where('created_at', '<', now()->subDays($quoteDays))->whereNull('consumed_at')->limit($limit)->delete();
        $carts = Cart::query()->whereNull('user_id')->where('status', 'active')->where('last_activity_at', '<', now()->subDays($guestDays))->limit($limit)->update(['status' => 'expired']);
        DB::table('notifications')->where('created_at', '<', now()->subDays(max(1, (int) config('foodonlines.retention.notification_days', 180))))->delete();
        DB::table('failed_jobs')->where('failed_at', '<', now()->subDays(max(1, (int) config('foodonlines.retention.failed_job_days', 90))))->delete();
        OperationsHealthSnapshot::query()->updateOrCreate(['key' => 'scheduler'], ['status' => 'ok', 'message' => 'Maintenance heartbeat recorded.', 'last_checked_at' => now(), 'metadata' => ['quotes_expired' => $quotes, 'guest_carts_expired' => $carts]]);
        $this->info("Expired {$quotes} quotes and {$carts} guest carts."); return self::SUCCESS;
    }
}
