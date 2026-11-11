<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();
        $allowed = collect($roles)->flatMap(fn (string $role) => explode(',', $role))->filter()->values()->all();
        abort_unless($user && $user->isActive() && $user->roles()->whereIn('name', $allowed)->exists(), 403);
        return $next($request);
    }
}
