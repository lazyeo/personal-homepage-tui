import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequestPost } from '../functions/api/chat.js';

const longContext = '# Profile\nProduct-minded developer.\n\n## Background\n'
  + 'Product delivery experience. '.repeat(170)
  + '\n\n## Skills\n' + 'Web development. '.repeat(240)
  + '\n\n## Projects\nArchive Tool: a documented supplementary project.\n'
  + '\n\n## MRSL\nObsolete preview URL: https://old-preview.example/\n';

// Exercise the real endpoint and provider serialization; only KV and the external
// model request are substituted, so no credentials or paid model calls are needed.
async function capturePrompt(t, context, message, history = []) {
  let prompt;
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    prompt = JSON.parse(options.body).messages[0].content;
    return Response.json({ choices: [{ message: { content: 'Test response' } }] });
  });
  const response = await onRequestPost({
    request: new Request('https://portfolio.test/api/chat', {
      method: 'POST', body: JSON.stringify({ message, history }),
    }),
    env: {
      AI_API_KEY: 'test-only', AI_PROVIDER: 'openai',
      CHAT_RATE_LIMIT_BYPASS_IPS: 'unknown-ip',
      PORTFOLIO_CONTEXT: { get: async () => context, put: async () => {} },
    },
  });
  assert.equal(response.status, 200);
  assert.ok(prompt);
  return prompt;
}

for (const question of ['所以你做过什么项目呢', 'What projects have you built?', '有哪些作品可以看看？']) {
  test(`generic project question includes supplementary projects: ${question}`, async (t) => {
    const prompt = await capturePrompt(t, longContext, question);
    assert.ok(prompt.includes('Archive Tool'), 'KV project section must survive retrieval');
  });
}

for (const [label, context] of [['long KV', longContext], ['short stale KV', '# Profile\nFull-stack developer.'], ['missing KV', null]]) {
  test(`reviewed projects available with ${label}`, async (t) => {
    const prompt = await capturePrompt(t, context, '做过什么项目？');
    for (const fact of ['MRSL', 'Astro', 'Wix', 'https://www.mrsl.nz/', 'CareerMatch AI', 'https://cvto.work/', 'Kids Worksheet Generator', 'https://kids.a-dobe.club/']) {
      assert.ok(prompt.includes(fact), `missing public fact: ${fact}`);
    }
    assert.ok(prompt.includes('take precedence'), 'current facts must override stale supplementary data');
    assert.ok(prompt.length < 12000, 'prompt must stay bounded');
  });
}

test('named retrieval still works and oversized sections do not crowd out projects', async (t) => {
  const context = '# Profile\n' + 'Long background. '.repeat(1000)
    + '\n\n## Archive Tool\nUnique archive implementation details.';
  const prompt = await capturePrompt(t, context, 'Archive Tool');
  assert.ok(prompt.includes('Unique archive implementation details.'));
  assert.ok(prompt.includes('https://www.mrsl.nz/'));
  assert.ok(prompt.length < 12000);
});

test('follow-up retains relevant history for context selection', async (t) => {
  const prompt = await capturePrompt(t, longContext, '展开说说', [
    { role: 'user', content: 'Archive Tool' },
    { role: 'assistant', content: 'We can discuss it.' },
  ]);
  assert.ok(prompt.includes('Archive Tool'));
});
