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
const layout = spec.layout ?? 'pipeline';
const width = 1600;
const height = 900;
const compactPipeline = layout === 'pipeline' && spec.stages?.length === 3;
const stageWidth = compactPipeline ? 420 : 278;
const gap = compactPipeline ? 60 : 34;
const startX = compactPipeline ? (width - (stageWidth * 3 + gap * 2)) / 2 : 36;
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

if (layout === 'dual-loop') {
  if (!Array.isArray(spec.loops) || spec.loops.length !== 2 || spec.loops.some((loop) => !Array.isArray(loop.stages) || loop.stages.length !== 3)) {
    throw new Error('dual-loop layout requires two loops with three stages each');
  }
} else if (layout === 'branch') {
  if (!Array.isArray(spec.stages) || spec.stages.length !== 3 || !Array.isArray(spec.branches) || spec.branches.length !== 3) {
    throw new Error('branch layout requires three stages and three branches');
  }
} else if (!Array.isArray(spec.stages) || spec.stages.length < 3 || spec.stages.length > 5) {
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

function renderPipelineArt() {
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

function renderPipelineText(lang) {
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

const filterCenters = [185, 500, 815, 1130, 1415];
const filterWidths = [285, 235, 250, 220, 220];

function renderFilterArt() {
  if (spec.stages.length !== 5) throw new Error('filter layout requires exactly 5 stages');
  const arrows = filterCenters.slice(0, -1).map((center, index) => {
    const from = center + filterWidths[index] / 2 + 12;
    const to = filterCenters[index + 1] - filterWidths[index + 1] / 2 - 12;
    return `<path d="M${from} 310H${to}" stroke="${palette.line}" stroke-width="5" stroke-linecap="round"/><path d="M${to - 13} 299l12 11-12 11" fill="none" stroke="${palette.line}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
  }).join('');
  const stages = spec.stages.map((stage, index) => {
    const center = filterCenters[index];
    const w = filterWidths[index];
    const x = center - w / 2;
    const items = (stage.items ?? []).map((_, itemIndex) => check(x + 8, 445 + itemIndex * 47)).join('');
    const surface = index === 0 || index === 2
      ? `<rect x="${x}" y="150" width="${w}" height="515" rx="24" fill="${index === 2 ? palette.coreSoft : palette.quiet}" stroke="${palette.line}" stroke-width="4"/>`
      : '';
    const titleTab = `<rect x="${center - Math.min(w - 18, 210) / 2}" y="112" width="${Math.min(w - 18, 210)}" height="56" rx="18" fill="${palette.verifiedSoft}"/>`;
    const inputCards = index === 0 ? [-72, -34, 4, 42].map((dy, i) => `<rect x="${x + 25 + (i % 2) * 126}" y="${218 + dy}" width="108" height="34" rx="7" fill="#fff" stroke="${i < 2 ? palette.verified : palette.inactive}" stroke-width="3"/><circle cx="${x + 42 + (i % 2) * 126}" cy="${235 + dy}" r="6" fill="${i < 2 ? palette.verified : palette.inactive}"/><path d="M${x + 55 + (i % 2) * 126} ${235 + dy}h54" stroke="${palette.inactive}" stroke-width="4" stroke-linecap="round"/>`).join('') : '';
    return `<g id="filter-stage-${esc(stage.id)}">${surface}${titleTab}${inputCards}${icon(stage.icon, center, 320)}${items}</g>`;
  }).join('');
  const loop = `<path d="M${filterCenters[4]} 710v90H${filterCenters[0]}v-90" fill="none" stroke="${palette.failure}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M${filterCenters[0] - 11} 724l11-14 11 14" fill="none" stroke="${palette.failure}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
  return `<g id="art-layer" data-layout="filter"><rect width="${width}" height="${height}" fill="#fff"/>${stages}${arrows}${loop}</g>`;
}

function renderFilterText(lang) {
  const stages = spec.stages.map((stage, index) => {
    const center = filterCenters[index];
    const w = filterWidths[index];
    const x = center - w / 2;
    const title = stage.title?.[lang] ?? stage.title?.en ?? '';
    const items = (stage.items ?? []).map((item, itemIndex) => textBlock(x + 48, 466 + itemIndex * 47, item[lang] ?? item.en, { size: 16, max: lang === 'zh' ? 10 : 20 })).join('');
    return `<g id="filter-stage-${esc(stage.id)}-text">${textBlock(center, 145, title, { size: 23, weight: 760, anchor: 'middle', max: lang === 'zh' ? 8 : 14 })}${items}</g>`;
  }).join('');
  const loopLabel = textBlock(width / 2, 842, spec.loop?.label?.[lang] ?? spec.loop?.label?.en ?? '', { size: 24, weight: 760, color: palette.failure, anchor: 'middle', max: 24 });
  return `<g id="text-layer" data-language="${lang}" data-layout="filter">${stages}${loopLabel}</g>`;
}

const loopPositions = [
  { x: 70, y: 330, w: 250, h: 230 },
  { x: 370, y: 80, w: 250, h: 230 },
  { x: 980, y: 80, w: 250, h: 230 },
  { x: 1280, y: 330, w: 250, h: 230 },
  { x: 675, y: 590, w: 250, h: 230 },
];

function arrowLine(x1, y1, x2, y2, color = palette.line) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const size = 14;
  const ax = x2 - Math.cos(angle) * size;
  const ay = y2 - Math.sin(angle) * size;
  const leftX = ax + Math.cos(angle + Math.PI / 2) * 10;
  const leftY = ay + Math.sin(angle + Math.PI / 2) * 10;
  const rightX = ax + Math.cos(angle - Math.PI / 2) * 10;
  const rightY = ay + Math.sin(angle - Math.PI / 2) * 10;
  return `<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round"/><path d="M${leftX} ${leftY}L${x2} ${y2}L${rightX} ${rightY}" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
}

function renderLoopArt() {
  if (spec.stages.length !== 5) throw new Error('loop layout requires exactly 5 stages');
  const stages = spec.stages.map((stage, index) => {
    const pos = loopPositions[index];
    const centerX = pos.x + pos.w / 2;
    const iconY = index === 4 ? pos.y + 70 : pos.y + 95;
    const itemChecks = (stage.items ?? []).slice(0, 2).map((_, itemIndex) => check(pos.x + 14, pos.y + 158 + itemIndex * 32)).join('');
    return `<g id="loop-stage-${esc(stage.id)}"><rect x="${pos.x}" y="${pos.y}" width="${pos.w}" height="${pos.h}" rx="22" fill="#fff" stroke="${palette.line}" stroke-width="4"/><rect x="${pos.x + 28}" y="${pos.y - 22}" width="${pos.w - 56}" height="52" rx="17" fill="${palette.verifiedSoft}"/>${icon(stage.icon, centerX, iconY)}${itemChecks}</g>`;
  }).join('');
  const arrows = [
    arrowLine(305, 350, 398, 280),
    arrowLine(630, 195, 965, 195),
    arrowLine(1205, 280, 1295, 350),
    arrowLine(1300, 565, 930, 650),
    arrowLine(670, 650, 300, 565),
  ].join('');
  const center = `<g><circle cx="800" cy="440" r="125" fill="${palette.coreSoft}" stroke="${palette.line}" stroke-width="4"/><circle cx="800" cy="440" r="92" fill="#fff" stroke="${palette.verified}" stroke-width="4" stroke-dasharray="10 10"/></g>`;
  return `<g id="art-layer" data-layout="loop"><rect width="${width}" height="${height}" fill="#fff"/>${center}${arrows}${stages}</g>`;
}

function renderLoopText(lang) {
  const stages = spec.stages.map((stage, index) => {
    const pos = loopPositions[index];
    const centerX = pos.x + pos.w / 2;
    const title = stage.title?.[lang] ?? stage.title?.en ?? '';
    const items = (stage.items ?? []).slice(0, 2).map((item, itemIndex) => textBlock(pos.x + 54, pos.y + 179 + itemIndex * 32, item[lang] ?? item.en, { size: 14, max: lang === 'zh' ? 9 : 18, lineHeight: 1.08 })).join('');
    return `<g id="loop-stage-${esc(stage.id)}-text">${textBlock(centerX, pos.y + 9, title, { size: 22, weight: 760, anchor: 'middle', max: lang === 'zh' ? 8 : 14 })}${items}</g>`;
  }).join('');
  const centerLabel = textBlock(800, 426, spec.centerLabel?.[lang] ?? spec.centerLabel?.en ?? '', { size: 28, weight: 760, color: palette.verified, anchor: 'middle', max: lang === 'zh' ? 8 : 16, lineHeight: 1.15 });
  return `<g id="text-layer" data-language="${lang}" data-layout="loop">${stages}${centerLabel}</g>`;
}

const branchStageCenters = [[180, 450], [500, 450], [820, 450]];
const branchOutcomeCenters = [[1260, 190], [1380, 450], [1260, 710]];

function renderBranchArt() {
  const stageArt = spec.stages.map((stage, index) => {
    const [x, y] = branchStageCenters[index];
    const fill = index === 2 ? palette.coreSoft : palette.quiet;
    return `<g id="branch-stage-${esc(stage.id)}"><circle cx="${x}" cy="${y}" r="92" fill="${fill}" stroke="${palette.line}" stroke-width="4"/>${icon(stage.icon, x, y)}</g>`;
  }).join('');
  const stageArrows = `${arrowLine(275, 450, 405, 450)}${arrowLine(595, 450, 725, 450)}${arrowLine(915, 450, 965, 450, palette.verified)}`;
  const branchArt = spec.branches.map((branch, index) => {
    const [x, y] = branchOutcomeCenters[index];
    const fills = [palette.verifiedSoft, palette.coreSoft, '#fff0eb'];
    return `<g id="branch-outcome-${esc(branch.id)}"><circle cx="${x}" cy="${y}" r="86" fill="${fills[index]}" stroke="${palette.line}" stroke-width="4"/>${icon(branch.icon, x, y)}</g>`;
  }).join('');
  const branchArrows = `${arrowLine(978, 438, 1174, 215, palette.verified)}${arrowLine(985, 450, 1290, 450, palette.core)}${arrowLine(978, 462, 1174, 685, palette.failure)}`;
  return `<g id="art-layer" data-layout="branch" data-style="editorial"><rect width="${width}" height="${height}" fill="#fff"/>${stageArt}${stageArrows}<circle cx="975" cy="450" r="18" fill="${palette.ink}"/>${branchArrows}${branchArt}</g>`;
}

function renderBranchText(lang) {
  const stages = spec.stages.map((stage, index) => {
    const [x] = branchStageCenters[index];
    const title = stage.title?.[lang] ?? stage.title?.en ?? '';
    const note = stage.note?.[lang] ?? stage.note?.en ?? '';
    return `<g id="branch-stage-${esc(stage.id)}-text">${textBlock(x, 580, title, { size: 24, weight: 760, anchor: 'middle', max: lang === 'zh' ? 8 : 15 })}${textBlock(x, 620, note, { size: 16, color: palette.inactive, anchor: 'middle', max: lang === 'zh' ? 12 : 24 })}</g>`;
  }).join('');
  const branches = spec.branches.map((branch, index) => {
    const [x, y] = branchOutcomeCenters[index];
    const title = branch.title?.[lang] ?? branch.title?.en ?? '';
    const note = branch.note?.[lang] ?? branch.note?.en ?? '';
    const titleY = y + 118;
    return `<g id="branch-outcome-${esc(branch.id)}-text">${textBlock(x, titleY, title, { size: 25, weight: 760, anchor: 'middle', max: lang === 'zh' ? 8 : 15 })}${textBlock(x, titleY + 34, note, { size: 15, color: palette.inactive, anchor: 'middle', max: lang === 'zh' ? 13 : 27, lineHeight: 1.15 })}</g>`;
  }).join('');
  const statement = textBlock(800, 85, spec.centerLabel?.[lang] ?? spec.centerLabel?.en ?? '', { size: 29, weight: 760, color: palette.verified, anchor: 'middle', max: lang === 'zh' ? 24 : 52 });
  return `<g id="text-layer" data-language="${lang}" data-layout="branch" data-style="editorial">${statement}${stages}${branches}</g>`;
}

const beforeAfterCenters = [210, 590, 1010, 1390];

function renderBeforeAfterArt() {
  if (spec.stages.length !== 4) throw new Error('before-after layout requires exactly 4 stages');
  const stages = spec.stages.map((stage, index) => {
    const center = beforeAfterCenters[index];
    const fill = index < 2 ? palette.quiet : palette.coreSoft;
    const bullets = (stage.items ?? []).slice(0, 2).map((_, itemIndex) => `<circle cx="${center - 106}" cy="${545 + itemIndex * 38}" r="7" fill="${index < 2 ? palette.inactive : palette.verified}"/>`).join('');
    return `<g id="before-after-stage-${esc(stage.id)}"><circle cx="${center}" cy="335" r="116" fill="${fill}"/>${icon(stage.icon, center, 335)}${bullets}</g>`;
  }).join('');
  const leftArrow = arrowLine(335, 335, 465, 335, palette.inactive);
  const rightArrow = arrowLine(1135, 335, 1265, 335, palette.verified);
  return `<g id="art-layer" data-layout="before-after" data-style="editorial"><rect width="${width}" height="${height}" fill="#fff"/><path d="M800 80v700" stroke="${palette.line}" stroke-width="2"/><path d="M50 230h690" stroke="${palette.inactive}" stroke-width="3"/><path d="M860 230h690" stroke="${palette.verified}" stroke-width="3"/>${stages}${leftArrow}${rightArrow}</g>`;
}

function renderBeforeAfterText(lang) {
  const sideBefore = spec.sides?.before ?? {};
  const sideAfter = spec.sides?.after ?? {};
  const sideHeading = (x, side, noteColor) => {
    const label = side.label?.[lang] ?? side.label?.en ?? '';
    const note = side.note?.[lang] ?? side.note?.en ?? '';
    const labelLines = wrap(label, 24).slice(0, 3);
    const noteY = 105 + (labelLines.length - 1) * 34 * 1.25 + 34;
    return `${textBlock(x, 105, label, { size: 34, weight: 760, color: palette.ink, max: 24 })}${textBlock(x, noteY, note, { size: 16, color: noteColor, max: lang === 'zh' ? 28 : 60 })}`;
  };
  const stages = spec.stages.map((stage, index) => {
    const center = beforeAfterCenters[index];
    const title = stage.title?.[lang] ?? stage.title?.en ?? '';
    const items = (stage.items ?? []).slice(0, 2).map((item, itemIndex) => textBlock(center - 88, 551 + itemIndex * 38, item[lang] ?? item.en, { size: 17, max: lang === 'zh' ? 11 : 23 })).join('');
    return `<g id="before-after-stage-${esc(stage.id)}-text">${textBlock(center, 485, title, { size: 24, weight: 760, anchor: 'middle', max: lang === 'zh' ? 9 : 16 })}${items}</g>`;
  }).join('');
  const headings = `${sideHeading(50, sideBefore, palette.inactive)}${sideHeading(860, sideAfter, palette.verified)}`;
  const statement = textBlock(800, 835, spec.centerLabel?.[lang] ?? spec.centerLabel?.en ?? '', { size: 24, weight: 700, color: palette.failure, anchor: 'middle', max: lang === 'zh' ? 24 : 55 });
  return `<g id="text-layer" data-language="${lang}" data-layout="before-after" data-style="editorial">${headings}${stages}${statement}</g>`;
}

const dualLoopNodes = [
  [[400, 185], [600, 430], [250, 620]],
  [[1200, 185], [1400, 430], [1050, 620]],
];

function renderDualLoopArt() {
  const defs = `<defs>${spec.loops.map((loop, index) => `<marker id="dual-arrow-${index}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0l10 5-10 5z" fill="${loop.color}"/></marker>`).join('')}</defs>`;
  const loops = spec.loops.map((loop, index) => {
    const nodes = dualLoopNodes[index];
    const [a, b, c] = nodes;
    const paths = index === 0
      ? `<path d="M${a[0] + 70} ${a[1] + 15}Q${b[0]} ${a[1] + 40} ${b[0]} ${b[1] - 70}" fill="none" stroke="${loop.color}" stroke-width="12" marker-end="url(#dual-arrow-${index})"/><path d="M${b[0] - 10} ${b[1] + 72}Q${b[0] - 20} ${c[1]} ${c[0] + 75} ${c[1]}" fill="none" stroke="${loop.color}" stroke-width="12" marker-end="url(#dual-arrow-${index})"/><path d="M${c[0] - 70} ${c[1] - 20}Q${a[0] - 165} ${a[1] + 70} ${a[0] - 65} ${a[1] + 20}" fill="none" stroke="${loop.color}" stroke-width="12" marker-end="url(#dual-arrow-${index})"/>`
      : `<path d="M${a[0] + 70} ${a[1] + 15}Q${b[0]} ${a[1] + 40} ${b[0]} ${b[1] - 70}" fill="none" stroke="${loop.color}" stroke-width="12" marker-end="url(#dual-arrow-${index})"/><path d="M${b[0] - 10} ${b[1] + 72}Q${b[0] - 20} ${c[1]} ${c[0] + 75} ${c[1]}" fill="none" stroke="${loop.color}" stroke-width="12" marker-end="url(#dual-arrow-${index})"/><path d="M${c[0] - 70} ${c[1] - 20}Q${a[0] - 165} ${a[1] + 70} ${a[0] - 65} ${a[1] + 20}" fill="none" stroke="${loop.color}" stroke-width="12" marker-end="url(#dual-arrow-${index})"/>`;
    const nodeArt = loop.stages.map((stage, stageIndex) => {
      const [x, y] = nodes[stageIndex];
      return `<g id="dual-loop-${esc(loop.id)}-${esc(stage.id)}"><circle cx="${x}" cy="${y}" r="76" fill="${loop.soft}"/>${icon(stage.icon, x, y)}</g>`;
    }).join('');
    return `<g id="dual-loop-${esc(loop.id)}">${paths}${nodeArt}</g>`;
  }).join('');
  const bridgeColors = spec.bridge?.colors ?? [palette.verified, palette.failure];
  const bridge = `${arrowLine(705, 385, 895, 385, bridgeColors[0])}${arrowLine(895, 525, 705, 525, bridgeColors[1])}<path d="M690 760h220" stroke="${palette.line}" stroke-width="2"/>`;
  return `<g id="art-layer" data-layout="dual-loop" data-style="editorial"><rect width="${width}" height="${height}" fill="#fff"/>${defs}<circle cx="800" cy="455" r="112" fill="${palette.quiet}"/>${loops}${bridge}</g>`;
}

function renderDualLoopText(lang) {
  const loops = spec.loops.map((loop, index) => {
    const nodes = dualLoopNodes[index];
    const nodeText = loop.stages.map((stage, stageIndex) => {
      const [x, y] = nodes[stageIndex];
      return textBlock(x, y + 108, stage.title?.[lang] ?? stage.title?.en ?? '', { size: 21, weight: 760, anchor: 'middle', max: lang === 'zh' ? 8 : 14 });
    }).join('');
    const label = loop.label?.[lang] ?? loop.label?.en ?? '';
    const center = lang === 'en' ? (index === 0 ? [390, 430] : [1210, 430]) : (index === 0 ? [420, 430] : [1180, 430]);
    const labelSize = lang === 'en' && label.length > 8 ? 30 : 36;
    return `<g id="dual-loop-${esc(loop.id)}-text">${textBlock(center[0], center[1], label, { size: labelSize, weight: 760, color: loop.color, anchor: 'middle', max: 16 })}${nodeText}</g>`;
  }).join('');
  const bridgeLabel = textBlock(800, 442, spec.bridge?.label?.[lang] ?? spec.bridge?.label?.en ?? '', { size: 23, weight: 760, anchor: 'middle', max: lang === 'zh' ? 9 : 18 });
  const roles = (spec.bridge?.roles ?? []).map((role) => role[lang] ?? role.en).join('  →  ');
  const rolesText = textBlock(800, 800, roles, { size: 22, weight: 650, anchor: 'middle', max: 60 });
  return `<g id="text-layer" data-language="${lang}" data-layout="dual-loop" data-style="editorial">${loops}${bridgeLabel}${rolesText}</g>`;
}

function svg(body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img">${body}</svg>\n`;
}

fs.mkdirSync(outputDir, { recursive: true });
const art = layout === 'filter' ? renderFilterArt() : layout === 'loop' ? renderLoopArt() : layout === 'branch' ? renderBranchArt() : layout === 'before-after' ? renderBeforeAfterArt() : layout === 'dual-loop' ? renderDualLoopArt() : renderPipelineArt();
fs.writeFileSync(path.join(outputDir, `${spec.slug}.art.svg`), svg(art));
for (const lang of ['zh', 'en']) {
  const text = layout === 'filter' ? renderFilterText(lang) : layout === 'loop' ? renderLoopText(lang) : layout === 'branch' ? renderBranchText(lang) : layout === 'before-after' ? renderBeforeAfterText(lang) : layout === 'dual-loop' ? renderDualLoopText(lang) : renderPipelineText(lang);
  fs.writeFileSync(path.join(outputDir, `${spec.slug}.${lang}.svg`), svg(`${art}${text}`));
}
console.log(JSON.stringify({ ok: true, slug: spec.slug, outputs: ['art', 'zh', 'en'].map((suffix) => path.join(outputDir, `${spec.slug}.${suffix}.svg`)) }, null, 2));
