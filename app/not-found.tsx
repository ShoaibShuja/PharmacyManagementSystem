import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4 text-foreground">
      <section className="w-full max-w-lg rounded-xl border bg-card p-8 text-center">
        <p className="text-sm font-medium text-primary">Page not found</p>
        <h1 className="mt-2 text-2xl font-semibold">This page is unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The address may be outdated. Return to Darman to open the correct page for your account.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Return to Darman</Link>
        </Button>
      </section>
    </main>
  );
}
