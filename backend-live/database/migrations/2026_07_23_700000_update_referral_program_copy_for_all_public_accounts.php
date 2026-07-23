<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('referral_programs')
            ->where('referee_benefit_copy', 'New customers receive account-bound referral coupons after registering through an eligible invitation.')
            ->update(['referee_benefit_copy' => 'New Customer, Supplier, and Partner accounts receive account-bound referral coupons after registering through an eligible invitation.', 'updated_at' => now()]);
        DB::table('referral_programs')
            ->where('invite_page_copy', 'Create your account and receive a new-customer referral discount on qualifying orders.')
            ->update(['invite_page_copy' => 'Create a Customer, Supplier, or Partner account and receive an account-bound referral discount on qualifying orders.', 'updated_at' => now()]);
        DB::table('referral_programs')
            ->where('share_message', 'Join FoodOnlines using my referral link and receive a new-customer discount on qualifying orders. I may also receive a FoodOnlines referral reward.')
            ->update(['share_message' => 'Join FoodOnlines using my referral link and receive an account-bound discount on qualifying orders. I may also receive a FoodOnlines referral reward.', 'updated_at' => now()]);
        DB::table('referral_programs')
            ->where('terms_content', 'Referred friends must be new FoodOnlines customers and may have only one referrer. Referral coupons are account-bound and non-transferable. Rewards are issued only after qualifying orders are delivered and payment is collected. Minimum orders, deadlines, expiration, review, and revocation rules are controlled by the active program.')
            ->update(['terms_content' => 'New public accounts must be Customer, Supplier, or Partner accounts and may have only one referrer. Referral coupons are account-bound and non-transferable. Rewards are issued only after qualifying orders are delivered and payment is collected. Minimum orders, deadlines, expiration, review, and revocation rules are controlled by the active program.', 'updated_at' => now()]);
    }

    public function down(): void
    {
        // This forward product-scope correction intentionally preserves current program copy.
    }
};
