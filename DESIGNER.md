# FoodOnlines Interface Rules

## Enterprise CMS page workflow (2026-07-18)

Keep the existing sidebar labels, order, dark-green surface, and orange active state exactly as the navigation foundation. Each content module opens a dedicated list workspace with title, count, search, advanced filters, sort, selection, bulk actions, export, responsive table, and pagination. A list page never renders a create or edit form beside its records.

Supported authoring modules open full-width `/create` and `/{id}/edit` pages. Forms use white rounded section cards, large desktop spacing, one-column mobile flow, 16px inputs, touch-safe actions, orange primary buttons, Save, Save & Continue, and lifecycle-safe Delete/Archive controls. Product Variants remain inside Product Edit. Category, brand, and product media remains selectable before first save and uses the same neutral provider-free uploader language.

Orders, returns, reviews, and support are created by their existing customer/commerce workflows, so admin supplies list and dedicated edit/operations pages without inventing fake Create screens. Tables scroll only inside their own responsive container; page-level horizontal overflow is prohibited. Nested admin routes must survive hard refresh without a white page.

## Brand country selector rule (2026-07-18)

Brand origin is selected through the existing form styling with a searchable country-name combobox. Show alphabetically ordered names in both the selector and brand list, support typing plus arrow/Enter/Escape keyboard interaction, and keep the two-letter ISO code internal. Do not expose a manual ISO-code field or change existing brand values.

## CMS deletion and pre-save media rule (2026-07-18)

Permanent item deletion uses the existing FoodOnlines visual language and a simple modal containing “Are you sure you want to permanently delete this item?” with only Cancel and Delete actions. Never require a name, slug, keyword, or danger input. Backend relationship and lifecycle safeguards remain authoritative.

Category, brand, and product editors must accept image selection before initial save. Show the local preview in the existing media card, allow replacement/removal, and upload automatically after the parent save succeeds. Do not expose temporary storage mechanics, add a save-first warning, alter the theme, or invent media fields for record types that do not have a supported media contract.

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
