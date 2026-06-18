"use client";

import { useActionState } from "react";
import { CircleAlert, LoaderCircle } from "lucide-react";
import {
  loginAction,
  type LoginState,
} from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";

const initialState: LoginState = { error: null };

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-8 space-y-5">
      {state.error ? (
        <div
          role="alert"
          className="flex gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>{state.error}</p>
        </div>
      ) : null}
      <label className="block space-y-2 text-sm font-medium">
        Email address
        <input
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          disabled={isPending}
          className="h-10 w-full rounded-md border bg-background px-3 font-normal outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
        />
      </label>
      <label className="block space-y-2 text-sm font-medium">
        Password
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          disabled={isPending}
          className="h-10 w-full rounded-md border bg-background px-3 font-normal outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
        />
      </label>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <LoaderCircle className="size-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}
