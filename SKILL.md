---
name: mechanism-illustration
description: Turn a documented product, workflow, system, or idea into a consistent human-made mechanism illustration, and localize an existing illustration without changing its structure. Use for portfolio project images, explainers, process diagrams, architecture-lite visuals, operating-model diagrams, or bilingual variants. Do not use for evidence screenshots, precise technical architecture, quantitative charts, or decorative hero art.
---

# Mechanism Illustration

Create an explanatory image that makes one mechanism understandable at a glance. The image explains; it never proves that a feature, metric, or outcome exists.

Read [references/style-system.md](references/style-system.md) before generating or localizing an image.

For a complete localization example with an exact replacement map, read [references/example-telegram-zh.md](references/example-telegram-zh.md).

## Build the mechanism contract first

Extract only documented facts:

- trigger or starting input;
- three to five stages;
- the decision that remains with a person;
- final output;
- a failure, feedback, or revision loop only when documented;
- exact short labels;
- evidence that must remain separate from the illustration.

If the source does not establish one of these, omit it. Do not infer product features from a name or category. Ask one question only when the missing mechanism would materially change the diagram.

Write the contract in this form before prompting the image model:

```yaml
purpose: what the viewer should understand
flow: start -> stage -> human decision -> stage -> output
loop: optional documented failure, feedback, or revision path
labels: exact visible words
color_roles:
  verified: green
  correction_or_failure: red
  core_system: one project color
evidence_boundary: what this image must not imply
```

## Choose one diagram grammar

- **Pipeline:** a sequence that must happen in order.
- **Filter:** many inputs become a smaller relevant set.
- **Loop:** output or correction changes the next cycle.
- **Before / after:** an old path and a changed path, only when the comparison is the point.

Use one dominant grammar. A secondary loop is allowed; competing main paths are not.

## Generate

Use the built-in image generation tool in `infographic-diagram` mode. Use one call per distinct asset. A supplied image is a style reference unless the user explicitly asks to edit it.

Keep the output landscape 16:9 with one reading path, three to five large stages, generous white space, and no more than seven short labels. Use pictograms for concrete nouns and arrows for state change. Put explanations in the surrounding page when they do not need to be inside the image.

Choose the text strategy before generating:

- **Direct bitmap text:** acceptable for one language and no more than seven short labels.
- **Deterministic text layer:** required for repeated templates, dense annotations, several languages, or text that must be exact. Generate the pictogram and connector layer without text, then add labels in SVG, HTML, Figma, or another deterministic layout surface.

## Localize

Treat localization as `text-localization`, not a new generation. Provide a complete `source -> target` map, preserve every non-text element, and require the target strings verbatim. Keep established technical terms such as Agent, Context, Webhook, API, or RAG when translation would reduce precision.

For recurring multilingual output, keep one shared art layer and one language-specific text layer. Do not separately regenerate the whole diagram for every language unless the user explicitly prefers the looser visual variation.

## Verify before delivery

Inspect the actual output, not just the prompt. Reject or repair when any condition fails:

1. the reading order is not obvious in three seconds;
2. a label is missing, misspelled, or too small at the intended display size;
3. the picture adds an undocumented step, result, metric, or capability;
4. green and red lose their semantic roles;
5. the human decision disappears before an AI action;
6. localization changes layout, icons, arrows, or meaning;
7. the asset overflows or becomes unreadable at the target page width.

Make one targeted repair at a time. After two text-repair attempts, shorten labels or move detail into an HTML caption instead of repeatedly regenerating the full image.

## Publish without confusing explanation and evidence

Save final assets inside the consuming project. Use mechanism illustrations on index or overview surfaces. On detail pages, label them as explanatory and keep a real product, document, repository, or source screenshot as separate evidence. Never describe a generated illustration as a product screenshot.
