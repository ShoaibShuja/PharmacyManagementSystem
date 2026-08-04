type ErrorWithCode = {
  code?: unknown;
  message?: unknown;
};

export function getUserErrorMessage(
  error: unknown,
  fallback = "The action could not be completed.",
) {
  const details =
    typeof error === "object" && error !== null
      ? (error as ErrorWithCode)
      : null;
  const code = typeof details?.code === "string" ? details.code : "";
  const message =
    error instanceof Error
      ? error.message
      : typeof details?.message === "string"
        ? details.message
        : "";
  const normalized = message.toLowerCase();

  if (code === "23505" || normalized.includes("duplicate key")) {
    return "A record with the same unique value already exists.";
  }

  if (
    code === "42501" ||
    normalized.includes("row-level security") ||
    normalized.includes("permission denied")
  ) {
    return "Your role does not allow this action. Refresh the page or contact an Admin.";
  }

  if (
    normalized.includes("failed to fetch") ||
    normalized.includes("network") ||
    normalized.includes("load failed") ||
    normalized.includes("fetch failed") ||
    normalized.includes("timeout")
  ) {
    return "The server could not be reached. Check the connection and try again.";
  }

  return message || fallback;
}
