"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function AuthError({ reset }: { reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <ErrorState
          title="Sign-in service unavailable"
          message="The application could not contact the sign-in service. Check your connection and try again."
          onRetry={reset}
        />
      </div>
    </main>
  );
}
