---
name: ClearFocus Study
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#464555'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#684000'
  on-tertiary: '#ffffff'
  tertiary-container: '#885500'
  on-tertiary-container: '#ffd4a4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.015em
  title-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.005em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  screen-margin-mobile: 1rem
  screen-margin-tablet: 1.5rem
  card-padding-sm: 0.75rem
  card-padding-md: 1rem
  card-padding-lg: 1.25rem
  gap-xs: 0.25rem
  gap-sm: 0.5rem
  gap-md: 0.75rem
  gap-lg: 1rem
  gap-xl: 1.5rem
  bottom-nav-height: 4.25rem
  touch-target-min: 2.75rem
---

## Brand & Style

This design system establishes a focused, encouraging, and friction-free digital companion for students managing complex academic schedules. The visual tone balances modern academic rigor with approachable warmth—avoiding clinical monotony while remaining completely free of visual clutter. 

The aesthetic is anchored in **Modern Flat Design with High-Def Tactility**:
- Crisp, low-contrast structural outlines delineate content without visual weight.
- Gentle, generous corner radiuses (`rounded-xl` and `rounded-2xl`) soften dense scheduling data into friendly, scannable cards.
- Heavy dropshadows, complex skeuomorphic depth, and noisy gradients are eliminated in favor of clean white surface planes, muted background fills, and deliberate color-coded status cues.
- The interface delivers an immediate sense of organization, calm productivity, and rewarding progress.

## Colors

The palette is tuned for high daylight readability, effortless task scanning, and positive behavioral reinforcement.

- **Primary (`#4F46E5` / Hover `#4338CA`)**: Vibrant Royal Indigo driving key actions, primary calendar selections, and active navigational indicators.
- **Secondary / Success (`#10B981` / Active `#059669`)**: Fresh Emerald Green dedicated strictly to completed homework, checked items, progress rings, and encouraging streaks.
- **Tertiary (`#F59E0B`)**: Warm Amber for urgent assignments due within 24 hours, warnings, and medium-priority tags.
- **Neutral / Canvas**:
  - Main App Background: `#F8FAFC` (Slate 50) and `#F1F5F9` (Slate 100) for clean structural sectioning.
  - Surface Containers: Pure `#FFFFFF` to make assignment cards pop with high contrast.
  - Border System: `#E2E8F0` (Slate 200) for razor-sharp, uniform 1px structural framing.
- **Text & Content**:
  - Primary Text: `#0F172A` (Slate 900) for headers and critical assignment titles (accessible WCAG AAA against `#FFFFFF`).
  - Secondary Text: `#64748B` (Slate 500) for course names, dates, and auxiliary metadata.
  - Muted Text: `#94A3B8` (Slate 400) for placeholders, timestamps, and inactive tab icons.

## Typography

The typography uses **Plus Jakarta Sans** across all roles. Its geometric build, open counters, and softly rounded apertures provide optimal reading speed on high-DPI mobile touchscreens while retaining a friendly, modern disposition.

- **Scale Rationale**: Compact mobile screens require direct title hierarchy without excessive vertical displacement. Large display headings (`display-lg`) are reserved for dashboard greetings or weekly score rollouts.
- **Numbers and Metrics**: All numerical counters (e.g., "3 Due Today", "94% Completed") inherit `fontWeight: 700` with tabular figures enabled (`font-variant-numeric: tabular-nums`) to prevent alignment shifts during progress updates.
- **Micro-labels**: Category badges and subject tags utilize uppercase `label-sm` with slight positive tracking (+0.04em) for immediate recognition at arm's length.

## Layout & Spacing

This design system uses a fluid single-column layout for mobile (max 480px width) scaling into a fixed 2-column layout on tablet devices (breakpoint: 768px).

- **Mobile Viewport Grid**: Standard lateral screen margin is locked at `1rem` (16px). All list items, summary metrics, and weekly date reels span full screen width minus horizontal margins.
- **Touch Targets**: Any tappable target (check circles, subject pickers, date pill selectors) must conform to a minimum size of `44px × 44px` (`touch-target-min`), regardless of visible border bounds.
- **Vertical Rhythm**: Spacing is organized around a strictly enforced 4px / 8px baseline:
  - Micro separations between metadata (subject tag to due date): `0.5rem` (8px).
  - Internal card padding: `1rem` (16px).
  - Inter-card gap within homework feed lists: `0.75rem` (12px).
  - Major section transitions (e.g., "Due Today" to "Upcoming"): `1.5rem` (24px).
- **Safe Area Insets**: Floating action buttons (FAB) and fixed bottom tab navigations must observe bottom safe areas with an additional `0.75rem` buffer over device home bars.

## Elevation & Depth

This system intentionally departs from skeuomorphic or heavily shadowed models, implementing a **Layered Flat & Low-Contrast Outline Hierarchy**:

1. **Canvas Plane (`#F8FAFC`)**: The fundamental backdrop across all main screen flows.
2. **Surface Plane (`#FFFFFF`)**: Homework cards, bottom sheets, filter ribbons, and modal sheets sit as pure white planes.
3. **Ghost Borders**: Depth is rendered exclusively through consistent `1px solid #E2E8F0` borders. No blur or colored drop shadows exist under resting states.
4. **Focused / Completed Dynamic States**:
   - Rather than lifting with shadows on tap, actionable cards react with a flat chromatic feedback: a temporary background fill shift to `#F1F5F9`, or a 1.5px border accentuation in `#4F46E5`.
   - Modals and bottom sheets dim the background canvas with a solid `rgba(15, 23, 42, 0.4)` overlay; the active sheet retains crisp white surfaces framed with standard outline boundaries.

## Shapes

The shape system centers on hyper-friendly curvature without compromising compact layout efficiency:

- **Cards & Primary Modules**: Standardized on `rounded-2xl` (16px / 1rem radius) to frame assignments, grade summaries, and day widgets softly.
- **Buttons, Inputs & Selectors**: Built with `rounded-xl` (12px / 0.75rem radius) for comfortable fingertip ergonomics.
- **Pills, Badges & Checkmarks**: True full-radius capsules (`rounded-full` / 9999px) for tags (e.g., "Math", "Chemistry"), assignment status chips, and task toggle rings.

## Components

### 1. Buttons
- **Primary Button**: Solid `#4F46E5` fill, text `#FFFFFF` (`title-sm`), height `48px`, `rounded-xl`, zero shadow. Pressed state changes fill to `#4338CA`.
- **Secondary Button**: Crisp `#FFFFFF` surface with `1px solid #E2E8F0`, text `#0F172A`. Active state fills to `#F1F5F9`.
- **Destructive/Text Action**: Transparent background with `#64748B` or danger red text (`#EF4444`).

### 2. Homework Cards
- Built with `#FFFFFF` surface, `rounded-2xl`, uniform `1px solid #E2E8F0` outline. Internal padding `16px`.
- Contains:
  - Subject Pill Tag (e.g., `#EEF2FF` fill with `#4F46E5` text for History; `#ECFDF5` fill with `#059669` text for Biology).
  - Title in `title-sm` (`#0F172A`).
  - Due date & estimated time row in `body-sm` (`#64748B`).
  - Circular completion target aligned to the top-right or leading-left edge.

### 3. Checkboxes (Completion Rings)
- Circular toggle (`24px × 24px`) with `rounded-full`.
- **Uncompleted State**: `2px solid #CBD5E1` outline with a transparent core.
- **Completed State**: Smoothly transitions to solid `#10B981` fill displaying an embedded crisp white flat checkmark icon. The adjoining assignment label transitions to `#94A3B8` with a clean strikethrough.

### 4. Input Fields
- Container: `#FFFFFF` fill, `1px solid #E2E8F0`, `rounded-xl`, height `48px`, horizontal padding `16px`.
- Typography: `body-md` text in `#0F172A`, placeholder in `#94A3B8`.
- Focus State: Outline intensifies to `2px solid #4F46E5` without any outer glow.

### 5. Chips & Subject Tags
- Height `28px`, `rounded-full`, horizontal padding `12px`.
- Typography: `label-sm`.
- Flat pastel tonal backgrounds paired with saturated foreground text to categorize subjects instantly across cluttered daily agenda views.

### 6. Calendar Day Strips (Weekly Reel)
- Segmented pill elements (`44px` width × `64px` height), `rounded-xl`.
- Unselected: `#FFFFFF` background, `1px solid #E2E8F0`, day label in `#64748B`, date digit in `#0F172A`.
- Selected Day: Solid `#4F46E5` fill, text `#FFFFFF`, indicator dot in `#10B981`.

### 7. Iconography Rules
- Clean, monoline strokes (1.75px uniform weight) based on a 24×24 grid.
- End caps and joins are rounded (`stroke-linecap: round; stroke-linejoin: round`) to echo the curvature of Plus Jakarta Sans.