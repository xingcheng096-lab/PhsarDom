<?php

namespace Database\Seeders;

use App\Models\BuyerBusiness;
use App\Models\Category;
use App\Models\KycSubmission;
use App\Models\Permission;
use App\Models\Product;
use App\Models\ProductPricingTier;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoBusinessSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment('local')) {
            $this->command?->warn('DemoBusinessSeeder is local-only. No records were changed.');
            return;
        }

        $adminPassword = env('DEMO_ADMIN_PASSWORD');
        $buyerPassword = env('DEMO_BUYER_PASSWORD');
        if (! $adminPassword || ! $buyerPassword) {
            throw new \RuntimeException('Set DEMO_ADMIN_PASSWORD and DEMO_BUYER_PASSWORD in the local environment before seeding demo data.');
        }

        $adminRole = Role::firstOrCreate(['name' => 'admin'], ['description' => 'Local demo administrator']);
        $buyerRole = Role::firstOrCreate(['name' => 'buyer'], ['description' => 'Local demo buyer']);
        $admin = User::firstOrCreate(['email' => env('DEMO_ADMIN_EMAIL', 'admin.demo@phsardom.local')], [
            'name' => 'PhsarDom Demo Admin', 'password' => Hash::make($adminPassword), 'status' => 'active',
        ]);
        $admin->update(['password' => Hash::make($adminPassword), 'status' => 'active']);
        $admin->roles()->syncWithoutDetaching([$adminRole->id]);

        $pendingUser = User::firstOrCreate(['email' => 'pending.buyer@phsardom.local'], [
            'name' => 'Pending Demo Buyer', 'password' => Hash::make($buyerPassword), 'status' => 'active',
        ]);
        $pendingUser->update(['password' => Hash::make($buyerPassword), 'status' => 'active']);
        $pendingUser->roles()->syncWithoutDetaching([$buyerRole->id]);
        $pending = BuyerBusiness::firstOrCreate(['legal_name' => 'PhsarDom Pending Demo Co'], ['status' => 'Pending', 'country' => 'Cambodia', 'profile' => ['demo' => true]]);
        $pending->members()->syncWithoutDetaching([$pendingUser->id => ['membership_role' => 'owner']]);
        KycSubmission::firstOrCreate(['buyer_business_id' => $pending->id, 'status' => 'Pending'], ['metadata' => ['demo' => true, 'tax_id' => 'DEMO-PENDING']]);

        $approvedUser = User::firstOrCreate(['email' => 'approved.buyer@phsardom.local'], [
            'name' => 'Approved Demo Buyer', 'password' => Hash::make($buyerPassword), 'status' => 'active',
        ]);
        $approvedUser->update(['password' => Hash::make($buyerPassword), 'status' => 'active']);
        $approvedUser->roles()->syncWithoutDetaching([$buyerRole->id]);
        $approved = BuyerBusiness::firstOrCreate(['legal_name' => 'PhsarDom Approved Demo Co'], ['status' => 'Approved', 'country' => 'Cambodia', 'profile' => ['demo' => true], 'approved_at' => now(), 'approved_by' => $admin->id]);
        $approved->members()->syncWithoutDetaching([$approvedUser->id => ['membership_role' => 'owner']]);
        KycSubmission::firstOrCreate(['buyer_business_id' => $approved->id, 'status' => 'Approved'], ['metadata' => ['demo' => true, 'tax_id' => 'DEMO-APPROVED'], 'reviewer_id' => $admin->id, 'reviewed_at' => now()]);

        foreach ([['name' => 'Packaging', 'slug' => 'packaging'], ['name' => 'Electronics', 'slug' => 'electronics']] as $categoryData) {
            $category = Category::firstOrCreate(['slug' => $categoryData['slug']], $categoryData + ['is_active' => true]);
            $product = Product::firstOrCreate(['sku' => 'DEMO-'.$categoryData['slug']], ['category_id' => $category->id, 'name' => $categoryData['name'].' Wholesale Item', 'description' => 'Local PhsarDom demonstration product.', 'status' => 'Published', 'moq' => 10, 'available_stock' => 500, 'unit' => 'unit']);
            ProductPricingTier::firstOrCreate(['product_id' => $product->id, 'minimum_quantity' => 10], ['maximum_quantity' => 99, 'unit_price' => 25.00]);
            ProductPricingTier::firstOrCreate(['product_id' => $product->id, 'minimum_quantity' => 100], ['maximum_quantity' => null, 'unit_price' => 22.50]);
        }
    }
}
