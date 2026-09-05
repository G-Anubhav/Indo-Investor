# Profile Page

Route: `/profile`, inside the authenticated `(portal)` route group and protected by middleware plus `requirePortalAccess`.

## Displayed Information

- Member code, avatar initials, full/display name, verified email, mobile, language preference, role, account status and creation date.
- Current KYC status with a link to the secure KYC workspace.
- Password recovery entry and MFA management for server-confirmed executive/admin roles.

## Editable Fields

Only `full_name`, `display_name` and `mobile_phone` are editable from the profile form. `updateProfileAction` preserves the existing server-loaded language preference rather than accepting it from the form. Validation normalizes whitespace, bounds names and permits international E.164 mobile values. Errors are mapped to safe user messages.

Email, member code, role, status, sponsor, parent and placement are read-only. They are absent from the update payload. Existing column grants/RLS restrict updates to the authenticated user's row and permitted columns; genealogy protection separately makes member codes and placement immutable.

## Navigation And Responsive Behavior

Profile is available from the Account navigation, sidebar identity and top-right account menu on every portal page. The desktop page uses an overview/editor plus security/KYC side column. It becomes a single-column layout on tablet/mobile with stable form widths, visible focus states and reduced-motion support.
