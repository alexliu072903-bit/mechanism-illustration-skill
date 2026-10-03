import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');

test('renders separate art, Chinese, and English SVG layers', () => {
  const output = fs.mkdtempSync(path.join(os.tmpdir(), 'mechanism-illustration-'));
  const template = path.join(root, 'templates/telegram-miniapp.json');
  const result = spawnSync(process.execPath, [path.join(root, 'scripts/render.mjs'), template, output], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);

  const art = fs.readFileSync(path.join(output, 'tg-miniapp-fastbuild-mechanism.art.svg'), 'utf8');
  const zh = fs.readFileSync(path.join(output, 'tg-miniapp-fastbuild-mechanism.zh.svg'), 'utf8');
  const en = fs.readFileSync(path.join(output, 'tg-miniapp-fastbuild-mechanism.en.svg'), 'utf8');

  assert.match(art, /id="art-layer"/);
  assert.doesNotMatch(art, /逐步验证|VERIFY EACH STAGE/);
  assert.match(zh, /data-language="zh"/);
  assert.match(zh, /逐步验证/);
  assert.match(en, /data-language="en"/);
  assert.match(en, /VERIFY EACH STAGE/);
});

test('every template has bilingual stage titles', () => {
  const templates = fs.readdirSync(path.join(root, 'templates')).filter((name) => name.endsWith('.json'));
  for (const name of templates) {
    const spec = JSON.parse(fs.readFileSync(path.join(root, 'templates', name), 'utf8'));
    assert.ok(spec.slug, `${name}: missing slug`);
    assert.ok(spec.stages.length >= 3 && spec.stages.length <= 5, `${name}: requires 3–5 stages`);
    for (const stage of spec.stages) {
      assert.ok(stage.title.zh && stage.title.en, `${name}/${stage.id}: missing bilingual title`);
      for (const item of stage.items ?? []) assert.ok(item.zh && item.en, `${name}/${stage.id}: missing bilingual item`);
      for (const item of stage.warnings ?? []) assert.ok(item.zh && item.en, `${name}/${stage.id}: missing bilingual warning`);
    }
  }
});
