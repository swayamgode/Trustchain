# TrustChain — Design System

> A premium, clean institutional SaaS dashboard for decentralized credential issuance, verification, and trust infrastructure.
>
> **Visual direction:** light, editorial, precise, quietly futuristic. Use the supplied TrustChain dashboard reference as the visual north star.

---

## 1. Design Principles

- **Clarity before decoration:** users should understand the next action and system state immediately.
- **Trust through restraint:** use a neutral canvas, strong typography, clear statuses, and predictable interaction patterns.
- **Action-oriented:** issuance and verification are the primary workflows; make them easy to discover.
- **Information density with breathing room:** show useful operational data without turning the dashboard into a wall of text.
- **Purposeful color:** lime is the signature accent; semantic colors communicate status, not decoration.
- **Consistent surfaces:** use subtle borders and low-contrast shadows instead of heavy gradients, glassmorphism, or excessive cards.

## 2. Visual Language

The reference uses a warm near-white background, black/charcoal text, pale lime accents, rounded surfaces, and thin separators. The interface should feel polished and calm—not flashy or “AI-generated.”

### Color Tokens

```css
:root {
  /* Brand */
  --color-brand: #BEF52A;
  --color-brand-soft: #EFFBCB;
  --color-brand-hover: #A9DF16;
  --color-brand-ink: #172000;

  /* Neutral */
  --color-canvas: #F7F7F4;
  --color-surface: #FFFFFF;
  --color-surface-subtle: #F2F3EF;
  --color-text: #101418;
  --color-text-secondary: #626971;
  --color-text-muted: #8A9097;
  --color-border: #E8E9E5;
  --color-border-strong: #D9DCD5;

  /* Semantic */
  --color-success: #159447;
  --color-success-soft: #E8F8E8;
  --color-warning: #B95B12;
  --color-warning-soft: #FFF0DE;
  --color-danger: #C0392B;
  --color-danger-soft: #FDEAE7;
  --color-info: #1764C0;
  --color-info-soft: #E6F2FC;

  /* Dark action surface */
  --color-ink: #111410;
  --color-ink-muted: #282C27;
}
```

**Color usage**
- Use `--color-brand` for active navigation indicators, small icon backplates, key action accents, and selected states.
- Keep large page areas neutral. Do not use lime as a full-page background.
- Use semantic colors with pale backgrounds for badges and alerts.
- Keep body copy charcoal rather than pure black.
- Avoid purple-blue gradients, neon glows, rainbow accents, and unnecessary gradients.

## 3. Typography

Use **Plus Jakarta Sans** for the interface. It has a modern, confident shape that works well for institutional software.

```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

:root {
  --font-sans: 'Plus Jakarta Sans', Inter, ui-sans-serif, system-ui, sans-serif;
}

body {
  font-family: var(--font-sans);
  color: var(--color-text);
  font-size: 14px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}
```

| Style | Size | Weight | Usage |
|---|---:|---:|---|
| Page heading | 32px | 700–800 | Institution name / page title |
| Section heading | 18px | 700 | Recent activity, pending actions |
| Card heading | 15px | 700 | Metric and panel labels |
| Body | 14px | 400–500 | Navigation, descriptions |
| Supporting | 12px | 400–500 | Timestamps, metadata |
| KPI number | 32px | 800 | Main dashboard metrics |

Use compact, readable headings. Avoid oversized marketing-style typography inside the admin product.

## 4. Layout & Grid

### Desktop shell
- Full viewport height application shell.
- Fixed left sidebar: **274px** wide.
- Top header: **74px** high, spanning the content area.
- Main content uses a flexible grid with a wide primary column and a narrower right rail.
- Main page padding: **30px**; grid gap: **20px**.
- Dashboard layout ratio: approximately **2.2fr / 1fr**.
- Allow the main content to scroll independently while sidebar navigation remains stable.

```css
.app-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 274px minmax(0, 1fr);
  background: var(--color-canvas);
}

.app-main {
  min-width: 0;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 2.2fr) minmax(290px, 1fr);
  gap: 20px;
}
```

### Responsive behavior
- **≥ 1280px:** full sidebar, top bar, two-column dashboard.
- **768–1279px:** compact/collapsible sidebar; right rail may move below primary content.
- **< 768px:** mobile navigation drawer, single-column content, horizontally scrollable KPI row where necessary, and stacked action cards.
- Never allow tables, long identifiers, or institution names to force the page wider than the viewport.

## 5. Spacing, Radius & Elevation

Use a consistent 4px spacing scale.

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;

  --shadow-card: 0 2px 12px rgba(16, 20, 24, 0.035);
  --shadow-popover: 0 12px 32px rgba(16, 20, 24, 0.12);
}
```

- Cards: 14–16px radius, 1px border, barely visible shadow.
- Buttons and inputs: 10–12px radius.
- Large panels: 16px radius.
- Use shadows only to distinguish elevation; avoid thick outlines and dramatic drop shadows.
- Keep consistent internal card padding, generally 20–24px.

## 6. App Shell

### Sidebar
- White or warm-white background with a thin right border.
- Brand mark and TrustChain wordmark at the top.
- Navigation items: Overview, Verify Credential, Issue Credential, Credentials, Institutions, Revocation, Settings.
- Use simple outline icons, around 20px.
- Default nav item is transparent; active item has a pale lime background and a narrow lime indicator at the left.
- Navigation label: 14px medium.
- Keep a compact network-status / trust-infrastructure panel near the bottom.

### Top bar
- Height: 74px.
- Search field aligned left, with search icon, placeholder, and optional keyboard shortcut.
- Right side: notification control, institution switcher, user avatar/menu.
- Use thin separators between control groups.
- Keep the header calm and uncluttered.

## 7. Dashboard Page

### Welcome header
- Small greeting line, e.g. “Good morning,”.
- Institution name is the main heading.
- One short supporting sentence describing the dashboard.
- Optional institution campus image may sit behind or beside the greeting. If used:
  - use a real, relevant image with a soft fade into the neutral background;
  - keep text contrast strong;
  - do not let the image compete with the main actions;
  - avoid decorative slogans that obscure important UI.

### Primary actions
Two large horizontal action cards:
1. **Issue a Credential** — dark charcoal surface, lime outline icon, white title, muted supporting copy, arrow affordance.
2. **Verify a Credential** — white surface, neutral border, dark icon, dark title, muted supporting copy, arrow affordance.

The issue action is the primary CTA. Both cards should be fully clickable and have visible hover/focus states.

### KPI cards
Show four compact metric cards:
- Credentials Issued
- Credentials Verified
- Active Credentials
- Needs Attention

Each card includes:
- small icon in a pale semantic/brand tile;
- concise label;
- prominent numeric value;
- short trend or context line.

Do not use charts in every card. Avoid arbitrary metrics or invented data in production; values should come from the backend.

### Recent Activity
A wide panel containing:
- panel title and one-line description;
- “View all” action;
- rows with status icon, activity title, entity / metadata, timestamp, status badge, and overflow menu.

Rows should have subtle dividers. Use short descriptions and truncate long identifiers with a tooltip or copy affordance. Status labels must be explicit: Verified, Issued, Under Review, Revoked, or Onboarded.

### Right rail

**Your Institution**
- Institution monogram or logo.
- Institution name and decentralized identifier.
- Copy-ID control.
- Key-value metadata: type, location, verification status, member since.
- “Manage” link/action.

**Pending Actions**
- Count badge.
- Clear rows for verification requests, revocation approvals, and institution requests.
- Each row has an icon, concise title, one-line explanation, and chevron.
- Make each row open the relevant review workflow.

**Network Status**
- Clear Healthy / Degraded / Offline state.
- Compact metrics such as connected institutions, uptime, and average latency.
- Use semantic status color and accessible text; do not rely on color alone.

## 8. Components

### Buttons
- Primary: charcoal background, white text; lime accent may be used for icon.
- Secondary: white background, neutral border.
- Tertiary: text-only, minimal.
- Destructive: semantic red, reserved for revoke/delete actions.
- Height: 40–44px; compact control height: 36px.
- Include hover, focus-visible, disabled, and loading states.

### Inputs & Search
- White or subtle neutral surface.
- 1px neutral border.
- Search icon inside the field.
- Focus: brand-colored border or subtle ring, not a large glow.
- Keep placeholder text muted and labels visible where needed.

### Cards
- White surface.
- Border: `--color-border`.
- Radius: `--radius-lg`.
- Padding: 20–24px.
- Use consistent title placement and content spacing.

### Status badges
- Small rounded pill, with concise label.
- Verified / Healthy: green.
- Issued / Onboarded: blue.
- Under Review / Pending: amber.
- Revoked / Failed: red.
- Use pale tinted backgrounds and readable text.

### Icons
Use a consistent outline icon family such as Lucide. Typical size:
- 16px for inline metadata;
- 18–20px for navigation and controls;
- 22–24px for card icon tiles.
Avoid mixing filled, outline, and 3D icon styles.

## 9. Interaction & Motion

Motion should communicate state and improve orientation—not act as decoration.

- Hover transitions: **140–200ms**, ease-out.
- Buttons: subtle background shift and 1px lift at most.
- Cards: subtle border/shadow change; avoid large scaling.
- Sidebar: active indicator transitions smoothly.
- Dropdowns/popovers: short fade + 4px vertical movement.
- Dialogs: fade with a small scale transition.
- Respect `prefers-reduced-motion: reduce`.

```css
.interactive {
  transition:
    background-color 160ms ease,
    border-color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;
}

.interactive:hover {
  transform: translateY(-1px);
}

.interactive:focus-visible {
  outline: 2px solid var(--color-brand-hover);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## 10. Accessibility

- Meet WCAG AA contrast for text and interactive elements.
- Provide keyboard navigation and visible focus indicators.
- Use semantic landmarks, buttons, links, headings, and tables.
- Add accessible labels to icon-only controls.
- Statuses must include text, not color alone.
- Ensure touch targets are at least 44×44px on mobile.
- Announce verification outcomes and asynchronous states to assistive technology.

## 11. Content & UX Rules

- Prefer short, direct labels: “Issue credential”, “Verify credential”, “Review request”.
- Use one-line supporting copy whenever possible.
- Avoid long explanatory paragraphs on the dashboard.
- Show the next action clearly when something needs attention.
- Use realistic, consistent sample data only in demo mode.
- Provide empty states with a concise explanation and a single next step.
- Confirm high-impact actions such as credential revocation.
- Distinguish pending, successful, failed, and expired verification states.

## 12. Avoid

- Overloaded dashboards with too many cards or charts.
- Large gradients, glassmorphism, glowing borders, or excessive blur.
- Random accent colors outside the defined semantic palette.
- Huge headings that push operational content below the fold.
- Long text blocks where a label, status, or action would be clearer.
- Decorative animations that delay user actions.
- Fake trust metrics or unclear security claims.

---

## Implementation Checklist

- [ ] Build a responsive app shell with sidebar and top bar.
- [ ] Define color, spacing, typography, radius, and shadow tokens as CSS variables.
- [ ] Create reusable `Button`, `Card`, `StatusBadge`, `MetricCard`, `ActivityRow`, and `SidebarItem` components.
- [ ] Make issue and verify credential the most visible actions.
- [ ] Use semantic status labels and accessible focus states.
- [ ] Keep the dashboard concise and data-driven.
- [ ] Test at desktop, tablet, and mobile widths.
- [ ] Respect reduced-motion preferences.
