const assert = require('node:assert/strict');
const test = require('node:test');
const { Cache } = require('./cache');

test('evicts the least recently used entry', () => {
  const cache = Cache(2);

  cache.put('A', 10);
  cache.put('B', 20);
  assert.equal(cache.get('A'), 10);
  cache.put('C', 30);

  assert.equal(cache.get('B'), -1);
  assert.equal(cache.get('C'), 30);
  assert.equal(cache.get('A'), 10);
});

test('updates a value and makes the key most recently used', () => {
  const cache = Cache(2);

  cache.put('A', 10);
  cache.put('B', 20);
  cache.put('A', 15);
  cache.put('C', 30);

  assert.equal(cache.get('A'), 15);
  assert.equal(cache.get('B'), -1);
});

test('rejects non-positive and non-integer capacities', () => {
  assert.throws(() => Cache(0), /positive integer/);
  assert.throws(() => Cache(-1), /positive integer/);
  assert.throws(() => Cache(1.5), /positive integer/);
});

test('reports entries from most recently used to least recently used', () => {
  const cache = Cache(2);

  cache.put('A', 10);
  cache.put('B', 20);
  cache.get('A');

  assert.equal(cache.inspect(), 'A:10 -> B:20');
});

test('returns -1 for an expired entry', async () => {
  const cache = Cache(1);

  cache.put('temporary', 'value', 10);
  await new Promise((resolve) => setTimeout(resolve, 20));

  assert.equal(cache.get('temporary'), -1);
});
