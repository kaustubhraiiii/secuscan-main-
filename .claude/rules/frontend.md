---
paths:
  - "frontend/**/*.tsx"
  - "frontend/**/*.ts"
  - "frontend/**/*.css"
---
# Frontend — Terminal Noir Design System

- Dark background: #0a0a0f
- Primary accent: electric cyan #00f0ff
- Warning accent: warm amber #f59e0b
- Body text: off-white #e2e2e8
- Muted text: #6b7280
- Borders: 1px solid rgba(255, 255, 255, 0.06)
- Code font: "JetBrains Mono" (Google Fonts)
- Heading font: "Oswald" (Google Fonts)
- Sharp corners everywhere. No rounded-everything.
- No purple gradients. No generic AI aestcs.
- Use CSS variables defined in index.css for all theme colors
- Severity colors: CRITICAL=#ef4444, HIGH=#f97316, MEDIUM=#f59e0b, LOW=#00f0ff
- Loading states use a subtle pulse animation, not spinners where possible
- Stagger animations on card lists with 50ms delay increments
