#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const [, , specPath, outputDir = 'dist'] = process.argv;
if (!specPath) {
  console.error('Usage: node scripts/render.mjs <template.json> [output-directory]');
  process.exit(1);
}

const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const width = 1600;
const height = 900;
const stageWidth = 278;
const gap = 34;
const startX = 36;
const stageY = 122;
const stageHeight = 590;
const palette = {
  ink: '#151815',
  line: '#151815',
  verified: '#579260',
  verifiedSoft: '#e4f1e5',
  failure: '#d95335',
  inactive: '#a9afaa',
  surface: '#ffffff',
  quiet: '#f3f5f1',
  core: spec.colors?.core ?? '#73c6d4',
  coreSoft: spec.colors?.coreSoft ?? '#e5f5f7',
};

if (!Array.isArray(spec.stages) || spec.stages.length < 3 || spec.stages.length > 5) {
  throw new Error('templates require 3–5 stages');
}

const esc = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

function check(x, y) {
  return `<g><rect x="${x}" y="${y}" width="28" height="28" rx="4" fill="${palette.verified}"/><path d="M${x + 7} ${y + 14}l5 5 10-12" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></g>`;
}

function warning(x, y) {
  return `<g><path d="M14 0l14 26H0z" transform="translate(${x} ${y})" fill="none" stroke="${palette.failure}" stroke-width="4" stroke-linejoin="round"/><path d="M${x + 14} ${y + 8}v8M${x + 14} ${y + 21}v1" stroke="${palette.failure}" stroke-width="4" stroke-linecap="round"/></g>`;
}

function icon(name, cx, cy) {
  const s = `stroke="${palette.ink}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"`;
  const common = `fill="none" ${s}`;
  const doc = `<path d="M${cx - 42} ${cy - 62}h58l28 28v96h-86z" fill="#fff" ${s}/><path d="M${cx + 16} ${cy - 62}v28h28M${cx - 24} ${cy - 15}h48M${cx - 24} ${cy + 6}h48M${cx - 24} ${cy + 27}h34" ${common}/>`;
  const icons = {
    document: doc,
    export: `${doc}<circle cx="${cx + 42}" cy="${cy + 45}" r="28" fill="${palette.verified}"/><path d="M${cx + 42} ${cy + 28}v28m0 0-11-11m11 11 11-11" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`,
    select: `<rect x="${cx - 70}" y="${cy - 60}" width="140" height="120" rx="14" fill="${palette.verifiedSoft}" ${s}/>${check(cx - 54, cy - 40)}${check(cx - 54, cy + 5)}<path d="M${cx - 10} ${cy - 25}h58M${cx - 10} ${cy + 20}h58" ${common}/><path d="M${cx + 28} ${cy + 46}l28 35 5-22 22-5z" fill="#fff" ${s}/>` ,
    agent: `<rect x="${cx - 66}" y="${cy - 48}" width="132" height="105" rx="38" fill="${palette.coreSoft}" ${s}/><path d="M${cx} ${cy - 48}v-25m-10 0h20" ${common}/><circle cx="${cx - 26}" cy="${cy - 2}" r="7" fill="${palette.ink}"/><circle cx="${cx + 26}" cy="${cy - 2}" r="7" fill="${palette.ink}"/><path d="M${cx - 25} ${cy + 25}q25 18 50 0" ${common}/><path d="M${cx - 83} ${cy - 10}v45M${cx + 83} ${cy - 10}v45" ${common}/>` ,
    diff: `<rect x="${cx - 76}" y="${cy - 58}" width="152" height="116" rx="10" fill="#fff" ${s}/><path d="M${cx} ${cy - 58}v116M${cx - 58} ${cy - 30}h39M${cx - 58} ${cy - 5}h44M${cx - 58} ${cy + 20}h32" ${common}/><path d="M${cx + 17} ${cy - 30}h42M${cx + 17} ${cy - 5}h33M${cx + 17} ${cy + 20}h45" fill="none" stroke="${palette.failure}" stroke-width="6" stroke-linecap="round"/>`,
    database: `<ellipse cx="${cx}" cy="${cy - 48}" rx="62" ry="24" fill="${palette.core}" ${s}/><path d="M${cx - 62} ${cy - 48}v96c0 13 28 24 62 24s62-11 62-24v-96M${cx - 62} ${cy - 2}c0 13 28 24 62 24s62-11 62-24M${cx - 62} ${cy + 35}c0 13 28 24 62 24s62-11 62-24" fill="${palette.coreSoft}" ${s}/>` ,
    filter: `<path d="M${cx - 76} ${cy - 62}H${cx + 76}L${cx + 24} ${cy + 2}V${cy + 50}L${cx - 24} ${cy + 72}V${cy + 2}Z" fill="${palette.coreSoft}" ${s}/><circle cx="${cx - 42}" cy="${cy - 25}" r="8" fill="${palette.verified}"/><circle cx="${cx}" cy="${cy - 25}" r="8" fill="${palette.verified}"/><circle cx="${cx + 42}" cy="${cy - 25}" r="8" fill="${palette.inactive}"/>`,
    context: `<rect x="${cx - 72}" y="${cy - 62}" width="144" height="124" rx="14" fill="${palette.coreSoft}" ${s}/>${check(cx - 55, cy - 40)}${check(cx - 55, cy + 2)}<path d="M${cx - 12} ${cy - 27}h62M${cx - 12} ${cy + 15}h62" ${common}/>` ,
    bot: `<rect x="${cx - 66}" y="${cy - 40}" width="132" height="96" rx="36" fill="${palette.coreSoft}" ${s}/><path d="M${cx} ${cy - 40}v-28m-9 0h18" ${common}/><circle cx="${cx - 25}" cy="${cy + 3}" r="7" fill="${palette.ink}"/><circle cx="${cx + 25}" cy="${cy + 3}" r="7" fill="${palette.ink}"/><path d="M${cx - 30} ${cy + 30}h60" ${common}/><circle cx="${cx + 72}" cy="${cy + 44}" r="22" fill="#fff" ${s}/><path d="M${cx + 72} ${cy + 31}v26M${cx + 59} ${cy + 44}h26" ${common}/>` ,
    code: `<rect x="${cx - 75}" y="${cy - 55}" width="150" height="105" rx="10" fill="${palette.coreSoft}" ${s}/><path d="M${cx - 28} ${cy - 10}l-22 20 22 20M${cx + 28} ${cy - 10}l22 20-22 20M${cx + 10} ${cy - 22}l-20 60" ${common}/><path d="M${cx - 92} ${cy + 65}h184" ${common}/>` ,
    services: `<rect x="${cx - 76}" y="${cy - 66}" width="152" height="40" rx="8" fill="#fff" ${s}/><rect x="${cx - 76}" y="${cy - 14}" width="152" height="40" rx="8" fill="#fff" ${s}/><rect x="${cx - 76}" y="${cy + 38}" width="152" height="40" rx="8" fill="#fff" ${s}/><circle cx="${cx + 52}" cy="${cy - 46}" r="9" fill="${palette.verified}"/><circle cx="${cx + 52}" cy="${cy + 6}" r="9" fill="${palette.verified}"/><circle cx="${cx + 52}" cy="${cy + 58}" r="9" fill="${palette.verified}"/>`,
    webhook: `<path d="M${cx - 72} ${cy + 22}q4-54 56-48 19-45 61-18 42-4 43 39 25 5 25 31 0 28-31 29H${cx - 58}q-26 0-26-23 0-8 12-10z" fill="${palette.coreSoft}" ${s}/><circle cx="${cx + 48}" cy="${cy + 42}" r="28" fill="#fff" ${s}/><path d="M${cx + 48} ${cy + 25}v34M${cx + 31} ${cy + 42}h34" ${common}/>` ,
    phone: `<rect x="${cx - 48}" y="${cy - 72}" width="96" height="144" rx="16" fill="#fff" ${s}/><rect x="${cx - 32}" y="${cy - 45}" width="64" height="42" rx="5" fill="${palette.core}"/><path d="M${cx - 27} ${cy + 17}h54M${cx - 27} ${cy + 39}h40" ${common}/><circle cx="${cx}" cy="${cy + 58}" r="5" fill="${palette.ink}"/>`,
  };
  return icons[name] ?? icons.document;
}

function wrap(text, max) {
  const value = String(text ?? '');
  if (!value.includes(' ')) return value.match(new RegExp(`.{1,${max}}`, 'g')) ?? [''];
  const words = value.split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > max && line) { lines.push(line); line = word; }
    else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

function textBlock(x, y, text, { size = 18, weight = 560, color = palette.ink, anchor = 'start', max = 24, lineHeight = 1.25 } = {}) {
  const lines = wrap(text, max).slice(0, 3);
  return `<text x="${x}" y="${y}" fill="${color}" font-family="Arial, PingFang SC, Microsoft YaHei, sans-serif" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}">${lines.map((line, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : size * lineHeight}">${esc(line)}</tspan>`).join('')}</text>`;
}

function renderArt() {
  const stages = spec.stages.map((stage, index) => {
    const x = startX + index * (stageWidth + gap);
    const center = x + stageWidth / 2;
    const arrow = index < spec.stages.length - 1
      ? `<path d="M${x + stageWidth + 6} 305h${gap - 12}" stroke="${palette.line}" stroke-width="5" stroke-linecap="round"/><path d="M${x + stageWidth + gap - 14} 294l12 11-12 11" fill="none" stroke="${palette.line}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`
      : '';
    const itemChecks = (stage.items ?? []).map((_, itemIndex) => check(x + 22, 374 + itemIndex * 48)).join('');
    const warn = (stage.warnings ?? []).length ? warning(x + 23, 525) : '';
    return `<g id="stage-${esc(stage.id)}"><rect x="${x}" y="${stageY}" width="${stageWidth}" height="${stageHeight}" rx="22" fill="${palette.surface}" stroke="${palette.line}" stroke-width="4"/><rect x="${x + 38}" y="${stageY - 24}" width="${stageWidth - 76}" height="56" rx="18" fill="${palette.verifiedSoft}"/>${icon(stage.icon, center, 265)}${itemChecks}${warn}${arrow}</g>`;
  }).join('');
  const loop = spec.loop ? `<path d="M${startX + (spec.stages.length - 1) * (stageWidth + gap) + stageWidth - 26} 746v50H${startX + 26}v-50" fill="none" stroke="${spec.loop.kind === 'failure' ? palette.failure : palette.line}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M${startX + 16} 758l10-14 10 14" fill="none" stroke="${spec.loop.kind === 'failure' ? palette.failure : palette.line}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>` : '';
  return `<g id="art-layer"><rect width="${width}" height="${height}" fill="#fff"/>${stages}${loop}</g>`;
}

function renderText(lang) {
  const stages = spec.stages.map((stage, index) => {
    const x = startX + index * (stageWidth + gap);
    const center = x + stageWidth / 2;
    const title = stage.title?.[lang] ?? stage.title?.en ?? '';
    const items = (stage.items ?? []).map((item, itemIndex) => textBlock(x + 62, 395 + itemIndex * 48, item[lang] ?? item.en, { size: 17, max: lang === 'zh' ? 12 : 24 })).join('');
    const warnings = (stage.warnings ?? []).map((item, itemIndex) => textBlock(x + 63, 546 + itemIndex * 38, item[lang] ?? item.en, { size: 16, color: palette.failure, max: lang === 'zh' ? 12 : 25 })).join('');
    return `<g id="stage-${esc(stage.id)}-text">${textBlock(center, stageY + 12, title, { size: 25, weight: 760, anchor: 'middle', max: lang === 'zh' ? 8 : 15 })}${items}${warnings}</g>`;
  }).join('');
  const loopLabel = spec.loop ? textBlock(width / 2, 838, spec.loop.label?.[lang] ?? spec.loop.label?.en ?? '', { size: 25, weight: 760, color: spec.loop.kind === 'failure' ? palette.failure : palette.verified, anchor: 'middle', max: 22 }) : '';
  return `<g id="text-layer" data-language="${lang}">${stages}${loopLabel}</g>`;
}

function svg(body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img">${body}</svg>\n`;
}

fs.mkdirSync(outputDir, { recursive: true });
const art = renderArt();
fs.writeFileSync(path.join(outputDir, `${spec.slug}.art.svg`), svg(art));
for (const lang of ['zh', 'en']) {
  fs.writeFileSync(path.join(outputDir, `${spec.slug}.${lang}.svg`), svg(`${art}${renderText(lang)}`));
}
console.log(JSON.stringify({ ok: true, slug: spec.slug, outputs: ['art', 'zh', 'en'].map((suffix) => path.join(outputDir, `${spec.slug}.${suffix}.svg`)) }, null, 2));
