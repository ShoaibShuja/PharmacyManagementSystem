import Link from "next/link";
import { ShieldX } from "lucide-react";
import { logoutAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const messages: Record<string, string> = {
  inactive:
    "Your staff account is inactive. Ask the pharmacy administrator to restore access.",
  profile:
    "Your sign-in account does not have a valid staff profile. Ask the pharmacy administrator to check the database setup.",
  role: "Your role does not allow access to this page.",
};

export default async function UnauthorizedPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  const message =
    messages[reason ?? ""] ??
    "You do not have permission to access this page.";

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardContent className="p-8 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ShieldX className="size-6" />
          </div>
          <h1 className="mt-5 text-xl font-semibold">Access denied</h1>
          <p className="mt-2 text-sm text-muted-foreground">{message}</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            {reason === "role" ? (
              <Button asChild>
                <Link href="/dashboard">Return to dashboard</Link>
              </Button>
            ) : null}
            <form action={logoutAction}>
              <Button type="submit" variant="outline" className="w-full">
                Sign out
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
