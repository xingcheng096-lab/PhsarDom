<?php

namespace Tests\Feature;

use App\Models\BuyerBusiness;
use App\Models\Category;
use App\Models\Product;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProcurementApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_approved_buyer_to_quotation_to_idempotent_po(): void
    {
        $buyer = User::factory()->create(); $admin = User::factory()->create();
        $buyerRole = Role::create(['name' => 'buyer']); $adminRole = Role::create(['name' => 'admin']);
        $buyer->roles()->attach($buyerRole); $admin->roles()->attach($adminRole);
        $business = BuyerBusiness::create(['legal_name' => 'Procurement Buyer', 'status' => 'Approved']); $business->members()->attach($buyer, ['membership_role' => 'owner']);
        $product = Product::create(['category_id' => Category::create(['name' => 'Test', 'slug' => 'test', 'is_active' => true])->id, 'sku' => 'PROC-1', 'name' => 'Procurement Product', 'status' => 'Published', 'moq' => 10, 'available_stock' => 100, 'unit' => 'unit']);
        Sanctum::actingAs($buyer);
        $rfq = $this->postJson('/api/rfqs', ['buyer_business_id' => $business->id, 'items' => [['product_id' => $product->id, 'quantity' => 10]]])->assertCreated();
        $rfqId = $rfq->json('id');
        $adminToken = $admin->createToken('procurement-admin')->plainTextToken;
        Auth::forgetGuards(); $quote = $this->withToken($adminToken)->postJson('/api/quotations', ['rfq_id' => $rfqId, 'items' => [['product_id' => $product->id, 'quantity' => 10, 'unit_price' => 12.50]]])->assertCreated();
        $quoteId = $quote->json('id');
        Auth::forgetGuards(); Sanctum::actingAs($buyer);
        $this->postJson("/api/quotations/$quoteId/accept")->assertCreated();
        $this->postJson("/api/quotations/$quoteId/accept")->assertOk();
        $this->assertDatabaseCount('purchase_orders', 1);
        $this->assertDatabaseHas('purchase_orders', ['quotation_id' => $quoteId, 'buyer_business_id' => $business->id]);
    }

    public function test_pending_buyer_and_below_moq_are_rejected(): void
    {
        $buyer = User::factory()->create(); $buyer->roles()->attach(Role::create(['name' => 'buyer']));
        $business = BuyerBusiness::create(['legal_name' => 'Pending Buyer', 'status' => 'Pending']); $business->members()->attach($buyer, ['membership_role' => 'owner']);
        $product = Product::create(['sku' => 'PROC-2', 'name' => 'MOQ Product', 'status' => 'Published', 'moq' => 10, 'available_stock' => 100, 'unit' => 'unit']);
        Auth::forgetGuards(); Sanctum::actingAs($buyer);
        $this->postJson('/api/rfqs', ['buyer_business_id' => $business->id, 'items' => [['product_id' => $product->id, 'quantity' => 10]]])->assertForbidden();
        $business->update(['status' => 'Approved']);
        $this->postJson('/api/rfqs', ['buyer_business_id' => $business->id, 'items' => [['product_id' => $product->id, 'quantity' => 9]]])->assertStatus(422);
        $this->assertDatabaseCount('rfqs', 0);
    }
}
