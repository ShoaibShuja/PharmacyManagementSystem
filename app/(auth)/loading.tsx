import { LoaderCircle } from "lucide-react";

export default function AuthLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <LoaderCircle className="size-5 animate-spin" />
        Checking your session...
      </div>
    </main>
  );
}
