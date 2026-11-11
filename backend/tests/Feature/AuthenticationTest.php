<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_active_user_can_login_me_and_logout(): void
    {
        $user = User::factory()->create(['email' => 'active@example.test', 'password' => Hash::make('secret-password')]);
        Role::create(['name' => 'buyer']);

        $this->withHeaders(['Origin' => 'http://127.0.0.1:5173', 'Referer' => 'http://127.0.0.1:5173/'])->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'secret-password'])
            ->assertOk()->assertJsonPath('user.email', $user->email);
        $this->withHeaders(['Origin' => 'http://127.0.0.1:5173', 'Referer' => 'http://127.0.0.1:5173/'])->getJson('/api/auth/me')->assertOk()->assertJsonPath('user.id', $user->id);
        $this->withHeaders(['Origin' => 'http://127.0.0.1:5173', 'Referer' => 'http://127.0.0.1:5173/'])->postJson('/api/auth/logout')->assertOk();
    }

    public function test_inactive_user_cannot_login(): void
    {
        $user = User::factory()->create(['status' => 'inactive', 'password' => Hash::make('secret-password')]);
        $this->withHeaders(['Origin' => 'http://127.0.0.1:5173'])->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'secret-password'])
            ->assertStatus(422);
    }
}
