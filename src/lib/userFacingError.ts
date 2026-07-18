const technicalContentPatterns = [
  /https?:\/\//i,
  /\bwww\.[a-z0-9.-]+/i,
  /\/api\/v\d+(?:\/|\b)/i,
  /\b(?:api\s+(?:target|base)|(?:backend|server)\s+url|endpoint|sql(?:state|\s+error)|mysql|postgres(?:ql)?|laravel|php\s+error|stack\s+trace|traceback|exception)\b/i,
  /\b(?:app[_-]?key|db_(?:host|database|username|password)|aws_(?:access|secret)|r2_(?:access|secret|endpoint)|vite_api_base_url)\b/i,
  /\b(?:bearer token|authorization header|environment variable)\b/i,
  /(?:^|\s)[A-Za-z]:[\\/]/,
  /fil[e]:\/\//i,
  /\/home\/[A-Za-z0-9._-]+\//i,
  /\b(?:\d{1,3}\.){3}\d{1,3}\b/,
];

const rawDocumentPattern = /<(?:!doctype|html|head|body|script|style|pre)\b/i;
const rawJsonPattern = /^\s*[\[{][\s\S]*[\]}]\s*$/;

export type ApiFieldErrors = Record<string, string[]>;

export function sanitizeUserFacingMessage(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;

  const trimmed = value.replace(/\s+/g, " ").trim();
  if (!trimmed || trimmed.length > 240) return fallback;
  if (rawDocumentPattern.test(trimmed) || rawJsonPattern.test(trimmed)) return fallback;
  if (technicalContentPatterns.some((pattern) => pattern.test(trimmed))) return fallback;

  return trimmed;
}

export function sanitizeApiFieldErrors(value: unknown): ApiFieldErrors {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  const sanitized: ApiFieldErrors = {};
  for (const [field, messages] of Object.entries(value)) {
    if (!Array.isArray(messages)) continue;
    const safeMessages = messages
      .map((message) => sanitizeUserFacingMessage(message, "Please check this field."))
      .filter((message, index, values) => message && values.indexOf(message) === index)
      .slice(0, 3);
    if (safeMessages.length) sanitized[field] = safeMessages;
  }

  return sanitized;
}

export function safeApiStatusMessage(status: number, message: unknown, fieldErrors: ApiFieldErrors) {
  const firstFieldMessage = Object.values(fieldErrors).flat()[0];

  if (status === 0) return "Unable to connect right now. Please check your connection and try again.";
  if (status === 401) return "Your session has expired. Please sign in again.";
  if (status === 403) return "You do not have permission to perform this action.";
  if (status === 404) return "The requested information could not be found.";
  if (status === 408) return "The request took too long. Please try again.";
  if (status === 429) return "Too many attempts. Please wait a moment and try again.";
  if (status >= 500) return "The service is temporarily unavailable. Please try again shortly.";

  const fallback = status === 422
    ? firstFieldMessage ?? "Please check the highlighted fields and try again."
    : "The request could not be completed. Please try again.";

  return sanitizeUserFacingMessage(message, fallback);
}

export function toUserFacingErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    return sanitizeUserFacingMessage(error.message, fallback);
  }

  return fallback;
}
