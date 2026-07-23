<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ReferralProgram;
use App\Services\Referral\ReferralCodeService;
use App\Services\Referral\ReferralSchema;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReferralInvitationController extends Controller
{
    public function __invoke(Request $request, string $referralCode, ReferralCodeService $codes, ReferralSchema $schema): JsonResponse
    {
        if (! $schema->isReady()) {
            return $schema->unavailableResponse($request);
        }

        $program = ReferralProgram::active();
        $code = $program ? $codes->findActive($referralCode) : null;

        if (! $program || ! $code || ! $code->user || ! $codes->isEligible($code->user)) {
            return response()->json(['valid' => false, 'message' => 'This invitation is not available.'], 404);
        }

        return response()->json([
            'valid' => true,
            'referral_code' => $code->code,
            'program' => [
                'heading' => $program->invite_page_heading ?: 'You have been invited to FoodOnlines',
                'copy' => $program->invite_page_copy,
                'referee_benefit_title' => $program->referee_benefit_title,
                'referee_benefit_copy' => $program->referee_benefit_copy,
                'terms_content' => $program->terms_content,
            ],
        ]);
    }
}
