# Weekly Review Redesign Summary (v3 - Final Simplified)

## Overview
Ultra-simplified Weekly Review layout. Clean naming, visual 7-bar chart, no alerts or insights sections. Pure data visualization.

## Key Changes

### 1. Cleaned Up Naming
- **Removed underscores** from all labels
- Changed: `Promises_Kept` → `Promises Kept`
- Changed: `Days_Logged` → `Days Logged`
- Changed: `Avg_Energy` → `Avg Energy`
- Changed: `Weekly_Progress` → `Weekly Progress`
- Changed: `Daily_Entries` → `Daily Entries`

### 2. Removed At-Risk Section
- **Removed:** At_Risk KPI card (redundant with promises table)
- **Removed:** at-risk-promises-card.tsx component
- Status already visible in promises table per goal
- Reduced metric count from 4 to 3 KPIs

### 3. Removed Visibility Gap / Insights Section
- **Removed:** Week Focus card
- **Removed:** week-focus-card.tsx component
- **Removed:** Insights generation logic
- No alerts, no action cards, no text warnings
- Chart provides all feedback needed visually

### 4. Added Weekly Progress Chart
**File:** `src/components/reviews/weekly-progress-chart.tsx`

**Visual Design:**
- 7 vertical bars (Mon-Sun) showing daily completion ratio
- Each bar: kept promises / committed promises
- Color-coded performance:
  - Green (≥70%): On track
  - Amber (50-69%): At risk
  - Red (<50%): Behind
- Faint target line at 100%
- Subtitle: "Target: Log daily"

**UX Features:**
- Hover tooltip shows exact kept/committed numbers
- Missing days show as very short faded bars
- Today highlighted with violet accent
- Future days shown faded
- Makes visibility gaps instantly obvious
- Bad days visually stand out

**Chart Benefits:**
- No text-heavy alerts needed
- Pattern recognition at a glance
- Reinforces daily workflow visually
- Shows both logging gaps AND performance

### 5. Updated Weekly Review Panel
**File:** `src/components/reviews/weekly-review-panel.tsx`

**Desktop Layout:**
- ✅ Top KPI cards row (3 cards: Promises Kept, Days Logged, Avg Energy)
- ✅ Weekly Progress Chart (full width, prominent)
- ✅ Promises by Goal table (full width)
- ✅ Daily Entries table (full width, bottom)

**Mobile Layout:**
- Stack all sections vertically
- No right-side panel distinction
- Natural reading flow

**Removed:**
- ❌ Diagnostic Alerts panel
- ❌ AlertList component usage
- ❌ At_Risk KPI card
- ❌ At-Risk Promises card
- ❌ Week Focus / Insights card
- ❌ Alert fatigue patterns
- ❌ Text-heavy warnings
- ❌ Underscore naming convention
- ❌ Right sidebar (promises table now full width)

## Data Mapping

| Old Alert | New Presentation |
|-----------|------------------|
| VISIBILITY_GAP | Visual gaps in 7-bar chart (missing bars) |
| PROMISE_AT_RISK | Color-coded bars (red/amber) + status in promises table |
| SCOPE_OVERLOAD | Removed (chart shows performance visually) |
| At-risk count | Removed (redundant with chart + table) |

## Design Constraints Met

✅ Keep existing aesthetic and card components
✅ No additional text
✅ Insights under two lines
✅ Show max 1-2 insights by default
✅ Progressive disclosure for additional data
✅ Action-centric design
✅ Mobile vertical stacking

## User Experience Improvements

1. **Visual First**: Chart shows patterns at a glance vs reading text
2. **Reduced Cognitive Load**: 3 KPIs, chart only, zero alerts
3. **Instant Pattern Recognition**: Bad days and gaps visually obvious
4. **No Redundancy**: Removed at-risk count, insights, and alerts
5. **Cleaner Layout**: Maximum breathing room, minimal noise
6. **Cleaner Naming**: Spaces instead of underscores (more readable)
7. **Self-Reinforcing**: "Target: Log daily" subtitle, no alarms
8. **Simpler Structure**: Vertical stack, no complex grid layouts
9. **Zero Alert Fatigue**: Pure data visualization

## Copy Style

- Maintained uppercase mono font for headers
- Kept terse, direct language
- No emoji (per constraints)
- Focus on what to do, not what's wrong

## Technical Notes

- Type-safe insight generation
- Proper TypeScript narrowing for at-risk promises
- Memoized insights calculation
- Chart uses date-fns for accurate week calculations (Mon-Sun)
- Color thresholds: ≥70% green, 50-69% amber, <50% red
- Hover tooltips with exact numbers
- Responsive bar widths with flex layout
- Reuses existing GlassPanel and Button components
- Maintains responsive design patterns

## Final Layout Summary

```
┌─────────────────────────────────────────┐
│  KPI Cards (3 across)                   │
│  Promises Kept | Days Logged | Avg Energy
├─────────────────────────────────────────┤
│  Weekly Progress Chart (7 bars)         │
│  Mon Tue Wed Thu Fri Sat Sun            │
│  Target: Log daily                      │
├─────────────────────────────────────────┤
│  Promises by Goal Table                 │
│  (full width)                           │
├─────────────────────────────────────────┤
│  Daily Entries Table                    │
│  (full width)                           │
└─────────────────────────────────────────┘
```

**Ultra-clean vertical stack:**
1. KPI cards
2. Progress chart
3. Promises table
4. Daily entries table

Mobile: Same structure, just narrower
