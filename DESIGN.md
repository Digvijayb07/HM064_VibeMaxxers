---
name: TalentHub
description: A high-precision project collaboration platform styled as a technical telemetry HUD.
colors:
  primary: "#0e7490"
  primary-dark: "#00e5ff"
  neutral-bg: "#f8fafc"
  neutral-bg-dark: "#070a13"
  card-bg: "#ffffff"
  card-bg-dark: "#0f1322"
  accent: "#06b6d4"
  border: "#e2e8f0"
  border-dark: "#1e293b"
typography:
  display:
    fontFamily: "Outfit, sans-serif"
    fontSize: "clamp(2rem, 5vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Outfit, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  sm: "4px"
  md: "6px"
  lg: "12px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  card:
    backgroundColor: "{colors.card-bg}"
    rounded: "{rounded.lg}"
    padding: "24px"
---

# Design System: TalentHub

## 1. Overview

**Creative North Star: "The Telemetry Blueprint"**

TalentHub is styled as a high-precision developer console and blueprint drawing. It leverages glowing cyan grids, clean hairline geometric borders, and technical monospace labels to provide developers and companies with a tactile, professional workspace. Visual hierarchy is achieved through high-contrast typography pairings and precise coordinate markers rather than heavy boxes or decorative cards.

**Key Characteristics:**
- Glowing blueprint grid lines and technical scrollbars.
- Monospace indices and custom telemetry brackets that highlight on hover.
- Flat container sheets with zero drop-shadow footprint.
- Clean editorial contrast pairing Outfit sans-serif with Lora serif italic accents.

## 2. Colors

The color palette is characterized by a restrained primary technical cyan and deep charcoal neutrals, adapting dynamically between light and dark modes.

### Primary
- **Telemetry Cyan** (#0e7490 / #00e5ff in dark): The primary brand identifier. Represents interactive focus states, active badges, and glowing highlights.

### Secondary
- **Glow Accent** (#06b6d4): Used sparingly for high-priority badge highlights, buttons, and telemetry accents.

### Neutral
- **Slate Ink** (#0f172a / #e2e8f0 in dark): Used for primary headlines and body text to guarantee legibility.
- **Blueprint Neutral** (#f8fafc / #070a13 in dark): The core background canvas.
- **HUD Frame** (#e2e8f0 / #1e293b in dark): Border and coordinate lines.

### Named Rules
**The Rarity Rule.** The Telemetry Cyan accent is used on ≤10% of any given screen. Its rarity is what gives it its high-contrast, glowing focus.
**The No-Color-Gray Rule.** Muted texts use darker shades of the background's hue or transparencies (e.g., `#475569` or `rgba(15,23,42,0.6)`), never a raw neutral gray.

## 3. Typography

**Display Font:** Outfit (with fallback sans-serif)
**Body Font:** Outfit (with fallback sans-serif)
**Label/Mono Font:** JetBrains Mono (with fallback monospace)
**Serif Font:** Lora (with fallback serif, italic only)

**Character:** The system pairs a geometric grotesque display typeface (Outfit) with a monospaced coding font (JetBrains Mono) for telemetry indicators, accented by a classic serif italic (Lora) for editorial warmth.

### Hierarchy
- **Display** (Bold 700, clamp(2rem, 5vw, 3.5rem), 1.1): Hero titles and main dashboard headings.
- **Headline** (Semi-Bold 600, 1.875rem, 1.2): Primary container headers.
- **Title** (Medium 500, 1.25rem, 1.3): Cards and section headings.
- **Body** (Regular 400, 1rem, 1.5): Standard prose and descriptions. Max line-length capped at 75ch.
- **Label** (Regular 400, 0.875rem, 1.4): Metadata, table columns, and badge values. Monospaced.

### Named Rules
**The Editorial Accent Rule.** Lora serif is used exclusively in its italic style as a single-word or short-phrase accent within sans-serif Display headings to add warmth and human craft.

## 4. Elevation

The system is flat by default, relying on clean container borders and subtle grid line density to denote layering rather than structural drop shadows.

### Named Rules
**The Flat-HUD Rule.** Surfaces are completely flat at rest. Depth is represented by borders and subtle tinting changes. Drop shadows are strictly forbidden on borders.

## 5. Components

Components are designed to look like modular, technical equipment blocks with precise hair-thin outlines.

### Buttons
- **Shape:** Rounded medium edges (6px radius).
- **Primary:** Translucent or solid cyan fill with white text and a rapid 150ms focus transition.
- **Ghost:** Borderless with active hover underline and blueprint highlights.

### Cards / Containers
- **Corner Style:** Rounded large edges (12px radius).
- **Background:** Flat solid background (`#ffffff` / `#0f1322` in dark).
- **Border:** Thin solid border (`#e2e8f0` / `#1e293b` in dark) with absolute positioned hairline corners (`.card-telemetry`).

### Inputs / Fields
- **Style:** Thin border outline with monospace values.
- **Focus:** 1px Cyan ring glow with no drop-shadow footprint.

## 6. Do's and Don'ts

### Do:
- **Do** wrap project titles in `<ViewTransition name={`project-title-${id}`} share="text-morph">` to preserve typographic continuity on navigation.
- **Do** align data tables and badges using the strict monospaced JetBrains Mono layout.
- **Do** use single-character typography ellipses (`…`) instead of three dot strings (`...`).

### Don't:
- **Don't** use warm cream/sand background colors under any circumstances.
- **Don't** use drop-shadows combined with border strokes on buttons or cards.
- **Don't** use text gradients (`background-clip: text` style text color fills).
- **Don't** use card corner border-radii larger than 12px.
