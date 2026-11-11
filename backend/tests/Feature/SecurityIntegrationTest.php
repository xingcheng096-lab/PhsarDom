<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

class SecurityIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withMiddleware();
    }

    public function test_cookie_csrf_flow_rejects_missing_and_invalid_tokens(): void
    {
        $user = User::factory()->create(['email' => 'csrf@example.test', 'password' => Hash::make('secret-password')]);
        $csrf = $this->get('/sanctum/csrf-cookie')->assertNoContent();
        $this->assertNotEmpty($csrf->headers->getCookies());
        $this->withHeaders(['Origin' => 'http://127.0.0.1:5173', 'Referer' => 'http://127.0.0.1:5173/'])
            ->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'secret-password'])
            ->assertStatus(419);
        $this->withHeaders(['Origin' => 'http://127.0.0.1:5173', 'Referer' => 'http://127.0.0.1:5173/', 'X-XSRF-TOKEN' => 'invalid-token'])
            ->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'secret-password'])
            ->assertStatus(419);
    }

    public function test_cors_headers_are_origin_scoped_and_preflight_is_supported(): void
    {
        $this->withHeader('Origin', 'http://localhost:5173')->options('/api/health', [
            'Access-Control-Request-Method' => 'GET',
            'Access-Control-Request-Headers' => 'X-XSRF-TOKEN, Content-Type',
        ])->assertOk()->assertHeader('Access-Control-Allow-Origin', 'http://localhost:5173')
            ->assertHeader('Access-Control-Allow-Credentials', 'true');
        $response = $this->flushHeaders()->withHeader('Origin', 'https://evil.example')->get('/api/health')->assertOk();
        $this->assertNotSame('https://evil.example', $response->headers->get('Access-Control-Allow-Origin'));
    }

    public function test_logout_invalidates_authenticated_session_and_inactive_user_is_denied(): void
    {
        $user = User::factory()->create(['password' => Hash::make('secret-password')]);
        $this->withHeaders(['Origin' => 'http://127.0.0.1:5173', 'Referer' => 'http://127.0.0.1:5173/'])->actingAs($user, 'web')->getJson('/api/auth/me')->assertOk();
        $this->withHeaders(['Origin' => 'http://127.0.0.1:5173', 'Referer' => 'http://127.0.0.1:5173/'])->actingAs($user, 'web')->postJson('/api/auth/logout')->assertOk();
        Auth::forgetGuards();
        $this->getJson('/api/auth/me')->assertUnauthorized();
        $user->update(['status' => 'inactive']);
        $this->actingAs($user, 'web')->getJson('/api/admin/ping')->assertForbidden();
    }

    public function test_audit_records_have_no_public_update_or_delete_routes(): void
    {
        $admin = User::factory()->create();
        $admin->roles()->attach(Role::create(['name' => 'admin']));
        $token = $admin->createToken('test')->plainTextToken;
        $this->withToken($token)->putJson('/api/admin/audit-logs/1', ['action' => 'tamper'])->assertNotFound();
        $this->withToken($token)->deleteJson('/api/admin/audit-logs/1')->assertNotFound();
        $this->withToken($token)->getJson('/api/admin/audit-logs')->assertOk();
    }

    public function test_database_identity_is_test_database(): void
    {
        $this->assertSame('phsardom_test', strtolower((string) \DB::selectOne('select current_database() as name')->name));
        $this->assertSame('testing', app()->environment());
    }
}
