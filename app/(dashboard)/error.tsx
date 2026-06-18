"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <ErrorState
      message="The page could not be loaded. Please try again."
      onRetry={reset}
    />
  );
}
