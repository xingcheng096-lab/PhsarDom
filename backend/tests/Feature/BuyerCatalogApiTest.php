<?php
namespace Tests\Feature;
use App\Models\BuyerBusiness;
use App\Models\Category;
use App\Models\KycSubmission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
class BuyerCatalogApiTest extends TestCase
{
    use RefreshDatabase;
    public function test_authenticated_user_can_register_business_and_submit_kyc(): void
    {
        $user=User::factory()->create();$token=$user->createToken('test')->plainTextToken;
        $res=$this->withToken($token)->postJson('/api/buyer-businesses',['legal_name'=>'Atlas Test Co','registration_number'=>'REG-TEST-1','profile'=>['phone'=>'123']])->assertCreated();
        $id=$res->json('business.id');
        $this->withToken($token)->postJson("/api/buyer-businesses/$id/kyc",['metadata'=>['tax_id'=>'TAX-1'],'documents'=>[]])->assertCreated()->assertJsonPath('status','Pending');
        $this->assertDatabaseHas('buyer_businesses',['legal_name'=>'Atlas Test Co','status'=>'Pending']);
    }
    public function test_admin_can_review_kyc_and_public_catalog_is_paginated(): void
    {
        $admin=User::factory()->create();$admin->roles()->attach(Role::create(['name'=>'admin']));$business=BuyerBusiness::create(['legal_name'=>'Review Co','status'=>'Pending']);$business->members()->attach($admin,['membership_role'=>'owner']);$kyc=KycSubmission::create(['buyer_business_id'=>$business->id,'metadata'=>['tax_id'=>'TAX-2']]);
        $this->withToken($admin->createToken('test')->plainTextToken)->postJson("/api/kyc-submissions/{$kyc->id}/review",['status'=>'Approved'])->assertOk();
        Category::create(['name'=>'Office','slug'=>'office']);
        $this->getJson('/api/categories')->assertOk();
        $this->getJson('/api/products?per_page=1')->assertOk()->assertJsonStructure(['data','current_page']);
    }
}
