# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Organizer
**Generated:** 2026-01-24 14:20:00
**Category:** Modern SaaS / Dark Mode Productivity

---

## Global Rules

### Color Palette (Dark Theme Base)

| Role            | Hex                               | CSS Variable       |
| --------------- | --------------------------------- | ------------------ |
| Page Background | `#202124`                         | `--surface-page`   |
| Card Background | `#1A1B1E`                         | `--surface-card`   |
| Primary Accent  | User Defined (Default: `#4285F4`) | `--action-primary` |
| Text Primary    | `#FFFFFF`                         | `--text-primary`   |
| Text Secondary  | `#9AA0A6`                         | `--text-secondary` |
| Success         | `#34A853`                         | `--status-success` |
| Warning         | `#F9AB00`                         | `--status-warning` |
| Error           | `#EA4335`                         | `--status-error`   |

**Color Notes:** High contrast dark mode with vibrant interactive accents.

### Typography

- **Font Family:** 'Lexend', sans-serif
- **Icon Set:** Material Symbols Outlined
- **Mood:** Clean, modern, geometric, legible, friendly
- **Google Fonts:** [Lexend](https://fonts.google.com/specimen/Lexend)

### Spacing & Layout

- **Border Radius:** `24px` (Cards/Modals), `100px` (Buttons/Pills)
- **Container Width:** `w-[98%]` (Mobile), `max-w-7xl` (Desktop)
- **Grid Gap:** `gap-4` (Mobile), `gap-6` (Desktop)

---

## Component Specs

### Cards (Task & Subject)

```css
.card {
  background: var(--surface-card);
  border-radius: 24px; /* --radius-xl */
  padding: 1.5rem; /* p-6 */
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

/* Priority Indicator Border */
.priority-border {
  border-left: 4px solid var(--priority-color);
}
```

### Buttons

```css
/* FAB (Floating Action Button) */
.fab {
  background: var(--action-primary);
  border-radius: 50%;
  box-shadow: 0 10px 20px -5px rgba(var(--action-primary-rgb), 0.4);
}

/* Filter Chips */
.chip {
  border-radius: 100px;
  background: var(--surface-card);
  /* Active state: bg-action-primary text-white */
}
```

### Toggles (iOS Style - Modern Rectangular)

```css
.ios-toggle-bg {
  width: 51px;
  height: 31px;
  border-radius: 6px; /* Rectangular with slight radius */
  background-color: rgba(255, 255, 255, 0.1);
}

.ios-toggle-dot {
  width: 27px;
  height: 27px;
  border-radius: 4px;
  background-color: white;
}
```

### Navigation

- **Mobile:** Bottom Bar, Icon-only, Minimalist
- **Desktop:** Sidebar/Header adaptation (if applicable)

---

## Style Guidelines

**Style:** Modern Dark SaaS

**Keywords:** Dark mode, vibrant accents, borderless cards, soft shadows, rounded typography, fluid layout

**Best For:** Productivity apps, task managers, dashboards

**Key Effects:**

- **Active Accents:** Colored shadows matching the accent color.
- **Micro-interactions:** Scale down on click (`active:scale-[0.98]`).
- **Smooth Transitions:** All color/transform changes use `transition-all duration-200`.

### Page Patterns

- **Dashboard:** Compact stats row -> Horizontal Filters -> Task List (Grid)
- **Lists:** Clean cards with defining left-border color for context (Priority/Subject).

---

## Anti-Patterns (Do NOT Use)

- ❌ **Traditional Checkboxes** — Use custom styled check circles.
- ❌ **Sharp Corners** — Use consistent rounded corners (min 8px, usually 24px).
- ❌ **Native Selects** — Use custom dropdowns or bottom sheets.
- ❌ **Ovals for Toggles** — Use the specific "Rectangular Modern" style defined above.
- ❌ **Kanban Board** — (Removed in favor of clean list/grid view).

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] Theme color meta tag matches accent color
- [ ] Toggles are rectangular (51x31px)
- [ ] Cards have correct border-radius (24px)
- [ ] Desktop layout uses Grid/Flex appropriately (not stretched mobile view)
- [ ] Touch targets are min 44px
