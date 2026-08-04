"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/shared/error-state";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="flex min-h-screen items-center justify-center bg-background p-4 text-foreground">
          <div className="w-full max-w-lg">
            <ErrorState
              title="Darman could not finish loading"
              message="Check your connection, then try again. If the app was just updated, reloading will fetch the latest version."
              onRetry={reset}
            />
          </div>
        </main>
      </body>
    </html>
  );
}
