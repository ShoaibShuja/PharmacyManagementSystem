import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Pill } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentAuthContext } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Sign In",
};

export default async function LoginPage() {
  const context = await getCurrentAuthContext();

  if (context?.profile.is_active) {
    redirect("/dashboard");
  }

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
          <LoginForm />
          <p className="mt-5 text-center text-xs text-muted-foreground">
            Staff accounts are created by the pharmacy administrator.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
