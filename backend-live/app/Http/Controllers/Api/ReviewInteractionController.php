<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductReview;
use App\Services\Commerce\ReviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewInteractionController extends Controller
{
    public function helpful(Request $request, ProductReview $review, ReviewService $service): JsonResponse { $service->helpful($request->user(), $review); return response()->json(['message' => 'Helpful vote recorded.']); }
    public function removeHelpful(Request $request, ProductReview $review, ReviewService $service): JsonResponse { $service->helpful($request->user(), $review, true); return response()->json(['message' => 'Helpful vote removed.']); }
    public function report(Request $request, ProductReview $review, ReviewService $service): JsonResponse { $data = $request->validate(['reason_code' => ['required', 'in:spam,offensive,irrelevant,suspected_fake,personal_information,other'], 'details' => ['nullable', 'string', 'max:2000']]); $service->report($request->user(), $review, $data); return response()->json(['message' => 'Report received for moderation.'], 201); }
}
