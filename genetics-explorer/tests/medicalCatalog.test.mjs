import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const catalog = JSON.parse(readFileSync(new URL('../public/data/medical-catalog.json', import.meta.url), 'utf8'));
const isHttps = (value) => {
  try { return new URL(value).protocol === 'https:'; } catch { return false; }
};
const unsafeMarkup = /<\/?[a-z][^>]*>|javascript:|<script|<iframe/i;

test('medical catalog contains a substantial uniquely identified collection with dated provenance', () => {
  assert.equal(catalog.schemaVersion, 1);
  assert.ok(catalog.topics.length > 500);
  assert.equal(catalog.metadata.topicCount, catalog.topics.length);
  assert.equal(new Set(catalog.topics.map((topic) => topic.id)).size, catalog.topics.length);
  assert.ok(catalog.metadata.source?.trim());
  assert.ok(catalog.metadata.scope?.trim());
  assert.ok(catalog.metadata.attribution?.trim());
  assert.ok(Number.isFinite(Date.parse(catalog.metadata.fetchedAt)));
  assert.ok(Number.isFinite(Date.parse(catalog.metadata.sourceDate)));
  assert.equal(catalog.metadata.language, 'en');
  for (const key of ['sourceUrl', 'downloadUrl', 'contentPolicyUrl']) {
    assert.ok(isHttps(catalog.metadata[key]), `Invalid provenance URL: ${key}`);
  }
});

test('every topic supplies readable plain text and HTTPS source links without executable markup', () => {
  for (const topic of catalog.topics) {
    assert.ok(typeof topic.id === 'string' && topic.id.trim(), 'Missing stable topic ID');
    assert.ok(topic.title?.trim(), `${topic.id}: missing title`);
    assert.equal(typeof topic.summaryPlainText, 'string', `${topic.id}: summary must remain plain text, including source-empty summaries`);
    assert.ok(!unsafeMarkup.test(topic.summaryPlainText), `${topic.id}: summary contains markup`);
    assert.ok(isHttps(topic.url), `${topic.id}: unsafe topic URL`);
    for (const key of ['aliases', 'groups']) {
      assert.ok(Array.isArray(topic[key]), `${topic.id}: missing ${key}`);
      assert.ok(topic[key].every((value) => typeof value === 'string' && !unsafeMarkup.test(value)));
    }
    for (const category of ['treatment', 'diagnosis', 'outcomes']) {
      assert.ok(Array.isArray(topic.sections?.[category]), `${topic.id}: missing ${category} list`);
      for (const link of topic.sections[category]) {
        assert.ok(link.title?.trim(), `${topic.id}: untitled ${category} source`);
        assert.ok(isHttps(link.url), `${topic.id}: unsafe ${category} URL`);
        assert.ok(typeof link.organization === 'string');
        assert.ok(typeof link.category === 'string' && link.category.trim());
      }
    }
  }
});

