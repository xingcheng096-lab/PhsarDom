<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use App\Models\Role;
use App\Models\BuyerBusiness;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'legal_name' => ['required', 'string', 'max:255', 'unique:buyer_businesses,legal_name'],
            'registration_number' => ['nullable', 'string', 'max:100', 'unique:buyer_businesses,registration_number'],
            'country' => ['nullable', 'string', 'max:100'],
            'profile' => ['nullable', 'array'],
            'kyc_metadata' => ['required', 'array'],
        ]);

        $result = DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $data['password'],
                'status' => 'active',
            ]);
            $role = Role::firstOrCreate(['name' => 'buyer'], ['description' => 'Buyer business user']);
            $user->roles()->attach($role);
            $business = BuyerBusiness::create([
                'legal_name' => $data['legal_name'],
                'registration_number' => $data['registration_number'] ?? null,
                'country' => $data['country'] ?? 'Cambodia',
                'profile' => $data['profile'] ?? null,
                'status' => 'Pending',
            ]);
            $business->members()->attach($user, ['membership_role' => 'owner']);
            $kyc = $business->kycSubmissions()->create(['metadata' => $data['kyc_metadata'], 'status' => 'Pending']);
            AuditLog::create(['actor_id' => $user->id, 'action' => 'BUYER_REGISTERED', 'entity_type' => 'BuyerBusiness', 'entity_id' => (string) $business->id]);
            return compact('user', 'business', 'kyc');
        });

        Auth::login($result['user']);
        $request->session()->regenerate();
        return response()->json(['user' => $result['user']->load('roles'), 'business' => $result['business'], 'kyc' => $result['kyc']], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate(['email' => ['required', 'email'], 'password' => ['required', 'string']]);
        $key = strtolower($data['email']).'|'.$request->ip();
        if (RateLimiter::tooManyAttempts($key, 5)) {
            throw ValidationException::withMessages(['email' => 'Too many login attempts.']);
        }

        $user = User::where('email', $data['email'])->first();
        if (! $user || ! Hash::check($data['password'], $user->password) || ! $user->isActive()) {
            RateLimiter::hit($key, 60);
            throw ValidationException::withMessages(['email' => 'Invalid credentials or inactive account.']);
        }

        RateLimiter::clear($key);
        Auth::guard('web')->login($user);
        $request->session()->regenerate();
        $request->session()->save();
        AuditLog::create(['actor_id' => $user->id, 'action' => 'LOGIN', 'entity_type' => 'User', 'entity_id' => (string) $user->id]);
        return response()->json(['user' => $user->load(['roles', 'buyerBusinesses'])]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['user' => $request->user()->load(['roles', 'buyerBusinesses'])]);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        if ($user) {
            AuditLog::create(['actor_id' => $user->id, 'action' => 'LOGOUT', 'entity_type' => 'User', 'entity_id' => (string) $user->id]);
        }
        return response()->json(['message' => 'Logged out.']);
    }
}
