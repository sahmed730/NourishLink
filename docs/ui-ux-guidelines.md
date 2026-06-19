# NourishLink — UI/UX Guidelines

> **Version:** 1.0
> **Last Updated:** 2026-06-03
> **Status:** Active
> **Audience:** Designers, frontend engineers, AI agents

---

## 1. Document Purpose

Defines the **visual language** and **interaction patterns** for NourishLink's UI: color palette, typography, spacing, motion, voice, accessibility, and component behavior. This document is the source of truth for all design decisions.

For component structure: see [`frontend-design.md`](./frontend-design.md).
For data flow: see [`api-specification.md`](./api-specification.md).

---

## 2. Brand Pillars

| Pillar | Meaning |
|---|---|
| **Warm** | The product deals with food and care; design should feel humane. |
| **Trustworthy** | Audited, verified, transparent. |
| **Action-oriented** | Every screen has a clear next step. |
| **Light** | Visually airy; generous whitespace; no clutter. |

---

## 3. Color System

### 3.1 Tokens
Defined in `app/static/css/tokens.css` as CSS custom properties.

#### Brand
| Token | Value | Use |
|---|---|---|
| `--color-brand-50` | `#F1F8F2` | Background tints |
| `--color-brand-100` | `#D9EBDC` | Subtle highlights |
| `--color-brand-300` | `#82BC8A` | Hover, secondary |
| `--color-brand-500` | `#3D9A4E` | Primary actions |
| `--color-brand-600` | `#2F7A3D` | Primary hover |
| `--color-brand-700` | `#1F5A2C` | Text on light bg |

#### Accent (warm, used sparingly)
| Token | Value | Use |
|---|---|---|
| `--color-accent-500` | `#F4A03A` | CTAs that need attention, "donate" hot spots |
| `--color-accent-600` | `#D98015` | Accent hover |

#### Neutrals
| Token | Value | Use |
|---|---|---|
| `--color-neutral-0` | `#FFFFFF` | Surfaces |
| `--color-neutral-50` | `#FAFAF7` | Page bg |
| `--color-neutral-100` | `#F2F2EE` | Card bg alt |
| `--color-neutral-200` | `#E5E5E0` | Borders |
| `--color-neutral-400` | `#A8A89E` | Placeholder text |
| `--color-neutral-600` | `#5C5C55` | Body text |
| `--color-neutral-800` | `#26261F` | Headings |
| `--color-neutral-900` | `#0F0F0A` | Strongest text |

#### Status
| Token | Value | Maps to status |
|---|---|---|
| `--color-status-available` | `#3D9A4E` (brand 500) | available |
| `--color-status-matched` | `#3A7BD5` | matched |
| `--color-status-in-transit` | `#F4A03A` | in_transit |
| `--color-status-picked-up` | `#6F4FB8` | picked_up |
| `--color-status-expired` | `#7A7A70` (neutral 400) | expired |
| `--color-status-cancelled` | `#C5483B` | cancelled |

#### Feedback
| Token | Value | Use |
|---|---|---|
| `--color-success-500` | `#2F7A3D` | success toasts |
| `--color-warning-500` | `#D98015` | warning toasts |
| `--color-error-500` | `#C5483B` | error toasts, destructive |
| `--color-info-500` | `#3A7BD5` | info toasts |

### 3.2 Contrast Requirements
- Body text on white: ≥ 4.5:1 (use `neutral-600` or darker).
- Headings: ≥ 3:1.
- Buttons: text on bg ≥ 4.5:1.
- Status badges: text on bg ≥ 4.5:1; pair with icon for color-blind users.

---

## 4. Typography

### 4.1 Fonts
- **System font stack** (no web font download):
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
             "Helvetica Neue", Arial, "Noto Sans", sans-serif;
```
- **Mono** (for IDs, code):
```css
font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
```

### 4.2 Scale (modular, ratio 1.2)
| Token | Size | Use |
|---|---|---|
| `--font-size-xs` | 12px | Captions, badges |
| `--font-size-sm` | 14px | Helper text |
| `--font-size-base` | 16px | Body |
| `--font-size-md` | 18px | Subheadings |
| `--font-size-lg` | 22px | Section titles |
| `--font-size-xl` | 28px | Page titles |
| `--font-size-2xl` | 36px | Hero (mobile) |
| `--font-size-3xl` | 48px | Hero (desktop) |

### 4.3 Weights
| Token | Value | Use |
|---|---|---|
| `--font-weight-regular` | 400 | Body |
| `--font-weight-medium` | 500 | Subheadings, buttons |
| `--font-weight-bold` | 700 | Headings, strong emphasis |

### 4.4 Line Height
- Body: 1.5
- Headings: 1.2
- Tight (badges, buttons): 1.0–1.2

---

## 5. Spacing

4-pt grid. Tokens:
| Token | Value |
|---|---|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 20px |
| `--space-6` | 24px |
| `--space-8` | 32px |
| `--space-10` | 40px |
| `--space-12` | 48px |
| `--space-16` | 64px |
| `--space-20` | 80px |

Use spacing for: padding, margin, gap, section separation. Avoid arbitrary values.

---

## 6. Layout

### 6.1 Breakpoints
| Name | Min-width | Use |
|---|---|---|
| `sm` | 360px | Mobile baseline |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Wide |

### 6.2 Container
- Max-width: `1200px` for dashboards, `960px` for forms.
- Padding: `space-4` on mobile, `space-6` on desktop.

### 6.3 Grid
- Mobile: 1 column.
- Tablet: 12-col with 8px gap; 6-6 or 4-8 split common.
- Desktop: 12-col with 16px gap; 3-9 or 4-8 split common.

---

## 7. Elevation (Shadows)

| Token | Value | Use |
|---|---|---|
| `--shadow-xs` | `0 1px 2px rgba(0,0,0,0.04)` | Subtle border replacement |
| `--shadow-sm` | `0 2px 4px rgba(0,0,0,0.06)` | Cards at rest |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.08)` | Hover, dropdowns |
| `--shadow-lg` | `0 8px 24px rgba(0,0,0,0.12)` | Modals, popovers |

Avoid harsh shadows; keep them diffuse.

---

## 8. Radius

| Token | Value | Use |
|---|---|---|
| `--radius-sm` | `4px` | Tags, small chips |
| `--radius-md` | `8px` | Inputs, buttons |
| `--radius-lg` | `12px` | Cards |
| `--radius-pill` | `999px` | Avatars, badges |

---

## 9. Iconography

- Inline SVG, currentColor.
- 16/20/24 px sizes.
- Stroke-based (line icons), 1.5px stroke.
- Status icons used WITH status text, never alone.
- Icon set suggestions: Lucide (open source, MIT) — copy-paste the SVGs.

### 9.1 Icon Catalog (sample)
- Home, Restaurant, NGO, Box (donation), Truck, Map, Calendar, User, Bell, Check, X, Plus, Arrow, Filter, Search, Settings, Logout.

---

## 10. Motion

### 10.1 Principles
- **Purposeful:** motion supports comprehension (e.g., slide-in toast).
- **Fast:** ≤ 200ms for most transitions; 300ms for entrances.
- **Respectful:** honor `prefers-reduced-motion`.

### 10.2 Easings
- `--ease-out: cubic-bezier(0, 0, 0.2, 1)` — for entering elements.
- `--ease-in: cubic-bezier(0.4, 0, 1, 1)` — for leaving.

### 10.3 Durations
| Token | Value | Use |
|---|---|---|
| `--duration-fast` | 100ms | Hover |
| `--duration-base` | 200ms | State changes |
| `--duration-slow` | 300ms | Modals, drawers |

### 10.4 Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```

---

## 11. Voice & Tone

### 11.1 Personality
Warm, plain-spoken, action-oriented. We speak like a helpful colleague, not a corporation.

### 11.2 Guidelines
- **Use active verbs:** "Post a donation" not "A donation can be posted."
- **Be specific:** "8.5 kg of cooked food" not "Some surplus."
- **Avoid jargon:** no "stakeholders," "leverage," "synergy."
- **Show impact:** prefer "3,400 meals served" to "high impact."
- **Be brief:** aim for 1 sentence per UI message; never more than 2.

### 11.3 Empty / Error / Success Copy

| State | Example |
|---|---|
| Empty (donations) | "No donations yet. Your first one takes 30 seconds to post." |
| Error (network) | "Couldn't reach the server. Check your connection and retry." |
| Error (validation) | "Pickup window end must be after start." |
| Success (post) | "Donation posted! 3 NGOs notified." |
| Loading | "Finding the best matches…" |
| Confirmation (delete) | "Cancel this donation? This can't be undone." |

---

## 12. Accessibility (WCAG 2.1 AA)

### 12.1 Keyboard
- All interactive elements reachable via Tab.
- Focus order matches visual order.
- Modals trap focus; ESC closes.
- `Enter` submits forms; `Space` toggles checkboxes/buttons.
- Skip-to-main link at the top.

### 12.2 Focus
- Visible 2px outline: `outline: 2px solid var(--color-focus); outline-offset: 2px;`
- `--color-focus: #3A7BD5;` (high contrast on light and dark).

### 12.3 Forms
- Visible `<label>` for every input.
- `aria-required="true"` on required fields.
- `aria-invalid="true"` + `aria-describedby` linking to error text.
- Error icon + text (not color alone).

### 12.4 ARIA Landmarks
- `<header role="banner">` for app header.
- `<nav role="navigation" aria-label="Primary">` for bottom nav.
- `<main role="main" id="main">` for page content.
- `<footer role="contentinfo">` for footer.

### 12.5 Live Regions
- Toasts: `<div aria-live="polite" aria-atomic="true">`.
- Form errors: `aria-live="assertive"`.

### 12.6 Color Independence
- Status conveyed by text + icon, not color alone.
- Charts have patterns or labels.

---

## 13. Responsive Behavior

| Element | < 768px | ≥ 768px | ≥ 1024px |
|---|---|---|---|
| Header | logo + user menu | logo + nav + user menu | same |
| Nav | bottom 4-icon bar | sidebar | sidebar |
| Cards | 1 col, full-width | 2 col | 3 col |
| Tables | card stack | card stack | table |
| Maps | full-width, 60vh | 60% width | 50% width |
| Forms | full-width | max 480px | max 560px |

---

## 14. Donut Icons & Illustrations

- Line illustrations in `--color-brand-500` with `--color-neutral-200` accents.
- 1 stroke width throughout.
- Avoid photorealism; it feels corporate.
- For empty states, use the `empty-state.svg` illustration (a smiling plate).

---

## 15. Localization-Ready Strings

All user-facing copy lives in `app/static/js/i18n.js` (v1.1). For MVP, all strings inline in HTML. The `data-i18n` attribute marks translatable nodes (P1).

---

## 16. Content Guidelines

- Use real units: kg, km, minutes, hours — not vague "lots" or "nearby."
- Date format: locale-aware (`Intl.DateTimeFormat`).
- Number format: locale-aware (`Intl.NumberFormat`).
- Time format: 24h by default, switchable (P1).

---

## 17. Component Patterns

### 17.1 Button
- Min tap target: 44x44px (mobile a11y).
- Loading state: spinner + disabled + `aria-busy="true"`.
- Icon + label preferred over icon-only; icon-only needs `aria-label`.

### 17.2 Input
- Height: 44px.
- Label above (8px gap), never inside (placeholder is not a label).
- Helper text 4px below input.
- Error replaces helper; both share the same DOM space to avoid layout shift.

### 17.3 Card
- White bg, `--radius-lg`, `--shadow-sm`.
- Padding `space-4` mobile, `space-6` desktop.
- Action area at bottom, separated by hairline border on neutral-200.

### 17.4 Modal
- Centered, max-width `480px`.
- Backdrop: `rgba(0,0,0,0.4)`.
- Trap focus, ESC to close.
- On close, focus returns to opener.

### 17.5 Toast
- Bottom (mobile) / top-right (desktop).
- 4s default; persistent for errors until dismissed.
- Pause on hover.

---

## 18. Animation Catalogue

| Element | Animation | Duration | Easing |
|---|---|---|---|
| Toast in | slide up + fade | 200ms | ease-out |
| Toast out | slide down + fade | 200ms | ease-in |
| Modal in | scale 0.95→1, fade | 200ms | ease-out |
| Modal out | scale 1→0.95, fade | 150ms | ease-in |
| Skeleton | shimmer | 1500ms loop | linear |
| Counter (impact) | number tween | 1000ms | ease-out |

---

## 19. Design Review Checklist

- [ ] No emoji used as UI icons.
- [ ] No more than 2 type weights per screen.
- [ ] No more than 3 brand colors per screen.
- [ ] No horizontal scroll on 360px viewport.
- [ ] No content hidden behind hover-only on touch.
- [ ] No placeholder as label.
- [ ] No pure red/green status (use text+icon).
- [ ] No placeholder lorem ipsum in production.
- [ ] All images have alt text.
- [ ] All interactive elements have visible focus state.

---

## 20. References

- Material Design 3 — interaction patterns reference.
- GOV.UK Design System — form & error pattern reference.
- Inclusive Components by Heydon Pickering — accessible patterns.
- Leaflet.js docs — map UI patterns.

---

*End of ui-ux-guidelines.md*
