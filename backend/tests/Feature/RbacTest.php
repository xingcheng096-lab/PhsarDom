<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RbacTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_role_can_access_protected_endpoint(): void
    {
        $role = Role::create(['name' => 'admin']);
        $user = User::factory()->create();
        $user->roles()->attach($role);

        $this->assertTrue($user->fresh()->hasRole('admin'));
        $this->assertTrue($user->fresh()->isActive());
        $token = $user->createToken('test')->plainTextToken;
        $this->withToken($token)->getJson('/api/admin/ping')->assertOk();
    }

    public function test_buyer_role_is_denied_admin_endpoint(): void
    {
        $role = Role::create(['name' => 'buyer']);
        $user = User::factory()->create();
        $user->roles()->attach($role);

        $token = $user->createToken('test')->plainTextToken;
        $this->withToken($token)->getJson('/api/admin/ping')->assertForbidden();
    }
}
