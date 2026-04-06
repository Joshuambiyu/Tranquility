# Homepage Styling System

This file is the reference for how section backgrounds and card backgrounds should work across pages.

## Intent

The homepage uses two different visual levels:

1. `SectionBlock`
2. `Card` inside a `SectionBlock`

The goal is to keep these levels predictable and reusable.

## Core Rule

- If a `SectionBlock` contains `Card` components, the `SectionBlock` itself stays on the default white surface.
- If a `SectionBlock` does not contain `Card` components, the `SectionBlock` uses the green gradient background.
- Cards inside section blocks carry the green accent through their own card background.

This keeps the page clean:

- text-heavy sections get the green section treatment
- card-grid sections stay structurally white
- cards inside those sections carry the accent color

## Shared Sources Of Truth

### Section backgrounds

Defined in `app/components/ui.tsx`:

```tsx
export const SECTION_BG_VARIANTS = {
  sectionBlockBg: {
    className: "relative overflow-hidden",
    style: {
      background: "linear-gradient(135deg, var(--section-from) 0%, var(--section-via) 52%, var(--section-to) 100%)",
    },
  },
  default: {
    className: "",
    style: {},
  },
};
```

Defined in `app/globals.css`:

```css
--section-from: #bdebd8;
--section-via: #ddf4ea;
--section-to: #f8fffc;
```

If the green section tint should change globally, update only these three CSS variables.

### Card backgrounds

Defined in `app/components/ui.tsx`:

```tsx
export const CARD_BG_VARIANTS = {
  cardInSectionBg: "bg-[var(--card-in-section-bg)]",
  muted: "bg-[var(--surface-muted)]",
  soft: "bg-[var(--accent-soft)]",
  surface: "bg-[var(--surface)]",
};
```

Defined in `app/globals.css`:

```css
--card-in-section-bg: #eef6f2;
--card-in-section-hover: #e4f1e9;
```

If the card accent should change globally, update these two CSS variables.

## Auto Behavior In SectionBlock

`SectionBlock` automatically checks whether its descendants contain the shared `Card` component.

Current behavior:

```tsx
const resolvedBgVariant = bgVariant ?? (hasDescendantCard(children) ? "default" : "sectionBlockBg");
```

Meaning:

- `Card` found -> white section background
- no `Card` found -> green gradient section background

## Future Usage Pattern

### For text-only or content-only sections

Use `SectionBlock` without forcing a variant:

```tsx
<SectionBlock>
  <SectionTitle title="Mission Statement" />
  <p>...</p>
</SectionBlock>
```

Because no `Card` is present, the section will automatically use the green gradient.

### For sections that render cards

Use the shared `Card` component inside `SectionBlock`:

```tsx
<SectionBlock>
  <SectionTitle title="Recent Articles" />
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    {items.map((item) => (
      <Card key={item.id} className="gap-3">
        <h3>{item.title}</h3>
        <p>{item.description}</p>
      </Card>
    ))}
  </div>
</SectionBlock>
```

Because `Card` is present, the section will automatically stay white, while the cards take the shared green accent background.

### For clickable cards

Use the `href` prop on `Card`:

```tsx
<Card href={item.href} className="gap-3">
  <h3>{item.title}</h3>
  <p>{item.description}</p>
</Card>
```

The shared hover treatment will be applied automatically.

## When To Override The Auto Rule

Only override `bgVariant` on `SectionBlock` if there is a deliberate design exception.

Example:

```tsx
<SectionBlock bgVariant="sectionBlockBg">
  ...
</SectionBlock>
```

That should be the exception, not the default workflow.

## Practical Rule For New Pages

When building a new page:

1. Start with `SectionBlock` only.
2. If the section contains tiles/cards, use the shared `Card` component.
3. Let `SectionBlock` decide the section background automatically.
4. Only change `globals.css` tokens if the palette itself needs to shift.
5. Do not hardcode one-off `bg-*`, `ring-*`, or gradient values when the shared system can be used.

## Current Visual Hierarchy

- `SectionBlock` without cards -> green gradient
- `SectionBlock` with cards -> white surface
- `Card` inside section block -> soft green background

This is the styling pattern to copy for future pages unless a page has a clear reason to break it.