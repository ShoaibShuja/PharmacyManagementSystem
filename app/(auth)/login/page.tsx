import { Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary p-2 text-primary-foreground">
              <Pill className="size-6" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Welcome back</h1>
              <p className="text-sm text-muted-foreground">
                Sign in to your pharmacy workspace
              </p>
            </div>
          </div>
          <form className="mt-8 space-y-5">
            <label className="block space-y-2 text-sm font-medium">
              Email address
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="h-10 w-full rounded-md border bg-background px-3 font-normal outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
            <label className="block space-y-2 text-sm font-medium">
              Password
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                className="h-10 w-full rounded-md border bg-background px-3 font-normal outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
            <Button type="button" className="w-full">
              Sign in
            </Button>
          </form>
          <p className="mt-5 text-center text-xs text-muted-foreground">
            Authentication will be connected after Supabase setup.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
