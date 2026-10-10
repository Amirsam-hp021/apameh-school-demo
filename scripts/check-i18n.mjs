/**
 * Checks that every translation key used in src/ exists in BOTH en.json and fa.json,
 * and that the two files have exactly the same keys.
 *
 *   npm run check:i18n
 *
 * Dynamic keys like t(`status.${s}`) are checked by prefix: the prefix must exist
 * as an object in both files.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../src/', import.meta.url));
const en = JSON.parse(readFileSync(join(root, 'i18n/en.json'), 'utf8'));
const fa = JSON.parse(readFileSync(join(root, 'i18n/fa.json'), 'utf8'));

const flatten = (obj, prefix = '') =>
  Object.entries(obj).flatMap(([k, v]) => (v && typeof v === 'object' ? flatten(v, `${prefix}${k}.`) : [`${prefix}${k}`]));
const has = (obj, path) => path.split('.').reduce((o, k) => (o && typeof o === 'object' ? o[k] : undefined), obj) !== undefined;

const files = [];
const walk = (dir) => readdirSync(dir).forEach((f) => {
  const p = join(dir, f);
  if (statSync(p).isDirectory()) walk(p);
  else if (/\.(jsx?|mjs)$/.test(f)) files.push(p);
});
walk(root);

const staticKeys = new Set();
const dynamicPrefixes = new Set();
for (const file of files) {
  const src = readFileSync(file, 'utf8');
  for (const m of src.matchAll(/\bt\(\s*'([^']+)'/g)) staticKeys.add(m[1]);
  for (const m of src.matchAll(/\bt\(\s*`([^`$]*)\$\{/g)) dynamicPrefixes.add(m[1].replace(/\.$/, ''));
  for (const m of src.matchAll(/\blabel: '([a-z]+\.[a-zA-Z.]+)'/g)) staticKeys.add(m[1]); // navigation config
}

let problems = 0;
const report = (msg) => { problems += 1; console.log(msg); };

for (const key of [...staticKeys].sort()) {
  if (!has(en, key)) report(`missing in en.json: ${key}`);
  if (!has(fa, key)) report(`missing in fa.json: ${key}`);
}
for (const prefix of [...dynamicPrefixes].sort()) {
  if (prefix && !has(en, prefix)) report(`missing prefix in en.json: ${prefix}.*`);
  if (prefix && !has(fa, prefix)) report(`missing prefix in fa.json: ${prefix}.*`);
}
const enKeys = new Set(flatten(en));
const faKeys = new Set(flatten(fa));
for (const k of enKeys) if (!faKeys.has(k)) report(`in en.json but not fa.json: ${k}`);
for (const k of faKeys) if (!enKeys.has(k)) report(`in fa.json but not en.json: ${k}`);

console.log(`\n${staticKeys.size} static keys, ${dynamicPrefixes.size} dynamic prefixes, ${enKeys.size} keys per language.`);
if (problems) {
  console.log(`${problems} problem(s) found.`);
  process.exit(1);
}
console.log('All translations present in English and Farsi.');
