# Typography System Documentation

## Overview
This document describes the centralized typography system implemented in `src/app/globals.css`. The system provides reusable, semantic typography classes that ensure consistency across the entire application.

## Design Principles

### Font Usage
1. **Inter (font-sans)** - Primary UI font
   - Use for ALL body text, headings, and standard UI elements
   - Optimized for readability and web interfaces

2. **JetBrains Mono (font-mono)** - Technical/Metric font
   - ONLY use for metrics, IDs, technical labels, and dashboard statistics
   - Reserved for specialized technical contexts

3. **Instrument Serif (font-serif)** - Accent font
   - Use sparingly for special emphasis or quotes
   - Adds variety without overwhelming the design

## Typography Classes

### Headings

| Class | Size | Weight | Use Case | Example |
|-------|------|--------|----------|---------|
| `.heading-1` | 64px (4rem) | 700 | Large page titles | Dashboard main header |
| `.heading-2` | 48px (3rem) | 700 | Section headers | Daily Audit page title |
| `.heading-3` | 32px (2rem) | 700 | Subsection headers | Card titles, metric values |
| `.heading-4` | 24px (1.5rem) | 600 | Card/panel titles | Component headers |
| `.heading-5` | 20px (1.25rem) | 600 | Small headings | Section labels |
| `.heading-6` | 16px (1rem) | 600 | Smallest headings | Inline headers |

**Responsive Behavior:**
- `.heading-1`: Scales to 40px on mobile
- `.heading-2`: Scales to 32px on mobile
- `.heading-3`: Scales to 24px on mobile

### Body Text

| Class | Size | Line Height | Use Case |
|-------|------|-------------|----------|
| `.body-lg` | 18px (1.125rem) | 1.6 | Large body text, important paragraphs |
| `.body` | 16px (1rem) | 1.6 | Standard body text, default paragraphs |
| `.body-sm` | 14px (0.875rem) | 1.5 | Small body text, secondary content |

### Labels

| Class | Size | Font | Use Case |
|-------|------|------|----------|
| `.label` | 12px (0.75rem) | Monospace | Standard UI labels, form labels |
| `.label-sm` | 10px (0.625rem) | Monospace | Small labels, status indicators |
| `.metric-label` | 10px | Monospace | Dashboard metric labels, statistics |

### Specialized Classes

| Class | Purpose | Example Usage |
|-------|---------|---------------|
| `.caption` | Subtle, de-emphasized text (11px sans-serif) | Helper text, footnotes |
| `.metric-value` | Large dashboard metric values (32px monospace) | Dashboard statistics |
| `.accent-serif` | Italic serif for special emphasis | Quotes, special callouts |
| `.button-text` | Sans-serif button text (14px) | Standard buttons |
| `.button-text-mono` | Monospace button text (12px) | Technical action buttons |
| `.field-label` | Form field labels (14px sans-serif) | Form inputs |
| `.forensic-telemetry` | Technical telemetry display | System status, metrics |

## CSS Variables

All typography uses centralized CSS variables defined in globals.css:

```css
/* Font Families */
--font-sans: var(--font-inter);
--font-mono: var(--font-jetbrains-mono);
--font-serif: var(--font-serif);

/* Font Sizes */
--text-h1: 4rem;        /* 64px */
--text-h2: 3rem;        /* 48px */
--text-h3: 2rem;        /* 32px */
--text-h4: 1.5rem;      /* 24px */
--text-h5: 1.25rem;     /* 20px */
--text-h6: 1rem;        /* 16px */
--text-body-lg: 1.125rem; /* 18px */
--text-body: 1rem;      /* 16px */
--text-body-sm: 0.875rem; /* 14px */
--text-label: 0.75rem;  /* 12px */
--text-label-sm: 0.625rem; /* 10px */
--text-caption: 0.6875rem; /* 11px */
```

## Migration Guide

### Before (Old Pattern)
```tsx
<h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-white uppercase">
  Command Center
</h1>

<label className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/40">
  Main Focus
</label>

<span className="text-3xl font-bold text-white">
  {progress}%
</span>
```

### After (New Pattern)
```tsx
<h1 className="heading-1 uppercase">
  Command Center
</h1>

<label className="metric-label">
  Main Focus
</label>

<span className="heading-3">
  {progress}%
</span>
```

## Updated Components

The following components have been updated to use the new typography system:

### Dashboard Components
- `src/components/dashboard/DashboardHeader.tsx` - Uses `heading-1` and `label`
- `src/components/dashboard/SprintStatus.tsx` - Uses `metric-label`, `heading-3`, `label`, `label-sm`
- `src/components/dashboard/ConsistencyGrid.tsx` - Uses `metric-label`, `label-sm`
- `src/components/dashboard/PrioritiesWorkflow.tsx` - Uses `heading-5`, `metric-label`, `body-sm`, `label-sm`

### Form Components
- `src/components/daily/daily-log-form.tsx` - Uses `heading-2`, `label-sm`, `metric-label`, `button-text-mono`

### UI Components
- `src/components/ui/button.tsx` - Uses `button-text` for all button variants

### Global Styles
- `src/app/globals.css` - Updated `.forensic-telemetry` to use metric-label base

## Best Practices

### DO ✅
- Use semantic classes (`.heading-1`, `.body`, `.label`) instead of arbitrary values
- Use `.label` or `.label-sm` for form labels and UI labels
- Use `.metric-label` specifically for dashboard metrics
- Use `.heading-*` classes for all headings
- Use `.body-*` classes for all readable content
- Combine classes when needed (e.g., `className="label text-white/60"`)

### DON'T ❌
- Don't use arbitrary font sizes like `text-[10px]`, `text-[11px]`
- Don't mix arbitrary tracking values like `tracking-[0.3em]` with standard classes
- Don't use `font-mono` everywhere - reserve it for technical content
- Don't create custom font combinations when a semantic class exists
- Don't use inline styles for typography

## Example Combinations

```tsx
// Dashboard Metric
<div>
  <h3 className="metric-label">Sprint Velocity</h3>
  <span className="heading-3">{progress}%</span>
  <p className="label text-white/40">Complete</p>
</div>

// Form Section
<div>
  <Label className="metric-label">Energy Level</Label>
  <p className="caption">Select your current energy level</p>
</div>

// Page Header
<div>
  <h1 className="heading-1 uppercase">Dashboard</h1>
  <div className="label">
    <span>Week {weekNumber}</span>
    <span className="text-action-emerald">{sprintName}</span>
  </div>
</div>
```

## Benefits

1. **Consistency** - All text uses standardized sizes and weights
2. **Maintainability** - Change font globally by updating CSS variables
3. **Accessibility** - Proper heading hierarchy and readable sizes
4. **Performance** - Reduced CSS bloat from arbitrary values
5. **Developer Experience** - Clear, semantic class names
6. **Design System** - Enforces visual hierarchy and brand consistency

## Future Improvements

- Consider adding more specialized classes as patterns emerge
- Create Storybook documentation for visual reference
- Add TypeScript types for typography variants
- Consider adding utility classes for common combinations
- Add dark/light theme support if needed