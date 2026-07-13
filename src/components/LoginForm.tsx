"use client";

import { useActionState } from "react";
import { loginStaff, type ActionResult } from "@/app/complaints/actions";

const initialState: ActionResult = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginStaff, initialState);

  return (
    <form action={formAction} className="login-form">
      <label className="field">
        <span>Email</span>
        <input
          type="email"
          name="email"
          autoComplete="username"
          required
          placeholder="staff@guptaradio.com"
        />
      </label>

      <label className="field">
        <span>Password</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
        />
      </label>

      {state.error ? <p className="form-error" role="alert">{state.error}</p> : null}

      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
