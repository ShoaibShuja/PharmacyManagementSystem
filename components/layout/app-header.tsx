import { CircleUserRound } from "lucide-react";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-2">
        <MobileNavigation />
        <p className="text-sm text-muted-foreground">
          Single-branch pharmacy workspace
        </p>
      </div>
      <Button variant="ghost" className="gap-2" aria-label="Open user menu">
        <CircleUserRound className="size-5" />
        <span className="hidden sm:inline">Admin</span>
      </Button>
    </header>
  );
}
