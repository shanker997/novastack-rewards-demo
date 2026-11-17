// Local compatibility tests only. Portal attribution still requires browser QA.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const script = html.match(/<script id="normalize-campaign-url">([\s\S]*?)<\/script>/)[1];
const base = 'https://shanker997.github.io/novastack-rewards-demo/';
const tuple = 'urlCode=fjnS1Pzv&aid=workshop_registration&fid=-3b2c3488e';
let passed = 0;
function run(input, { historyThrows = false } = {}) {
  const state = { existing: 'preserved' };
  const calls = [];
  const location = { href: input };
  const history = {
    state,
    replaceState(receivedState, title, href) {
      if (historyThrows) throw new Error('History API unavailable');
      assert.equal(receivedState, state);
      assert.equal(title, '');
      assert.equal(new URL(href).origin, new URL(input).origin);
      assert.equal(new URL(href).pathname, new URL(input).pathname);
      calls.push(href);
      location.href = href;
    }
  };
  vm.runInNewContext(script, { URL, URLSearchParams, window: { location, history } });
  return { href: location.href, calls };
}
function test(name, input, expected, options) {
  const result = run(input, options);
  assert.equal(result.href, expected, name);
  assert.equal(result.calls.length, input === expected ? 0 : 1, name + ' history count');
  assert.equal(run(result.href, options).href, expected, name + ' idempotence');
  passed++;
  console.log('PASS', name);
}
test('observed workshop URL', base + '#workshop?' + tuple, base + '?' + tuple + '#workshop');
const sandboxTuple = 'urlCode=Sc3uyxHF&aid=sandbox_tour&fid=-3b2c3488e';
test('observed sandbox URL', base + '#sandbox?' + sandboxTuple, base + '?' + sandboxTuple + '#sandbox');
test('known approach section', base + '#approach?' + tuple, base + '?' + tuple + '#approach');
test('normal attributed URL stays byte-for-byte unchanged', base + '?' + tuple + '#workshop', base + '?' + tuple + '#workshop');
test('organic root unchanged', base, base);
test('plain section unchanged', base + '#workshop', base + '#workshop');
test('empty CPC fragment query unchanged', base + '#approach?', base + '#approach?');
test('unrelated search text preserved', base + '?utm_source=skybridge%20demo&tag=a+b#workshop?' + tuple, base + '?utm_source=skybridge%20demo&tag=a+b&' + tuple + '#workshop');
test('existing complete attribution wins', base + '?urlCode=existing&aid=qa_tracking_check&fid=123#workshop?' + tuple, base + '?urlCode=existing&aid=qa_tracking_check&fid=123#workshop?' + tuple);
for (const key of ['urlCode', 'aid', 'fid']) {
  const input = base + '?' + key + '=existing#workshop?' + tuple;
  test('partial search attribution not mixed: ' + key, input, input);
}
for (const suffix of [
  '#unknown?' + tuple,
  '#workshop?urlCode=a&aid=workshop_registration',
  '#workshop?urlCode=a&aid=workshop_registration&fid=',
  '#workshop?urlCode=a&aid=workshop_registration&fid=%20',
  '#workshop?' + tuple + '&urlCode=other',
  '#workshop?' + tuple + '&extra=value',
  '#workshop?urlCode=a&aid=workshop_registration&unknown=value',
  '#workshop?' + tuple + '?second=value',
  '#workshop?' + tuple + '#second',
  '#workshop?urlCode=%GG&aid=workshop_registration&fid=1'
]) test('ambiguous or malformed fragment unchanged: ' + suffix, base + suffix, base + suffix);
const encodedTuple = 'urlCode=a%2Bb&aid=workshop_registration&fid=%2D3b2c3488e';
test('encoded values not double-decoded', base + '#workshop?' + encodedTuple, base + '?' + encodedTuple + '#workshop');
test('history failure leaves URL intact', base + '#workshop?' + tuple, base + '#workshop?' + tuple, { historyThrows: true });
test('non-web scheme unchanged', 'file:///demo/index.html#workshop?' + tuple, 'file:///demo/index.html#workshop?' + tuple);
assert.ok(html.indexOf('id="normalize-campaign-url"') < html.indexOf('https://assets.channels.appventory.com/scripts/cts.js?uid='));
const loader = '<script>(function(w,d,s,u){let j=d.createElement(s);j.async=true;j.src="https://assets.channels.appventory.com/scripts/cts.js?uid=" + u;let f=d.getElementsByTagName(s)[0];f.parentNode.insertBefore(j,f);})(window,document,"script","41d3be53-08c8-496c-ba31-6d3455d02511");</script>';
assert.ok(html.includes(loader), 'exact product loader remains unchanged');
for (const [index, match] of [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].entries()) {
  new vm.Script(match[1], { filename: 'inline-script-' + index });
}
console.log(JSON.stringify({ urlTestsPassed: passed, loaderOrder: 'PASS', exactLoader: 'PASS', allInlineScriptSyntax: 'PASS' }));
