const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, 'referral-discovery.html'), 'utf8');
// Exact loader from the live Referral Program installation guide, captured 17 November 2026.
const guide = '<script> (function (w, d, s, u) {let j = d.createElement(s); j.async = true; j.src ="https://assets.channels.appventory.com/scripts/embeddingwidget.js?uid=" +u; let f = d.getElementsByTagName(s)[0]; f.parentNode.insertBefore(j, f);})(window, document, "script", "41d3be53-08c8-496c-ba31-6d3455d02511");</script>';
const code = html.match(/<script id="referral-controller">([\s\S]*?)<\/script>/)[1];
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
const key = 'novastack-referral-discovery-v1:requested';
let passed = 0;
function harness({ tracker, saved = new Map(), throwGet = false, throwSet = false, throwRemove = false } = {}) {
  const elements = Object.fromEntries(ids.map(id => [id, { id, value: '', hidden: /^(retry-referral|referral-result)$/.test(id), disabled: false, textContent: '', className: '', custom: '', listeners: {}, addEventListener(name, fn) { this.listeners[name] = fn; }, setCustomValidity(text) { this.custom = text; }, focus() { this.focused = true; } }]));
  elements['referral-form'].reportValidity = () => !elements['lead-email'].custom && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(elements['lead-email'].value);
  elements['referral-form'].reset = () => ['lead-email','lead-first-name','lead-last-name','lead-company'].forEach(id => elements[id].value = '');
  const location = { href: 'https://shanker997.github.io/novastack-rewards-demo/referral-discovery.html?observed=preserve%2Bexact#section' };
  const win = { trackify: tracker, location, listeners: {}, addEventListener(name, fn) { this.listeners[name] = fn; }, sessionStorage: {
    getItem(k) { if (throwGet) throw new Error('blocked'); return saved.get(k) ?? null; },
    setItem(k,v) { if (throwSet) throw new Error('blocked'); saved.set(k,v); },
    removeItem(k) { if (throwRemove) throw new Error('blocked'); saved.delete(k); }
  } };
  vm.runInNewContext(code, { window: win, document: { getElementById: id => elements[id] } });
  return { e: elements, win, saved, fire: (id, type = 'click') => elements[id].listeners[type]({ preventDefault() {} }), sample() { return elements['fill-sample'].listeners.click(); }, submit() { return elements['referral-form'].listeners.submit({ preventDefault() {} }); } };
}
async function test(name, fn) { await fn(); passed++; console.log('PASS', name); }
(async () => {
 await test('exact guide loader once, no campaign tracker or fabricated API', () => {
  const loader = guide.match(/<script>[\s\S]*?<\/script>/)[0];
  assert.equal(html.split(loader).length-1,1); assert.ok(html.indexOf(loader)<html.indexOf('id="referral-controller"'));
  assert.ok(!html.includes('cts.js')); assert.ok(!html.includes('trackEvent')); assert.ok(!html.includes('fetch(')); assert.ok(!code.includes('URLSearchParams')); assert.ok(!code.includes('location'));
 });
 await test('all inline scripts parse and field contract is accessible', () => {
  for (const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) new vm.Script(m[1]);
  assert.equal(new Set(ids).size, ids.length);
  for (const m of html.matchAll(/\bfor="([^"]+)"/g)) assert.ok(ids.includes(m[1]));
  assert.match(html, /id="lead-email"[^>]*type="email"[^>]*required/);
  assert.match(html,/id="referral-status"[^>]*role="status"/);
 });
 await test('no tracking on load, sample, availability or reset', async () => {
  let calls=0;const h=harness({tracker:{trackLead(){calls++;}}});h.sample();h.fire('check-tracker');h.win.listeners.load();h.fire('reset-referral');assert.equal(calls,0);
 });
 for (const email of ['', 'not-an-email', 'real@example.com', 'two@@alderquay.example', 'nadia@alder quay.example', 'nadia@alderquay.example.com']) {
  await test('invalid input blocked: '+JSON.stringify(email), async()=>{let calls=0;const h=harness({tracker:{trackLead(){calls++;}}});h.e['lead-email'].value=email;await h.submit();assert.equal(calls,0);assert.match(h.e['referral-status'].textContent,/valid fictional/);});
 }
 await test('trimmed case-insensitive example email and only four documented fields',async()=>{
  let payload;const tracker={trackLead(p){assert.equal(this,tracker);payload=p;}};const h=harness({tracker});h.sample();h.e['lead-email'].value='  nadia@alderquay.EXAMPLE  ';h.e['lead-company'].value=' Alder Quay Operations ';await h.submit();assert.deepEqual(JSON.parse(JSON.stringify(payload)),{email:'nadia@alderquay.EXAMPLE',firstName:'Nadia',lastName:'Iqbal',companyName:'Alder Quay Operations'});assert.match(h.e['referral-status'].textContent,/remain unverified/);assert.equal(h.e['referral-result'].hidden,false);
 });
 await test('optional fields may be omitted',async()=>{let p;const h=harness({tracker:{trackLead(data){p=data;}}});h.e['lead-email'].value='solo@quay.example';await h.submit();assert.deepEqual(JSON.parse(JSON.stringify(p)),{email:'solo@quay.example'});});
 for (const tracker of [undefined,{trackLead:'not-a-function'}]) await test('missing tracking capability allows later explicit retry',async()=>{const h=harness({tracker});h.sample();await h.submit();assert.match(h.e['referral-status'].textContent,/No request was made/);assert.equal(h.e['retry-referral'].hidden,false);let calls=0;h.win.trackify={trackLead(){calls++;}};await h.fire('retry-referral');assert.equal(calls,1);});
 await test('sync throw is uncertain and retry is explicit',async()=>{let calls=0;const h=harness({tracker:{trackLead(){calls++;throw Error('failed');}}});h.sample();await h.submit();assert.equal(calls,1);assert.match(h.e['referral-status'].textContent,/remote result is unknown/);assert.match(h.e['referral-status'].textContent,/duplicate referral/);assert.equal(h.saved.has(key),false);h.win.trackify.trackLead=()=>{calls++;};await h.fire('retry-referral');assert.equal(calls,2);});
 await test('Promise rejection re-enables guarded explicit retry',async()=>{let calls=0;const h=harness({tracker:{trackLead(){calls++;return Promise.reject(Error('network'));}}});h.sample();await h.submit();assert.equal(calls,1);assert.equal(h.e['submit-referral'].disabled,false);assert.equal(h.e['retry-referral'].hidden,false);h.win.trackify.trackLead=()=>{calls++;return Promise.resolve({anything:'unknown-schema'});};await h.fire('retry-referral');assert.equal(calls,2);assert.match(h.e['referral-status'].textContent,/unverified/);});
 await test('pending request blocks repeat, sample and reset without auto-retry',async()=>{let calls=0,resolve;const h=harness({tracker:{trackLead(){calls++;return new Promise(r=>resolve=r);}}});h.sample();const first=h.submit();assert.equal(h.e['reset-referral'].disabled,true);await h.submit();h.fire('reset-referral');h.sample();assert.equal(calls,1);assert.match(h.e['reset-status'].textContent,/still pending/);assert.equal(h.saved.has(key),false);resolve();await first;assert.equal(h.saved.get(key),'1');assert.equal(calls,1);});
 await test('successful request blocks repeat and survives reload',async()=>{let calls=0;const tracker={trackLead(){calls++;}};const h=harness({tracker});h.sample();await h.submit();await h.submit();const again=harness({tracker,saved:h.saved});await again.submit();assert.equal(calls,1);assert.equal(again.e['submit-referral'].disabled,true);});
 await test('storage set failure retains in-memory guard',async()=>{let calls=0;const h=harness({throwSet:true,tracker:{trackLead(){calls++;}}});h.sample();await h.submit();await h.submit();assert.equal(calls,1);assert.equal(h.e['submit-referral'].disabled,true);});
 await test('fully blocked storage falls back to memory guard',async()=>{let calls=0;const h=harness({throwSet:true,throwGet:true,tracker:{trackLead(){calls++;}}});h.sample();await h.submit();await h.submit();assert.equal(calls,1);});
 await test('explicit warned reset permits intentional second request',async()=>{let calls=0;const h=harness({tracker:{trackLead(){calls++;}}});h.sample();await h.submit();h.fire('reset-referral');assert.match(h.e['reset-status'].textContent,/another referral and reward/);assert.equal(h.e['submit-referral'].disabled,false);h.sample();await h.submit();assert.equal(calls,2);assert.ok(html.indexOf('Before resetting:')<html.indexOf('id="reset-referral"'));});
 await test('failed stored-guard removal does not silently allow another submission',async()=>{const h=harness({saved:new Map([[key,'1']]),throwRemove:true});h.fire('reset-referral');assert.equal(h.e['submit-referral'].disabled,true);assert.match(h.e['reset-status'].textContent,/could not be cleared/);});
 await test('response value never implies remote confirmation',async()=>{const h=harness({tracker:{trackLead(){return false;}}});h.sample();await h.submit();assert.match(h.e['referral-status'].textContent,/requested.*unverified/);});
 await test('attribution URL remains untouched',async()=>{const h=harness({tracker:{trackLead(){}}});const original=h.win.location.href;h.sample();await h.submit();h.fire('reset-referral');assert.equal(h.win.location.href,original);});
 console.log(JSON.stringify({testsPassed:passed,remoteAttributionVerified:false}));
})().catch(e=>{console.error(e);process.exitCode=1;});
