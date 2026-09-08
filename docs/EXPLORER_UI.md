# Explorer UI — layout 1d

Chosen from four wireframed directions (`TFT Explorer Wireframes.dc.html`, option 1d).
Grid on the left, inspector on the right. Chosen because the inspector is where the coach
lives natively instead of being bolted on as a separate page later.

## Anatomy

```
┌──────────────────────────────────────────────────────────────┐
│ Explorer  [Units ▾] [16.3] [Diamond+]            [+ filter]  │  filter bar
├───────────────────────────────────┬──────────────────────────┤
│ Unit            Avg   Top4  Win Δ │  ▣ Selected unit         │
│ ▣ ───────      3.88   61%  17%    │    4-cost · 41k games    │
│ ▣ ───────      4.02   58%  14%  ◄ │                          │
│ ▣ ───────      4.29   54%  12%    │  Best items              │
│ …                                 │    ○ ──────      3.72    │
│                                   │    ○ ──────      3.95    │
│                                   │                          │
│                                   │  ┌ Coach read ─────────┐ │
│                                   │  │ …                   │ │
│                                   │  │ cited: …            │ │
│                                   │  └─────────────────────┘ │
└───────────────────────────────────┴──────────────────────────┘
```

## Filter bar

Active filters are removable chips; `+ filter` opens the rest. Pivot is the first chip and
reads as a dropdown, not a tab strip — it is a filter like any other.

- Pivot: **unit · item · trait · unit+item** (v1 scope)
- Filters: patch, rank bracket, region, queue, minimum games
- Every filter change writes to the URL. A pasted URL reproduces the exact view.

## Grid

Columns: name · avg placement · top 4 % · win % · Δ vs baseline · games.
Δ is empty for base pivots and populated for unit+item.

- Sortable by any metric column; default avg placement ascending.
- Virtualized. 200+ rows must scroll without dropping frames.
- Low-sample rows are **rendered and marked**, never dropped. A "hide low sample" toggle sits
  next to the row count.
- Selection is a single row, reflected in the URL, and drives the inspector.
- Keyboard: arrow keys move selection, Enter focuses the inspector. Per the accessibility floor
  the grid is a real `table` with `aria-sort` on the active column header.

## Inspector

Fixed 250–320px. Sections, top to bottom:

1. **Identity** — portrait, name, cost, sample size.
2. **Placement distribution** — eight bars, 1st through 8th. Not a v1 metric in the grid, but it
   belongs here: avg placement hides bimodal units and this is the cheapest place to be honest
   about it. Ships when Phase 3 emits `place_dist`; until then the section is absent, not faked.
3. **Best items** — top item pairings for the selected unit with avg placement and Δ. Backed by
   the unit+item pivot, so it arrives with Phase 5.
4. **Coach read** — arrives in Phase 6. Renders reasoning with its citations visible beneath.
   Absent until then; no placeholder, no "coming soon".

When nothing is selected the inspector shows the current filter's summary — total games, patch,
bracket — not an empty state graphic.

## Build order

The panel is additive: each section appears with the phase that produces its data. Phase 4 ships
the filter bar, the grid and the identity section only. That is a complete, useful product on its
own — the panel simply has one section in it.

## Not in v1

Augment and portal pivots, comp clustering, patch trend sparklines, saved views, comparison of
two rows side by side.
