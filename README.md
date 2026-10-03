# Mechanism Illustration Skill

A Codex Skill and dependency-free SVG renderer for turning documented workflows into consistent bilingual mechanism illustrations.

![Mechanism Illustration workflow from contract to verified bilingual output](examples/mechanism-illustration.en.svg)

*The Skill's own workflow, rendered deterministically from [`templates/mechanism-illustration.json`](templates/mechanism-illustration.json). The same art layer also produces a [Chinese version](examples/mechanism-illustration.zh.svg).*

## What it does

- extracts a small mechanism contract before drawing;
- separates the reusable art layer from Chinese and English text layers;
- renders deterministic `art.svg`, `zh.svg`, and `en.svg` files from JSON;
- includes Pipeline, Filter, Loop, Before/After, and Dual Loop grammars instead of forcing every mechanism into one row of steps;
- includes a second Editorial Field Map visual family for essays and conceptual writing;
- keeps generated explainers separate from product evidence;
- supports ImageGen-based pictogram exploration when a custom art layer is needed.

## Quick start

```bash
npm test
npm run render:examples
node scripts/render.mjs templates/telegram-miniapp.json dist
```

The renderer uses only Node.js built-ins. Copy a template, replace the documented stages and labels, then render both languages.

Use `layout: "pipeline"` for ordered stages. Use `layout: "filter"` when many possible inputs become a smaller relevant set. Use `layout: "loop"` when a response changes the next cycle. Use `before-after` when the structural difference is the argument, and `dual-loop` when two cycles operate on different time horizons.

## Layout grammars

Pipeline keeps a strict order. Filter makes the reduction from many possible inputs to a small relevant set visible. Loop closes the last state back into the first trigger and makes the changed next cycle the center of the composition.

![Filter layout example based on Cairn Context](examples/cairn-filter.en.svg)

![Loop layout example based on an Agent feedback cycle](examples/agent-feedback-loop.en.svg)

The original Telegram deployment example remains available in [English](examples/telegram-miniapp.en.svg) and [Chinese](examples/telegram-miniapp.zh.svg).

### Editorial Field Map

![Before/After example from the AI applications essay](examples/ai-applications-before-after.en.svg)

![Dual Loop example from Two Flywheels](examples/two-flywheels.en.svg)

## Use as a Codex Skill

Install or link this directory as `mechanism-illustration` in your Codex skills folder, then invoke `$mechanism-illustration`. Repository owners can also vendor the directory and route matching tasks to `SKILL.md` from their `AGENTS.md`.

See [README.zh-CN.md](README.zh-CN.md) for Chinese documentation.
