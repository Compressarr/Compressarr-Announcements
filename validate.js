#!/usr/bin/env node
// Checks announcements.json against the same rules Compressarr's reader applies, so a mistake is caught before it is committed.
// Usage: node validate.js [path-to-announcements.json]   (no dependencies; exits 1 when something is wrong)
const fs = require('fs');
const path = require('path');

const file = process.argv[2] || path.join(__dirname, 'announcements.json');
const MAX_BYTES = 64 * 1024;
const MAX_ENTRIES = 50;
const LIMITS = { id: 80, title: 120, text: 1000 };
const KINDS = ['release', 'beta', 'catalog', 'notice'];
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const VERSION = /^\d+(\.\d+){1,3}(-[0-9A-Za-z.-]+)?$/;

// Links must be https and point at the Compressarr GitHub page or compressarr.tv - anything else is shown as plain text by the app.
// github.com/MrWizardCT (where the project used to live) is still accepted by the app, so old messages keep their links.
const GITHUB_OWNERS = ['Compressarr', 'MrWizardCT'];
function linkAllowed(text) {
  let url;
  try { url = new URL(text); } catch { return false; }
  if (url.protocol !== 'https:') return false;
  const host = url.hostname.toLowerCase();
  if (host === 'github.com') return GITHUB_OWNERS.some(owner => url.pathname === '/' + owner || url.pathname.startsWith('/' + owner + '/'));
  return host === 'compressarr.tv' || host.endsWith('.compressarr.tv');
}

const problems = [];
const bad = message => problems.push(message);

const size = fs.statSync(file).size;
if (size > MAX_BYTES) bad(`the file is ${size} bytes; the limit is ${MAX_BYTES}`);

let doc;
try { doc = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { console.error('Not valid JSON: ' + e.message); process.exit(1); }

if (doc.schema !== 1) bad(`"schema" must be 1 (got ${JSON.stringify(doc.schema)})`);
if (doc.updated !== undefined && !DATE.test(doc.updated)) bad('"updated" must look like 2026-10-11');
if (!Array.isArray(doc.announcements)) bad('"announcements" must be a list');

const items = Array.isArray(doc.announcements) ? doc.announcements : [];
if (items.length > MAX_ENTRIES) bad(`${items.length} entries; the app reads at most ${MAX_ENTRIES}`);

const seen = new Set();
items.forEach((a, i) => {
  const where = `entry ${i + 1}${a && a.id ? ` (${a.id})` : ''}`;
  if (!a || typeof a !== 'object') return bad(`${where}: not an object`);
  for (const key of ['id', 'date', 'title']) if (typeof a[key] !== 'string' || !a[key].trim()) bad(`${where}: "${key}" is required`);
  if (typeof a.id === 'string') {
    if (a.id.length > LIMITS.id) bad(`${where}: id is longer than ${LIMITS.id}`);
    if (seen.has(a.id)) bad(`${where}: id is used twice - ids are never reused`);
    seen.add(a.id);
  }
  if (typeof a.date === 'string' && !DATE.test(a.date)) bad(`${where}: "date" must look like 2026-10-11`);
  if (a.kind !== undefined && !KINDS.includes(a.kind)) bad(`${where}: "kind" must be one of ${KINDS.join(', ')}`);
  if (typeof a.title === 'string' && a.title.length > LIMITS.title) bad(`${where}: title is longer than ${LIMITS.title}`);
  if (a.text !== undefined && (typeof a.text !== 'string' || a.text.length > LIMITS.text)) bad(`${where}: "text" must be a string of at most ${LIMITS.text} characters`);
  if (a.link != null && !linkAllowed(a.link)) bad(`${where}: "link" must be https to github.com/Compressarr/... or compressarr.tv`);
  if (a.expires != null && !DATE.test(a.expires)) bad(`${where}: "expires" must look like 2026-10-11`);
  for (const key of ['minAppVersion', 'maxAppVersion']) if (a[key] != null && !VERSION.test(a[key])) bad(`${where}: "${key}" must look like 2.2.0 or 2.2.0-beta.5`);
  if (a.important !== undefined && typeof a.important !== 'boolean') bad(`${where}: "important" must be true or false`);
  if (/[<>]/.test(`${a.title || ''}${a.text || ''}`)) bad(`${where}: "<" and ">" are shown as plain text; avoid them`);
});

if (problems.length) {
  console.error(`${path.basename(file)}: ${problems.length} problem(s)`);
  problems.forEach(p => console.error('  - ' + p));
  process.exit(1);
}
console.log(`${path.basename(file)}: OK (${items.length} announcement${items.length === 1 ? '' : 's'})`);
