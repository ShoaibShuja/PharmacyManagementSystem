"use client";

import Link from "next/link";
import { CircleUserRound, LogOut, Settings } from "lucide-react";
import { logoutAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import type { UserProfile } from "@/lib/auth/types";
import { cn } from "@/lib/utils";

type AccountControlsProps = {
  profile: UserProfile;
  email: string;
  className?: string;
};

function formatRole(role: UserProfile["role"]) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export function AccountControls({
  profile,
  email,
  className,
}: AccountControlsProps) {
  const displayName = profile.full_name.trim() || email;
  const canAccessSettings = profile.role !== "cashier";

  return (
    <div className={cn("border-t border-border/80 p-4", className)}>
      <div className="rounded-xl border border-border/80 bg-muted/25 p-3 shadow-[0_10px_24px_-22px_oklch(0.25_0.08_165_/_0.7)]">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary ring-1 ring-inset ring-primary/15">
            <CircleUserRound className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{displayName}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {formatRole(profile.role)} account
            </p>
          </div>
        </div>

        <div className="mt-3 grid gap-2">
          {canAccessSettings ? (
            <Button asChild variant="outline" size="sm" className="bg-card">
              <Link href="/settings">
                <Settings className="size-4" />
                Settings
              </Link>
            </Button>
          ) : null}
          <form action={logoutAction}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="size-4" />
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
