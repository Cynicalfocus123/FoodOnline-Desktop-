# FoodOnlines Interface Rules

## Managed media rule (2026-07-18)

Image availability is never a prerequisite for saving normal records. Use the shared managed-media control and neutral wording; never reveal provider names, credentials, buckets, disks, endpoints, server directories, signed URLs, or upload strategy. Preview returned persistent URLs, provide replace/remove actions, retain form state after failure, and use generic missing/broken-image artwork.

## Dynamic category rule (2026-07-18)

All administrator-created categories use the shared responsive tile, navigation, optional-section, and neutral missing-image treatment. Public placement communicates Published + Public; media connectivity is informational unless an upload attempt fails. Names wrap safely across desktop, tablet, iOS Safari, and Android Chrome without per-category components or CSS.

## PRODUCTION API AND BACKEND VISIBILITY RULE

The storefront and administrator application may communicate with private services internally, but technical integration details are never part of the production interface.

- Never display API URLs, hostnames, endpoint paths, backend folders, server addresses, environment names, database details, credentials, tokens, or storage configuration in customer or admin UI.
- Never render raw framework, PHP, SQL, server, authentication, exception, stack-trace, HTML, or JSON error output.
- Debugging banners, including any “API Target” or configuration panel, are prohibited in production.
- Send every failure shown to a user through the shared error-normalization layer. Keep useful field guidance such as required fields and valid email instructions, but replace technical failures with short, actionable messages.
- Use context-specific safe copy: “Unable to sign in. Check your email and password and try again.”, “Your session has expired. Please sign in again.”, “The service is temporarily unavailable. Please try again shortly.”, or “Something went wrong. Please try again.”
- Do not expose raw response bodies or sensitive details in the production console.
- This rule applies to every customer and administrator page, login, dashboard, form, modal, toast, notification, empty state, loading state, and error boundary.
- Before release, inspect the compiled production UI for debugging labels and visible technical information. Internal request configuration may remain in compiled code only when it cannot be rendered as interface content.

The production API configuration remains centralized and environment-driven; visual components must not import or display it.
