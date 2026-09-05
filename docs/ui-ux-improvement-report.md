# Portal UI/UX Improvement Report

## Problems And Changes

| Previous issue | Change | Affected implementation |
| --- | --- | --- |
| Sidebar used a visible nested scroll area | compact grouped information architecture; desktop sidebar/nav fit viewport with hidden overflow; mobile uses a scrollbar-hidden off-canvas drawer | `PortalShell.jsx`, `PortalShell.module.css` |
| Wallets/earnings/payments/KYC inherited marketing chrome | centralized route classification covers every authenticated prefix; `(portal)` layout remains the sole portal shell | `SiteChrome.jsx`, `routes.mjs`, layout test |
| No account-management workspace | secure CRM-style profile overview/editor, account/security/KYC panels and member-code display | `/profile`, profile action/validation/styles |
| Basic header/navigation | sticky contextual top bar, outside-dismissable account popover, grouped role-aware navigation and nested active states | `PortalShell` |
| Inconsistent operational surfaces | shared neutral surface/shadow/radius/status tokens with selective blue/green/coral gradients and faster hover/focus states | portal, Financial, KYC, NetworkTree and PlotGrid CSS |
| Blank route transitions | shared responsive skeleton route loading state with reduced-motion fallback | `(portal)/loading.js` |

## Design Decisions

Inter remains portal-wide. The palette combines neutral blue-gray workspace surfaces with controlled blue, emerald, coral and violet accents. Neumorphic depth is retained but tightened with borders and restrained shadows. Gradients are reserved for profile identity, selected navigation and summary emphasis. Existing React Icons and CSS are used; no UI/animation dependency was added.

## Responsive And Accessible Behavior

- Desktop: sticky 248px sidebar, no visible/nested scrollbar, contextual sticky top bar and bounded content width.
- Tablet/mobile: keyboard-accessible drawer, backdrop/Escape close, focusable close button, no horizontal page overflow, responsive forms/tables/dialogs, and a centered scrollable network canvas.
- Semantic links/buttons/forms, `aria-current`, menu expansion state, dialog semantics, visible focus states, text status labels and `prefers-reduced-motion` are retained or improved.

## Visual Verification

The dependency-free Chrome CDP harness authenticated as affiliate/admin and inspected dashboard, profile, network, referrals, network index, inventory, wallets, earnings, property payments, KYC, admin, admin financials and admin KYC across desktop and 390x844 mobile viewports. Every route reported no horizontal page overflow, no public footer, and a portal aside. It also verifies the homepage logo target, outside-click account-menu dismissal and network tooltip visibility.

## Skeuomorphic Refresh

The portal uses a brighter porcelain background with white paper surfaces, beveled borders, inset form controls and tactile button/card shadows. Sidebar navigation text is increased to 14px with a wider 270px desktop rail, while compact-height and mobile layouts retain stable fit. Language controls were removed from the authenticated header and profile form; the stored locale remains unchanged for compatibility.

## Authentication UI

Login and signup now share the same brighter skeuomorphic material system: a real office image anchors the desktop layout with the clickable brand logo placed directly on it, while the form uses a beveled white control surface, inset fields, tactile validation/password controls and a raised primary action. The redundant Back to website text link is removed. Mobile hides the media panel, retains a compact clickable logo and keeps the full form in a single scrollable column. Authentication language controls were removed; signup continues to submit the server-selected locale through its existing hidden value.

## September 2026 Interaction Pass

Historical Phase 4 KYC integration fixtures were removed from `network_nodes` and disabled while immutable KYC/audit evidence was retained. The hosted Phase 4 runner now performs the same cleanup after success or failure. Portal branding links to `/`, account details close on outside pointer interaction or Escape, the network tooltip has an isolated foreground stacking context, and the mobile tree centers the current root on initial render and root changes.

## September 2026 Compactness And Inventory Pass

The redundant chevron was removed from the sidebar profile link, while the top-bar chevron remains as the indicator for the actual account dropdown. Signup input/select controls are reduced from 48px to 40px with tighter section spacing. Operational actions across Profile, KYC, Financial, Phase 2 and Plot Grid surfaces use a smaller 0.78rem label and 38-39px control height.

Project inventory cards now expose real total/available plot counts, location icons, stronger hierarchy, varied restrained accents and compact directional actions. The project query loads status-only plot relations, avoiding fabricated summary data. Internal KYC `draft` remains the authoritative database state but is consistently presented as `In progress` in affiliate and executive interfaces.
