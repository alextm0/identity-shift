# Monthly Review Redesign Summary

## Overview
Redesigned Monthly Review to match Weekly Review style with focus on month-level outcomes and "Integrity Mirror" (self-perception vs reality calibration).

## Key Changes

### 1. Updated Data Layer
**File:** `src/queries/monthly.ts`
- Added promise logs fetching for month data
- Updated to use `getActiveSprintWithDetails` (goals/promises system)
- Supports month selection via search params

**File:** `src/data-access/promises.ts`
- Added `getPromiseLogsForDateRange(userId, startDate, endDate)` function

### 2. New Monthly Summary Use Case
**File:** `src/use-cases/monthly-summary.ts`

Calculates month-level metrics:
- **Promises Kept Rate**: Total kept/committed for the month
- **Days Logged**: Count + consistency percentage
- **Longest Streak**: Maximum consecutive logged days
- **Weekly Summaries**: Breakdown by week (W1-W4/W5)
- **Calendar Data**: Per-day completion ratios for heatmap
- **Goal Summaries**: By-goal completion with trends

### 3. New Chart Components

#### Monthly Weekly Trend
**File:** `src/components/reviews/monthly-weekly-trend.tsx`

- Shows 4-5 weekly bars for the month
- Each bar: kept/committed ratio
- Color-coded: green (≥70%), amber (50-69%), red (<50%)
- Hover tooltips show exact numbers + week start date
- Latest week highlighted with violet ring
- Matches weekly review visual style

#### Monthly Calendar Heatmap
**File:** `src/components/reviews/monthly-calendar-heatmap.tsx`

- Full month grid (Mon-Sun layout)
- Each day colored by completion rate
- Shows logged vs not-logged days
- Same color scheme as weekly chart
- Today highlighted with violet ring
- Hover tooltips show date + ratio
- Visual pattern recognition for consistency

#### Integrity Mirror
**File:** `src/components/reviews/integrity-mirror.tsx`

**Explicit Self vs Reality Comparison:**
- **Self-Perception**: 1-10 slider (user input)
- **Reality Score**: Calculated from data (1-10)
- **Calibration Gap**: Self - Reality
  - Calibrated: Gap ≤ 1 (green)
  - Over-estimating: Gap > 1 (amber)
  - Under-estimating: Gap < -1 (violet)

**Reality Formula (Progressive Disclosure):**
```
Promises Kept Rate     × 0.5
Days Logged Consistency × 0.3
Goal Completion Average × 0.2
─────────────────────────────
Reality Score           = X.X
```

Visual comparison with horizontal bars showing both scores.

### 4. Redesigned Monthly Review Panel
**File:** `src/components/reviews/monthly-review-panel-new.tsx`

**Layout Structure:**

```
┌────────────────────────────────────────┐
│  Month Selector (dropdown)             │
├────────────────────────────────────────┤
│  KPI Cards (4 across)                  │
│  Promises | Days | Streak | Energy     │
├─────────────────────┬──────────────────┤
│  Weekly Trend       │  Calendar        │
│  (4-5 bars)         │  Heatmap         │
├─────────────────────┴──────────────────┤
│  Left Column        │  Right Column    │
│  ─────────────      │  ──────────────  │
│  Identity Audit     │  Integrity       │
│  - Who were you?    │  Mirror          │
│  - Alignment        │  - Self rating   │
│                     │  - Reality score │
│  Evolution          │  - Calibration   │
│  - One change       │  - Formula       │
└─────────────────────┴──────────────────┘
│  Save Button (bottom right)            │
└────────────────────────────────────────┘
```

**Design Style:**
- Matches weekly review fonts, sizing, spacing
- Glass panel components
- Uppercase mono labels
- Clean 3-column KPI cards
- Full-width charts row
- 3-column main content (1/3 left, 2/3 right)

### 5. Month-Level Outcomes Focus

**What We Show:**
1. **Promises Kept**: Total + percentage + trend
2. **Days Logged**: Count + percentage consistency
3. **Longest Streak**: Days in a row
4. **Avg Energy**: Month average
5. **Weekly Momentum**: Visual trend across weeks
6. **Calendar Pattern**: Daily completion heatmap

**What We Hide:**
- Daily noise and variance
- Micromanagement metrics
- Alert fatigue patterns
- Complex multi-metric tracking

**Why This Works:**
- Monthly check-ins are about **trends and adjustments**
- Visual patterns > numeric tables
- Self-calibration > judgment
- Future-focused (one change) > past dwelling

### 6. Updated Monthly Page
**File:** `src/app/dashboard/monthly/page.tsx`

- Uses new `MonthlyReviewPanelNew` component
- Passes promise logs to panel
- Increased max-width to 7xl for better chart visibility
- Same header styling maintained

## Data Mapping

| Metric | Source | Display |
|--------|--------|---------|
| Promises Kept | Promise logs count where completed=true | KPI card + percentage |
| Days Logged | Daily logs count | KPI card + percentage |
| Longest Streak | Consecutive daily logs | KPI card (highlighted if ≥7) |
| Weekly Trend | Promises kept per week | 4-5 bar chart |
| Daily Patterns | Promises kept per day | Calendar heatmap |
| Reality Score | Weighted formula | Integrity Mirror (auto-calculated) |
| Self Rating | User slider input | Integrity Mirror (user input) |
| Calibration Gap | Self - Reality | Status card (calibrated/over/under) |

## Reality Score Calculation

```javascript
const promisesKeptWeight = promisesKeptRatio * 10 * 0.5;  // 50% weight
const daysLoggedWeight = (daysLogged / totalDays) * 10 * 0.3;  // 30% weight
const goalsWeight = (avgGoalCompletion) * 10 * 0.2;  // 20% weight

realityScore = promisesKeptWeight + daysLoggedWeight + goalsWeight;
// Capped at 10
```

## Design Constraints Met

✅ Match weekly review style (fonts, sizing, spacing)
✅ Focus on month-level outcomes
✅ Show promises kept rate + trend
✅ Show days logged consistency + streaks
✅ Show by-goal completion
✅ Keep Integrity Mirror concept
✅ Make self vs reality explicit
✅ Show calibration delta
✅ Visual charts for trends
✅ Calendar heatmap for patterns
✅ Clean, action-centric layout
✅ Progressive disclosure (formula)
✅ No alert fatigue

## User Experience

1. **Visual First**: Charts show patterns instantly
2. **Outcome-Focused**: Month-level metrics, not daily noise
3. **Self-Awareness**: Explicit calibration gap
4. **Actionable**: "One change" decision point
5. **Identity-Centric**: Who were you? vs Who do you want to be?
6. **Transparent**: Formula shows how reality is calculated
7. **Clean Layout**: Breathing room, clear hierarchy
8. **Consistent**: Matches weekly review patterns

## Technical Notes

- Uses new goals/promises system (not old priorities)
- Memoized calculations for performance
- Responsive grid layouts
- Reuses GlassPanel, Button, Input, Textarea components
- Color-coded status indicators
- Hover tooltips on all charts
- Progressive disclosure for formula
- Type-safe with proper TypeScript
- Month selector for viewing historical reviews

## Components Created

1. `src/use-cases/monthly-summary.ts` - Summary calculations
2. `src/components/reviews/monthly-weekly-trend.tsx` - Weekly trend chart
3. `src/components/reviews/monthly-calendar-heatmap.tsx` - Calendar heatmap
4. `src/components/reviews/integrity-mirror.tsx` - Self vs reality component
5. `src/components/reviews/monthly-review-panel-new.tsx` - Main panel component

## Files Modified

1. `src/queries/monthly.ts` - Added promise logs, month selection
2. `src/data-access/promises.ts` - Added date range query
3. `src/app/dashboard/monthly/page.tsx` - Updated to use new panel
