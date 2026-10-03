# Style system and prompt recipes

## Visual grammar

The target feels like a thoughtful person explaining a system on a presentation board:

- white field with generous empty space;
- controlled black marker-like linework;
- simple, original flat pictograms;
- arrows that carry the causal explanation;
- compact hand-lettered headings and short annotations;
- slightly informal spacing without losing alignment;
- no glossy corporate polish.

Use semantic color consistently:

- near-black: structure, labels, and arrows;
- moss green: confirmed, selected, passed, or verified;
- vermilion red: correction, failure, warning, or changed content;
- one restrained project color: the core system or transformation;
- quiet gray: inactive, unavailable, or unselected states.

Avoid photorealism, 3D, gradients, glass, brand logos, trademarked interfaces, decorative backgrounds, tiny screenshots, fabricated metrics, and watermarks.

## Generation prompt

```text
Use case: infographic-diagram
Asset type: 16:9 mechanism illustration for [DESTINATION]
Input images: Image 1 is a visual-language reference only. Learn its human-made presentation-board energy, clear arrows, flat pictograms, annotated systems thinking, and generous white space. Do not copy its contents, logos, characters, or exact composition.
Primary request: Explain this documented mechanism as one clear [PIPELINE | FILTER | LOOP | BEFORE/AFTER]: [FLOW]. Show [LOOP] only because it is documented.
Style/medium: crisp flat raster infographic, controlled marker-like black linework, simple original pictograms, sparse annotation, visually intelligent but intentionally not corporate-polished.
Composition/framing: landscape 16:9, white field, three to five connected stages, one dominant reading path, generous margins.
Color palette: near-black for structure; moss green for verified states; vermilion for corrections or failures; [PROJECT COLOR] for the core system; quiet gray for inactive states.
Text (verbatim): "[LABEL 1]", "[LABEL 2]", "[LABEL 3]", "[LABEL 4]"
Constraints: all text must be exact and readable; preserve the human decision before AI action; no invented features or metrics; no logos; no trademarked interface; no photorealism; no 3D; no gradients; no watermark.
```

## Localization prompt

```text
Use case: text-localization
Asset type: [LANGUAGE]-localized mechanism illustration
Input images: Image 1 is the edit target.
Primary request: Replace every source-language label with the exact target-language text below. Change only the text. Preserve the canvas size, layout, spacing, arrows, icons, line weights, colors, panels, and background.
Text replacements (verbatim):
"[SOURCE 1]" -> "[TARGET 1]"
"[SOURCE 2]" -> "[TARGET 2]"
Typography: preserve the bold hand-lettered title style and smaller annotation style, adapted naturally for the target language.
Constraints: use the translations verbatim; do not add, remove, move, or redraw diagram elements; no watermark.
```

## Content-density rules

- Prefer three to five stages; six is the upper limit.
- Prefer one to three words per heading.
- Prefer three checklist items per stage.
- Put long explanations in the page caption, not the bitmap.
- At mobile card size, stage headings and primary arrows must remain legible even if annotations become secondary.
- For more than seven labels or more than one recurring language, generate a text-free art layer and overlay text deterministically. This is the production path; full-image localization is the fast preview path.

## Existing site examples

- Resume.AI: materials -> user chooses Context -> rewrite -> Diff review -> export.
- Cairn Context: decisions -> relevance filter -> task Context -> Agent, with correction returning as revision.
- Telegram Mini App Fastbuild: Bot -> code -> three services -> Webhook -> public link, with verification and failure checkpoints.
