# Drawing objects

If the narration names an object - headphones, a microphone, a temple, a crowd - the frame shows a
**recognisable object**. A waveform labelled "music" is not a headphone, and a label on an abstract
stand-in reads as a placeholder. This file is the method for getting real illustrations out of code.

## Why not hand-written paths

An LLM hand-writing a 200-path illustration produces unverifiable, unreusable data at a high token
cost. Detail instead comes from **parameters and loops**:

| You want | Wrong approach | Right approach |
|---|---|---|
| A colonnade of 100 columns | 100 hand-written lines | a loop over `count`, each column a `Box3` |
| A crowd | 500 dots typed out | `Marks` with a seed and a density curve |
| A polyhedron | traced path data | vertices + an edge rule (`SOLIDS`) |
| Headphones | one big freehand path | band arc + two cup rects + a light |

## The kit

`src/common/draw.tsx` (geometry, pack-neutral):

| Helper | Use |
|---|---|
| `project3(p, cam)` | project a 3D point to the screen; `cam.yaw/pitch/s/cx/cy` |
| `Wire({verts, edges, cam})` | draw a wireframe from vertices and an edge list |
| `Box3({o, size, cam})` | a box, the workhorse for architecture and hardware |
| `Cylinder({base, r, h, segments, cam})` | an upright drum: cups, columns, cans, barrels |
| `Poly({verts, edges, cam})` | any custom solid |
| `SOLIDS.tetra / cube / octa / ico` | the Platonic solids, ready as vertices + edges |
| `Marks({cols, rows, seed, kind})` | seeded repetition: crowds, textures, dot fields |

`src/common/objects.tsx` (recognisable silhouettes, colour params):

| Object | Identifying details it carries |
|---|---|
| `Headphones` | band arc, two ear cups, two pads, a status light |
| `Mic` | capsule, grille lines, basket, stem, base, cable |
| `Person` | head, shoulders, one accent dot |

`src/common/media.tsx`:

| Helper | Use |
|---|---|
| `Picture({src, x, y, w, h})` | an imported PNG/JPG/SVG from `public/assets/<slug>/`, listed in the project's `MANIFEST.md` with source and licence |

## The method

1. **Name the parts.** Write the identifying details before the code: "a headphone has a band and two
   cups; a mic has a capsule, a grille and a basket." If you cannot name three parts, the object will
   read as a blob.
2. **Parameterise.** `count`, `spacing`, `width`, `height`, `radius`, `segments`. Detail is a loop.
3. **Compose from primitives before inventing geometry.** Most subjects are boxes, cylinders, arcs and
   polygons. Project them with `project3` when the subject has volume and a straight-on view would
   look flat.
4. **Repeat with seeds, not literals.** Crowds, textures and screens are `Marks` with a `seed`, a
   `density` and an alpha curve.
5. **Shade with hatching or one accent fill.** A clipped hatch pattern (`svg <pattern>`) or a single
   accent region; no gradients, no drop shadows.
6. **Verify at final size.** Render one still, look at it for a second: can you name the object
   without reading the caption? If not, the identifying detail is missing or too small.
7. **Keep it in the film, not in the pack** when it is topic-specific: `src/shots/<Gn>/icons.tsx`.
   Promote it into `common/objects.tsx` once a second film needs it.

## Worked examples (sketches)

```tsx
// A colonnade: 12 columns, entablature, steps. Detail from the loop, not from paths.
const cam = {yaw: -0.7, pitch: 0.28, s: 0.9};
const cols = Array.from({length: 12}, (_, i) => (
  <Cylinder key={i} base={[-330 + i * 60, -40, 60]} r={16} h={150} segments={18} cam={cam} color={ink} w={1} op={0.85} />
));
// ... plus <Box3> for the roof slab, the architrave and the crepidoma.

// The solids, straight from the kit
<Poly verts={SOLIDS.ico.verts} edges={SOLIDS.ico.edges} cam={{yaw: 0.4, pitch: 0.35, s: 60}} color={ink} w={1.5} />

// A crowd
<Marks x={140} y={320} cols={64} rows={16} pitch={16} seed={7} kind="tick" color={ink} op={0.7}
       alpha={(c, r) => 1 - Math.abs(r - 8) / 12} />

// Headphones, at hero size
<Headphones x={420} y={180} s={2.2} color={Tokens.ink} accent={Tokens.accent} />
```

## When to import a picture

Organic subjects (a human face, a product photo, a logo) are not worth drawing in code. Use
`Picture` with an asset in `public/assets/<slug>/`, and record it in the project's `MANIFEST.md`:

```
| file | source | licence |
|---|---|---|
| headphones.png | user-provided | CC0 |
```

Rules: the asset's visible text counts as on-screen text (English-only gate); never use stock assets
without a licence note; the toolkit's own sample films stay fully code-drawn.

## Anti-patterns

- A big abstract shape with a caption doing the work ("MUSIC" over a sine wave).
- Drawing an object at 40px where its identifying detail disappears.
- Reusing a symbol that means something else (a ring for both a cup and a lens).
- Adding 3D projection to a subject that reads better flat (icons, UI, diagrams).
