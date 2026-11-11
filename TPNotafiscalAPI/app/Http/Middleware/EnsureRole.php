<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Nível de acesso por papel (role).
 *
 * Uso nas rotas: ->middleware('role:admin')
 * Um usuário só passa se o campo `role` dele estiver na lista aceita.
 * Resposta para quem não tem o nível: 403 (autenticado, mas sem permissão).
 */
class EnsureRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user || !in_array($user->role, $roles, true)) {
            return response()->json([
                'message' => 'Acesso negado: seu nível de acesso não permite esta ação.',
            ], 403);
        }

        return $next($request);
    }
}
