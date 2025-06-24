# Design System Specification

## Color Palette

### Colors (Dark Mode)
```css
/* Backgrounds: #0a0a0a (main), #1a1a1a (cards), #2a2a2a (elevated) */
/* Text: #ffffff (primary), #a1a1aa (secondary), #71717a (muted) */
/* Accent: #ff6b35 (CTA), #e55a30 (hover), #ff6b3520 (tint) */
/* Status: #22c55e (success), #f59e0b (warning), #ef4444 (error), #3b82f6 (info) */
/* Interactive: #ffffff08 (hover), #ff6b3540 (focus), #ffffff12 (active) */
```

## Typography

### Fonts & Scale
```css
/* Headings: 'Monument Extended', fallback: 'Arial Black' */
/* Body: 'Inter', fallback: system fonts */
/* Scale: 60px/48px/36px/30px/24px/20px (headings), 18px/16px/14px/12px (body) */
/* Weights: 100-900 (thin to black) */
```

## Spacing System

### Scale (Custom CSS)
```css
/* 0, 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px, 80px, 96px */
/* Layout: 1.5rem mobile padding, 3rem desktop, 4rem sections, 2rem components */
/* Note: Tailwind CSS removed - using custom CSS implementation */
```

## Breakpoints & Components

### Breakpoints
```css
/* Mobile-first: 640px, 768px, 1024px, 1280px, 1536px */
/* Containers: match breakpoint sizes */
```

### Component Styles
```css
/* Buttons: Primary (accent bg, hover lift), Secondary (transparent, border) */
/* Cards: bg-secondary, 1rem radius, hover accent border + lift */
/* Forms: bg-tertiary, focus accent border + shadow */
```

## Icons, Animation & Layout

### Icons: Lucide React
- 2px stroke, 24px default, accessible, scalable
- Usage: `<Music className="w-6 h-6" />`, `<Heart className="w-6 h-6 text-accent" />`

### Animations
```css
/* Transitions: 0.15s fast, 0.2s normal, 0.3s slow */
/* Hover lift: translateY(-2px) */
/* Fade in: opacity 0→1, translateY 20px→0 */
```

### Layout Patterns
```css
/* Artist grid: auto-fill, minmax(300px, 1fr), 2rem gap */
/* Release grid: auto-fill, minmax(250px, 1fr), 1.5rem gap */
/* Container: max-width xl, center, responsive padding */
```

## Images & Accessibility

### Image Specs
- **Artist/Album**: 1:1 square (80px/120px/200px)
- **Hero**: 16:9 landscape
- **News**: 2:1 wide

### Accessibility
- **Contrast**: 4.5:1 text, 3:1 large text/interactive
- **Focus**: Visible indicators, keyboard nav
- **Screen readers**: Semantic HTML, ARIA labels, alt text

### Dark Mode
```jsx
// CSS variables + ThemeContext for React components
```