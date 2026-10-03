#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const outputDir = path.resolve(process.argv[2] ?? 'dist');
const zhFiles = fs.readdirSync(outputDir).filter((name) => name.endsWith('.zh.svg')).sort();
const pairs = zhFiles.map((zh) => {
  const slug = zh.replace(/\.zh\.svg$/, '');
  const en = `${slug}.en.svg`;
  if (!fs.existsSync(path.join(outputDir, en))) throw new Error(`missing English pair for ${zh}`);
  return { slug, zh, en };
});

const figures = pairs.flatMap(({ slug, zh, en }) => [
  `<figure><img src="${zh}" alt="${slug} Chinese"><figcaption>${slug} · ZH</figcaption></figure>`,
  `<figure><img src="${en}" alt="${slug} English"><figcaption>${slug} · EN</figcaption></figure>`,
]).join('\n');

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mechanism Illustration bilingual QA</title><style>*{box-sizing:border-box}body{margin:0;padding:24px;color:#151815;background:#e9ece9;font-family:Arial,sans-serif}h1{margin:0 0 24px}main{display:grid;grid-template-columns:1fr 1fr;gap:24px}figure{margin:0;padding:12px;background:#fff;border:1px solid #bcc3bc}img{display:block;width:100%;height:auto}figcaption{margin-top:8px;font-weight:700}@media(max-width:800px){main{grid-template-columns:1fr}}</style></head><body><h1>Bilingual diagram QA wall</h1><main>${figures}</main></body></html>\n`;

const target = path.join(outputDir, 'gallery.html');
fs.writeFileSync(target, html);
console.log(JSON.stringify({ ok: true, pairs: pairs.length, output: target }, null, 2));
