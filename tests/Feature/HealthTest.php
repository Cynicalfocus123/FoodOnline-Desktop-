<?php

namespace Tests\Feature;

use Tests\TestCase;

class HealthTest extends TestCase
{
    public function test_versioned_health_endpoint_is_available(): void
    {
        $this->getJson('/api/v1/health')
            ->assertOk()
            ->assertExactJson([
                'status' => 'ok',
                'service' => 'foodonlines-api',
            ]);
    }

    public function test_unknown_api_routes_return_safe_json(): void
    {
        $this->getJson('/api/v1/not-a-real-endpoint')
            ->assertNotFound()
            ->assertExactJson([
                'message' => 'API endpoint or resource not found.',
            ]);
    }

    public function test_production_frontend_origin_is_allowed_by_cors(): void
    {
        $this->withHeader('Origin', 'https://www.foodonlines.com')
            ->getJson('/api/v1/health')
            ->assertOk()
            ->assertHeader('Access-Control-Allow-Origin', 'https://www.foodonlines.com');
    }
}
