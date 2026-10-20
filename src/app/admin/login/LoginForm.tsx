"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function LoginForm() {
  const [error, action, pending] = useActionState<string, FormData>(login, "");
  return (
    <form action={action} className="card grid gap-4">
      <h1 className="font-display text-2xl">Área do administrador</h1>
      <div>
        <label className="label" htmlFor="user">Usuário</label>
        <input id="user" name="user" className="input" autoComplete="username" required />
      </div>
      <div>
        <label className="label" htmlFor="password">Senha</label>
        <input id="password" name="password" type="password" className="input" autoComplete="current-password" required />
      </div>
      {error && <p className="font-bold text-orange-dark" role="alert">{error}</p>}
      <button className="btn btn-orange" disabled={pending}>{pending ? "Entrando..." : "Entrar"}</button>
    </form>
  );
}
