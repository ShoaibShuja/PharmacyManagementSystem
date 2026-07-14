import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { GlobalSearch } from "@/components/search/global-search";
import type { UserProfile } from "@/lib/auth/types";

export function AppHeader({
  profile,
  email,
}: {
  profile: UserProfile;
  email: string;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <MobileNavigation profile={profile} email={email} />
        <p className="hidden text-sm text-muted-foreground xl:block">
          Single-branch pharmacy workspace
        </p>
      </div>
      <div className="flex items-center gap-2">
        <GlobalSearch role={profile.role} />
        <ThemeToggle />
      </div>
    </header>
  );
}
