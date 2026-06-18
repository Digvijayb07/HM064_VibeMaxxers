# Lane: Blueprint Telemetry

**Identity:** A hand-drafted architectural blueprint meets a sleek aerospace telemetry console.
**Mood words:** Sleek, Precise, Cyberpunk

---

## Palette

| Role | Hex (Light) | Hex (Dark) | Notes |
| :--- | :---: | :---: | :--- |
| **Surface** | `#f8fafc` (Slate 50) | `#070a13` (Deep Aerospace Void) | Main background |
| **Field** | `#ffffff` (Pure White) | `#0f1322` (Glass Console Panel) | Card/section backgrounds |
| **Ink** | `#0f172a` (Slate 900) | `#e2e8f0` (Slate 200) | Body and text color |
| **Accent** | `#0891b2` (Cyan 600) | `#00e5ff` (Electric Cyan Glow) | Interactive and focus highlights |

---

## Typography

* **Heading**: **`Outfit`** (Grotesque Sans), letter-spacing: `-0.03em` (tight tracking)
* **Drama**: **`Lora`** (Serif Italic) for selective high-end emphasis
* **Mono**: **`JetBrains Mono`** for tags, status indicators, numerical data, and tech labels
* **Locked Weights**: `400` (Regular), `500` (Medium), `700` (Bold)
* **Type Scale**: `12px` (labels/eyebrows), `14px` (meta), `16px` (body), `20px` (card title), `24px` (section header), `36px` (page title), `56px` (hero text)

---

## Space, radius, depth

* **Spacing**: 4px base (4/8/12/16/24/32/48/64/96px rhythm)
* **Radius Scale**:
  * Inputs, Buttons, Badges: `6px` (`rounded-md` / `rounded-sm`)
  * Cards, Tables, Modals: `12px` (`rounded-xl`)
  * Outer layouts/panels: `20px` (`rounded-3xl`)
* **Depth**: Hairline borders (`border-slate-200` in light, `border-slate-800/80` in dark) combined with subtle background tints and `backdrop-blur-md` glass panels. Strictly **no** stacked border + shadow elements.

---

## Texture

* **Architectural blueprint grid**: A low-opacity linear-gradient background grid pattern on `Surface` to provide structure and depth.
* **Glassmorphism**: Transparent backdrop filters on `Field` headers/cards with 1px borders.

---

## Motion

* **Appetite**: Standard
* **Durations**: micro `200ms ease-out`, macro `400ms cubic-bezier(0.16, 1, 0.3, 1)`
* **Reduced Motion**: Explicit `motion-reduce:transition-none` and `motion-reduce:transform-none` configurations on interactive sections.
* **Animations**: Avoid generic fade-ups. Use slide/translate transformations along targeted axes.

---

## Signature moment

* **The Telemetry Submission Grid**: On the dashboards, developer submissions and evaluations are rendered as interactive node connections on a subtle, vector-glowing grid. Hovering over a proposal reveals a terminal-like tooltip detailing performance metrics, technologies, and evaluation logs in monospace format.

---

## Do / Don't

### **DO**:
1. Style all status badges and tags in Monospace (`font-mono`) with custom background opacity tints (e.g. `bg-cyan-500/10 text-cyan-600` or `bg-cyan-400/10 text-cyan-400`).
2. Use custom thin hairline borders (`border-slate-200` or `border-slate-800/80`) to divide layout regions instead of drop shadows.
3. Apply negative letter-spacing (`tracking-tight` or `tracking-tighter`) to all headings above `24px`.
4. Use a single accent hue (cyan/electric blue) for primary interactive highlights; keep secondary buttons entirely neutral (slate/gray).
5. Use custom scrollbars styled to the theme (thin, rounded slate-800 tracks with cyan thumbs).

### **DON'T**:
1. Don't use default Tailwind color classes (like `bg-indigo-600`, `from-purple-500 to-pink-500`, etc.).
2. Don't stack border, shadow, and ring depth signals on cards. Choose hairline borders only.
3. Don't use uniform border-radius on cards, inputs, and buttons. Maintain radius hierarchy (6px inputs, 12px cards).
4. Don't use `transition-all`. Specify `transition-colors`, `transition-transform`, or `transition-opacity` explicitly.
5. Don't use generic emoji as iconography; restrict icons strictly to Lucide with `stroke-width={1.5}` or `stroke-width={2}`.

---

## Acceptance checks

1. The site uses the typography scale and pairings (Outfit, Lora italic, and JetBrains Mono) with no more than 3 weights.
2. Accent color `#00e5ff` (Vibrant Cyan) is used only for active indicators, primary call-to-actions, and highlights.
3. The custom architectural blueprint-style grid background is visible on page margins.
4. No card or element has both a visible border and a drop shadow stacked together.
5. Contrast checks pass on all page components with a minimum 4.5:1 ratio.

---

## Tokens Block

```css
:root {
  --background: #f8fafc;
  --foreground: #0f172a;
  --card: #ffffff;
  --card-foreground: #0f172a;
  --popover: #ffffff;
  --popover-foreground: #0f172a;
  --primary: #0891b2; /* Cyan 600 */
  --primary-foreground: #ffffff;
  --secondary: #f1f5f9;
  --secondary-foreground: #0f172a;
  --muted: #f1f5f9;
  --muted-foreground: #475569;
  --accent: #06b6d4;
  --accent-foreground: #ffffff;
  --border: #e2e8f0;
  --input: #e2e8f0;
  --ring: #0891b2;
  --radius: 0.75rem;
}

.dark {
  --background: #070a13;
  --foreground: #e2e8f0;
  --card: #0f1322;
  --card-foreground: #e2e8f0;
  --popover: #0f1322;
  --popover-foreground: #e2e8f0;
  --primary: #00e5ff; /* Electric Cyan */
  --primary-foreground: #070a13;
  --secondary: #1e293b;
  --secondary-foreground: #e2e8f0;
  --muted: #1e293b;
  --muted-foreground: #94a3b8;
  --accent: #00e5ff;
  --accent-foreground: #070a13;
  --border: #1e293b;
  --input: #1e293b;
  --ring: #00e5ff;
  --radius: 0.75rem;
}
```
