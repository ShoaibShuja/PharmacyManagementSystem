import { CircleUserRound, LogOut } from "lucide-react";
import { logoutAction } from "@/app/(auth)/actions";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { GlobalSearch } from "@/components/search/global-search";
import { Button } from "@/components/ui/button";
import type { UserProfile } from "@/lib/auth/types";

function formatRole(role: UserProfile["role"]) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export function AppHeader({
  profile,
  email,
}: {
  profile: UserProfile;
  email: string;
}) {
  const displayName = profile.full_name.trim() || email;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <MobileNavigation role={profile.role} />
        <p className="hidden text-sm text-muted-foreground xl:block">
          Single-branch pharmacy workspace
        </p>
      </div>
      <div className="flex items-center gap-2">
        <GlobalSearch role={profile.role} />
        <div className="hidden text-right sm:block">
          <p className="max-w-48 truncate text-sm font-medium">{displayName}</p>
          <p className="text-xs text-muted-foreground">
            {formatRole(profile.role)}
          </p>
        </div>
        <CircleUserRound className="size-6 text-muted-foreground" />
        <form action={logoutAction}>
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="size-4" />
          </Button>
        </form>
      </div>
    </header>
  );
}
