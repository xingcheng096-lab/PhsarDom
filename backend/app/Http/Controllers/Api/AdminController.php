<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use App\Models\KycSubmission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function kyc(Request $request): JsonResponse
    {
        return response()->json(KycSubmission::with(['business', 'documents', 'business.members'])->whereIn('status', ['Pending', 'Rejected'])->latest()->paginate(min($request->integer('per_page', 20), 100)));
    }
    public function users(Request $request): JsonResponse
    {
        $users = User::with('roles')->when($request->filled('search'), fn ($q) => $q->where(function ($q) use ($request) {
            $term = '%'.$request->string('search')->toString().'%';
            $q->where('name', 'ilike', $term)->orWhere('email', 'ilike', $term);
        }))->paginate(min($request->integer('per_page', 15), 100));
        return response()->json($users);
    }

    public function roles(): JsonResponse
    {
        return response()->json(Role::with('permissions')->orderBy('name')->get());
    }

    public function permissions(): JsonResponse
    {
        return response()->json(Permission::orderBy('name')->get());
    }

    public function assignRole(Request $request, User $user): JsonResponse
    {
        $data = $request->validate(['role' => ['required', 'string', 'exists:roles,name']]);
        $actor = $request->user();
        abort_if($actor->id === $user->id, 403, 'Self role changes are not allowed.');
        abort_if($data['role'] === 'super_admin' && ! $actor->hasRole('super_admin'), 403);
        $role = Role::where('name', $data['role'])->firstOrFail();
        if (! $user->roles()->whereKey($role->id)->exists()) {
            $user->roles()->attach($role);
            $this->recordAudit($actor, 'ROLE_ASSIGNED', 'User', $user->id, ['role' => $role->name]);
        }
        return response()->json(['user' => $user->fresh('roles')]);
    }

    public function revokeRole(Request $request, User $user, Role $role): JsonResponse
    {
        $actor = $request->user();
        DB::transaction(function () use ($actor, $user, $role) {
            $target = User::whereKey($user->id)->lockForUpdate()->firstOrFail();
            abort_if($actor->id === $target->id, 403, 'Self role changes are not allowed.');
            abort_if($role->name === 'super_admin' && ! $actor->hasRole('super_admin'), 403);
            if ($role->name === 'super_admin' && $target->hasRole('super_admin') && User::where('status', 'active')->whereHas('roles', fn ($q) => $q->where('name', 'super_admin'))->lockForUpdate()->count() <= 1) {
                abort(422, 'The last active Super Admin cannot be removed.');
            }
            $target->roles()->detach($role);
            $this->recordAudit($actor, 'ROLE_REVOKED', 'User', $target->id, ['role' => $role->name]);
        });
        return response()->json(['user' => $user->fresh('roles')]);
    }

    public function setStatus(Request $request, User $user): JsonResponse
    {
        $data = $request->validate(['status' => ['required', 'in:active,inactive']]);
        $actor = $request->user();
        abort_if($actor->id === $user->id && $data['status'] === 'inactive', 403, 'Self deactivation is not allowed.');
        if ($data['status'] === 'inactive' && $user->hasRole('super_admin') && User::where('status', 'active')->whereHas('roles', fn ($q) => $q->where('name', 'super_admin'))->count() <= 1) {
            abort(422, 'The last active Super Admin cannot be deactivated.');
        }
        $before = $user->status;
        $user->update(['status' => $data['status'], 'deactivated_at' => $data['status'] === 'inactive' ? now() : null]);
        $this->recordAudit($actor, 'USER_STATUS_CHANGED', 'User', $user->id, ['before' => $before, 'after' => $data['status']]);
        return response()->json(['user' => $user->fresh('roles')]);
    }

    public function attachPermission(Request $request, Role $role): JsonResponse
    {
        $data = $request->validate(['permission' => ['required', 'string', 'exists:permissions,name']]);
        $actor = $request->user();
        abort_if($role->name === 'super_admin' && ! $actor->hasRole('super_admin'), 403);
        $permission = Permission::where('name', $data['permission'])->firstOrFail();
        $role->permissions()->syncWithoutDetaching([$permission->id]);
        $this->recordAudit($actor, 'PERMISSION_ASSIGNED', 'Role', $role->id, ['permission' => $permission->name]);
        return response()->json(['role' => $role->fresh('permissions')]);
    }

    public function revokePermission(Request $request, Role $role, Permission $permission): JsonResponse
    {
        $actor = $request->user();
        abort_if($role->name === 'super_admin' && ! $actor->hasRole('super_admin'), 403);
        $role->permissions()->detach($permission);
        $this->recordAudit($actor, 'PERMISSION_REVOKED', 'Role', $role->id, ['permission' => $permission->name]);
        return response()->json(['role' => $role->fresh('permissions')]);
    }

    public function audit(Request $request): JsonResponse
    {
        $data = $request->validate([
            'actor_id' => ['nullable', 'integer', 'exists:users,id'],
            'action' => ['nullable', 'string', 'max:100'],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);
        $query = AuditLog::with('actor')->when(isset($data['actor_id']), fn ($q) => $q->where('actor_id', $data['actor_id']))
            ->when(isset($data['action']), fn ($q) => $q->where('action', $data['action']))
            ->when(isset($data['from']), fn ($q) => $q->where('created_at', '>=', $data['from']))
            ->when(isset($data['to']), fn ($q) => $q->where('created_at', '<=', $data['to']))->latest();
        return response()->json($query->paginate($data['per_page'] ?? 25));
    }

    private function recordAudit(User $actor, string $action, string $type, int $id, array $metadata = []): void
    {
        AuditLog::create(['actor_id' => $actor->id, 'action' => $action, 'entity_type' => $type, 'entity_id' => (string) $id, 'metadata' => $metadata]);
    }
}
