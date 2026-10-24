---
name: Institutional Trust Command
colors:
  surface: '#0b1322'
  surface-dim: '#0b1322'
  surface-bright: '#31394a'
  surface-container-lowest: '#060e1d'
  surface-container-low: '#141c2b'
  surface-container: '#18202f'
  surface-container-high: '#222a3a'
  surface-container-highest: '#2d3545'
  on-surface: '#dbe2f8'
  on-surface-variant: '#bbcac2'
  inverse-surface: '#dbe2f8'
  inverse-on-surface: '#293041'
  outline: '#85948d'
  outline-variant: '#3c4a44'
  surface-tint: '#47deb2'
  primary: '#e7fff3'
  on-primary: '#00382a'
  primary-container: '#63f5c8'
  on-primary-container: '#006e55'
  inverse-primary: '#006c53'
  secondary: '#97cbff'
  on-secondary: '#003353'
  secondary-container: '#0077ba'
  on-secondary-container: '#f5f8ff'
  tertiary: '#e7ffee'
  on-tertiary: '#003824'
  tertiary-container: '#58f7b3'
  on-tertiary-container: '#006f4a'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#69fbcd'
  primary-fixed-dim: '#47deb2'
  on-primary-fixed: '#002117'
  on-primary-fixed-variant: '#00513e'
  secondary-fixed: '#cee5ff'
  secondary-fixed-dim: '#97cbff'
  on-secondary-fixed: '#001d33'
  on-secondary-fixed-variant: '#004a76'
  tertiary-fixed: '#5ffdb9'
  tertiary-fixed-dim: '#39e09f'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#0b1322'
  on-background: '#dbe2f8'
  surface-variant: '#2d3545'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-xl:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.015em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system embodies high-assurance infrastructure, institutional cryptographic governance, and real-time security observability. Designed for protocol architects, enterprise risk officers, and infrastructure engineers, the visual tone conveys mathematical finality, technical precision, and absolute transparency.

The aesthetic fuses modern cybersecurity command ergonomics with institutional-grade minimalism. The environment prioritizes dense data clarity over decorative excess: midnight surfaces prevent visual exhaustion during extended monitoring sessions, razor-sharp geometric strokes define discrete operational containers, and electric mint micro-accents signify cryptographically intact states. Visual clutter is methodically stripped away to amplify situational awareness, alert triage speed, and audit trail fidelity.

## Colors

The palette establishes an authoritative hierarchy centered on deep canvas stratification and high-salience status signaling:

- **Canvas & Surface Architecture**:
  - `Canvas / Base`: `#080D18` (Deep midnight navy foundational background)
  - `Surface / Default`: `#101827` (Base operational cards and modular data containers)
  - `Surface / Elevated`: `#162235` (Flyouts, active popovers, overlays, and hovered structures)
  - `Border / Hairline`: `#263449` (Structural dividers and low-contrast perimeter rules)

- **Accents & Telemetry**:
  - `Primary Accent`: `#63F5C8` (Electric mint, reserved for interactive focus, primary actions, and root-of-trust indicators)
  - `Secondary Accent`: `#65B8FF` (Ice blue, used for network telemetry, ingress/egress links, and query states)

- **Cryptographic State Tokens**:
  - `Status / Verified`: `#42E6A4` (Consensus verified, signature valid, merkle leaf authenticated)
  - `Status / Pending`: `#FFC857` (Epoch validation pending, quorum awaiting vote, queued tx)
  - `Status / Alert`: `#FF657A` (Tampered hash, revoked certificate, invariant breach, consensus failure)

- **Typography & Content Hierarchy**:
  - `Text / Primary`: `#F2F6FC` (Headings, active values, high-contrast metrics)
  - `Text / Secondary`: `#96A5BB` (Descriptions, passive labels, schema metadata)
  - `Text / Tertiary`: `#5E708A` (Inactive timestamps, disabled controls, non-critical offsets)

## Typography

The type scale strictly enforces utility, speed of comprehension, and structural compactness. 

- **Primary Interface (Inter)**: Headings and interface labels employ neutral tracking with medium and semi-bold weights to guarantee legibility against deep dark surfaces without halation. Micro labels (`label-sm`) leverage slight uppercase letter-spacing to clarify system states, metric categories, and protocol flags.
- **Machine & Cryptographic Data (JetBrains Mono)**: Decentralized Identifiers (DIDs), SHA-256 digests, block hashes, ECDSA public keys, and contract addresses must render strictly in monospaced styles (`code-md` or `code-sm`). Monospace numerals (`tnum`) must be enforced across all tabular balances, transaction latencies, and uptime percentages to eliminate horizontal jitter during live telemetry updates.

## Layout & Spacing

The layout model is governed by an enterprise 12-column responsive fluid grid designed for modular, multi-panel dashboard orchestration:

- **Desktop (1280px+)**: 12-column layout with 24px (`1.5rem`) gutters and 32px (`2rem`) screen margins. Sidebars for network routing or identity registries remain pinned at 280px fixed width, while analytical and stream modules resize dynamically.
- **Tablet (768px - 1279px)**: 8-column layout with 16px (`1rem`) gutters and 24px (`1.5rem`) margins. Multi-column metric cards stack into 2-by-2 arrangements.
- **Mobile (Below 768px)**: 4-column layout with 12px (`0.75rem`) gutters and 16px (`1rem`) margins. Cards, cryptographic trees, and log feeds flatten to single-column vertical sequences.

Vertical rhythm is governed by a strict 4px base increment. Padding inside metric cards and logs adheres to `space-md` (16px), while grouped toolbar controls employ `space-sm` (8px) gaps. Section wrappers use `space-xl` (40px) to delineate isolated operational domains.

## Elevation & Depth

Depth is established via structural luminance stepping and razor-sharp border separation rather than heavy diffuse drop-shadows.

- **Level 0 (Canvas Base - `#080D18`)**: Deep root layer for background telemetry, non-interactive dead zones, and terminal backdrops.
- **Level 1 (Card & Module Layer - `#101827`)**: Bounded by a crisp 1px border (`#263449`). No drop-shadow is applied under static conditions.
- **Level 2 (Interactive Floating / Active Hover)**: Surface shifts to `#162235`. A subtle directed glow accentuates critical elements: `0 0 0 1px rgba(99, 245, 200, 0.25), 0 8px 24px rgba(0, 0, 0, 0.45)`.
- **Level 3 (Modals, Forensic Drawers, Command Palettes)**: Surface `#162235` backed by a 60% opacity `#080D18` backdrop blur (12px). Border increases to 1px `#65B8FF` at 30% alpha with an ambient shadow of `0 16px 40px rgba(0, 0, 0, 0.65)`.

## Shapes

The system enforces tight, industrial corner geometries (Soft: `0.25rem` / 4px base radius) to retain an analytical, developer-oriented demeanor.

- **Base Inputs, Buttons, & Micro Badges**: `0.25rem` (4px). Preserves linear rhythm across compact data rows and tabular toolbars.
- **Standard Structural Cards & Panels (`rounded-lg`)**: `0.5rem` (8px). Softens modular partitions without appearing informal or consumer-grade.
- **Floating Modals & Flyout Containers (`rounded-xl`)**: `0.75rem` (12px). Applied strictly to root overlay windows and inspector drawers.
- **Pills / Status Dots**: Circular geometry (`9999px`) is reserved exclusively for live-state indicator pulses and cryptographic consensus verification dots.

## Components

### Buttons
- **Primary Action**: Solid Electric Mint background (`#63F5C8`), `#080D18` bold typography. Hover state introduces subtle brightness elevation and a tight mint bloom (`box-shadow: 0 0 16px rgba(99, 245, 200, 0.35)`).
- **Secondary / Outline**: Transparent fill, 1px `#263449` border, `#F2F6FC` text. On hover, background shifts to `#162235` and border shifts to `#65B8FF`.
- **Destructive / Revoke**: Background tinted `#FF657A` at 10% opacity, border 1px `#FF657A` at 30%, text `#FF657A`. Hover triggers full solid fill with `#080D18` text.

### Badges & Status Chips
- Height: 22px. Padding: 0 8px. Font: `label-sm`.
- **Verified**: Background `rgba(66, 230, 164, 0.12)`, text `#42E6A4`, border `1px solid rgba(66, 230, 164, 0.24)`. Contains a 6px solid green dot.
- **Pending**: Background `rgba(255, 200, 87, 0.12)`, text `#FFC857`, border `1px solid rgba(255, 200, 87, 0.24)`.
- **Tampered / Revoked**: Background `rgba(255, 101, 122, 0.12)`, text `#FF657A`, border `1px solid rgba(255, 101, 122, 0.28)`.

### Cards & Modules
- Background `#101827`, 1px border `#263449`, 4px radius. 
- Headers feature a bottom divider line `#263449` and 16px padding. 
- Integrated metric widgets embed an upper-right monospace delta indicator and a top border highlight (1px `#63F5C8` at 60% opacity) when displaying critical real-time nodes.

### Form Inputs & Hash Query Fields
- Background `#080D18`, border 1px `#263449`, text `#F2F6FC`, font `code-md` for identifiers.
- Focus: Border shifts to `#63F5C8` with an interior glow `0 0 0 1px #63F5C8`. Placeholder text `#5E708A`.
- Suffix slots support integrated "Copy Hash" icon buttons and "Verified Schema" check indicators.

### Checkboxes & Radios
- Size: 16x16px square (2px radius for checkboxes; circular for radios).
- Inactive: `#080D18` fill, 1px `#263449` border.
- Active: `#63F5C8` fill, `#080D18` checkmark glyph.

### Specialized Infrastructure Components
- **Cryptographic Hash Renderer**: Truncates 64-character hashes to 8+8 (`0x7f2a...89a1`), styling the prefix in `#65B8FF` and mid-string ellipsis in `#5E708A`. Clicking triggers an instant inline tooltip transition from `#96A5BB` to `#63F5C8` ("COPIED").
- **Audit Trail Log Feed**: Alternating row tinting (`transparent` vs `rgba(22, 34, 53, 0.4)`), fixed monospace timestamps in `#5E708A`, and color-coded event labels aligned to a strict 12px baseline grid.