<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BuyerRegistrationApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_register_a_pending_buyer_business_and_kyc(): void
    {
        $response = $this->withHeaders(['Origin' => 'http://127.0.0.1:5173', 'Referer' => 'http://127.0.0.1:5173/'])->postJson('/api/auth/register', [
            'name' => 'Buyer Owner',
            'email' => 'owner@example.test',
            'password' => 'secret-password',
            'legal_name' => 'Owner Hospitality Co',
            'registration_number' => 'REG-OWNER-1',
            'profile' => ['industry' => 'Hospitality'],
            'kyc_metadata' => ['tax_id' => 'TAX-OWNER-1'],
        ]);

        $response->assertCreated()
            ->assertJsonPath('business.status', 'Pending')
            ->assertJsonPath('kyc.status', 'Pending')
            ->assertJsonPath('user.roles.0.name', 'buyer');
        $this->assertDatabaseHas('users', ['email' => 'owner@example.test']);
        $this->assertDatabaseHas('buyer_businesses', ['legal_name' => 'Owner Hospitality Co', 'status' => 'Pending']);
    }
}
