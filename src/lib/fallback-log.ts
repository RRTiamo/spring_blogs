interface ErrorLike {
  code?: string;
  message?: string;
  name?: string;
  status?: number;
  response?: { status?: number };
  cause?: unknown;
}

const globalLogState = globalThis as typeof globalThis & {
  __blogFallbackLogKeys?: Set<string>;
};

const seenKeys = globalLogState.__blogFallbackLogKeys ?? new Set<string>();
globalLogState.__blogFallbackLogKeys = seenKeys;

function getErrorLike(error: unknown) {
  return error && typeof error === "object" ? error as ErrorLike : {};
}

function isExpectedOfflineError(error: unknown) {
  const candidate = getErrorLike(error);
  const status = candidate.status ?? candidate.response?.status;
  const message = `${candidate.name || ""} ${candidate.code || ""} ${candidate.message || ""}`.toLowerCase();
  return (
    status === 502 ||
    status === 503 ||
    status === 504 ||
    message.includes("econnrefused") ||
    message.includes("fetch failed") ||
    message.includes("network error") ||
    message.includes("timeout") ||
    message.includes("aborted")
  );
}

export function reportUnexpectedFallback(key: string, label: string, error: unknown) {
  if (isExpectedOfflineError(error) || seenKeys.has(key)) return;
  seenKeys.add(key);
  const candidate = getErrorLike(error);
  const summary = candidate.message || candidate.code || "unknown error";
  console.warn(`${label}: ${summary}`);
}
