<?php

namespace Tests\Feature;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminSecurityTest extends TestCase
{
    use RefreshDatabase;

    private function userWithRole(string $role): User
    {
        $user = User::factory()->create();
        $user->roles()->attach(Role::create(['name' => $role]));
        return $user;
    }

    public function test_unauthorized_user_cannot_assign_roles(): void
    {
        $buyer = $this->userWithRole('buyer');
        $target = User::factory()->create();
        Role::create(['name' => 'sales']);
        $this->withToken($buyer->createToken('test')->plainTextToken)
            ->postJson("/api/admin/users/{$target->id}/roles", ['role' => 'sales'])
            ->assertForbidden();
    }

    public function test_admin_cannot_self_escalate(): void
    {
        $admin = $this->userWithRole('admin');
        Role::create(['name' => 'super_admin']);
        $this->withToken($admin->createToken('test')->plainTextToken)
            ->postJson("/api/admin/users/{$admin->id}/roles", ['role' => 'super_admin'])
            ->assertForbidden();
    }

    public function test_super_admin_can_deactivate_user_and_audit_is_created(): void
    {
        $admin = $this->userWithRole('super_admin');
        $target = User::factory()->create();
        $this->withToken($admin->createToken('test')->plainTextToken)
            ->patchJson("/api/admin/users/{$target->id}/status", ['status' => 'inactive'])
            ->assertOk();
        $this->assertDatabaseHas('audit_logs', ['action' => 'USER_STATUS_CHANGED', 'entity_id' => (string) $target->id]);
    }

    public function test_admin_can_assign_permission_to_role(): void
    {
        $admin = $this->userWithRole('admin');
        $role = Role::create(['name' => 'sales']);
        Permission::create(['name' => 'rfq.read']);
        $this->withToken($admin->createToken('test')->plainTextToken)
            ->postJson("/api/admin/roles/{$role->id}/permissions", ['permission' => 'rfq.read'])
            ->assertOk();
        $this->assertDatabaseHas('permission_role', ['role_id' => $role->id]);
    }

    public function test_authorized_permission_revocation_is_audited(): void
    {
        $admin = $this->userWithRole('admin');
        $role = Role::create(['name' => 'sales']);
        $permission = Permission::create(['name' => 'rfq.write']);
        $role->permissions()->attach($permission);
        $this->withToken($admin->createToken('test')->plainTextToken)
            ->deleteJson("/api/admin/roles/{$role->id}/permissions/{$permission->id}")
            ->assertOk();
        $this->assertDatabaseMissing('permission_role', ['role_id' => $role->id, 'permission_id' => $permission->id]);
        $this->assertDatabaseHas('audit_logs', ['action' => 'PERMISSION_REVOKED']);
    }

    public function test_buyer_cannot_revoke_permission(): void
    {
        $buyer = $this->userWithRole('buyer');
        $role = Role::create(['name' => 'sales']);
        $permission = Permission::create(['name' => 'rfq.read']);
        $this->withToken($buyer->createToken('test')->plainTextToken)
            ->deleteJson("/api/admin/roles/{$role->id}/permissions/{$permission->id}")
            ->assertForbidden();
    }

    public function test_last_super_admin_cannot_be_deactivated_or_demoted(): void
    {
        $admin = $this->userWithRole('super_admin');
        $token = $admin->createToken('test')->plainTextToken;
        $this->withToken($token)->patchJson("/api/admin/users/{$admin->id}/status", ['status' => 'inactive'])->assertForbidden();
        $this->withToken($token)->deleteJson("/api/admin/users/{$admin->id}/roles/{$admin->roles()->first()->id}")->assertForbidden();
    }

    public function test_audit_filters_and_unauthorized_access(): void
    {
        $admin = $this->userWithRole('admin');
        $buyer = $this->userWithRole('buyer');
        \App\Models\AuditLog::create(['actor_id' => $admin->id, 'action' => 'FILTER_ME', 'entity_type' => 'User', 'entity_id' => '1']);
        $this->withToken($admin->createToken('test')->plainTextToken)
            ->getJson('/api/admin/audit-logs?action=FILTER_ME&per_page=1')
            ->assertOk()->assertJsonPath('data.0.action', 'FILTER_ME');
        $this->assertFalse($buyer->fresh()->hasRole('admin'));
        $this->flushHeaders();
        Sanctum::actingAs($buyer);
        $this->getJson('/api/admin/audit-logs')->assertForbidden();
    }

    public function test_invalid_audit_filter_is_rejected(): void
    {
        $admin = $this->userWithRole('admin');
        $this->withToken($admin->createToken('test')->plainTextToken)
            ->getJson('/api/admin/audit-logs?from=not-a-date')->assertStatus(422);
    }
}
