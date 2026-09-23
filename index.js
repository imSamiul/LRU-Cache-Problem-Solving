const { Cache } = require('./cache');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runDemo() {
  console.log('====================================================');
  console.log('        TEST 1: STANDARD LRU CACHE EVICTION        ');
  console.log('====================================================');

  const cache = Cache(2);
  console.log('Initialized Cache with capacity = 2\n');

  console.log('Action: put("A", 10)');
  cache.put('A', 10);
  console.log('Current Cache (MRU -> LRU):', cache.inspect());

  console.log('\nAction: put("B", 20)');
  cache.put('B', 20);
  console.log('Current Cache (MRU -> LRU):', cache.inspect());

  console.log('\nAction: get("A")');
  const getA1 = cache.get('A');
  console.log(`Result: ${getA1} (Key "A" accessed, promoted to MRU)`);
  console.log('Current Cache (MRU -> LRU):', cache.inspect());

  console.log('\nAction: put("C", 30) -> Triggers eviction');
  cache.put('C', 30);
  console.log('Current Cache (MRU -> LRU):', cache.inspect());
  console.log('Note: "B" was evicted as it was the Least Recently Used.');

  console.log('\nVerifying lookups:');
  console.log(
    'get("B") ->',
    cache.get('B'),
    '(Expected: -1 because B was evicted)',
  );
  console.log('get("C") ->', cache.get('C'), '(Expected: 30)');
  console.log('get("A") ->', cache.get('A'), '(Expected: 10)');

  console.log('\n====================================================');
  console.log('         TEST 2: TTL / EXPIRATION DEMO (BONUS)      ');
  console.log('====================================================');

  const ttlCache = Cache(2);
  console.log('Initialized Cache with capacity = 2\n');

  console.log('Action: put("tempKey", "val1", ttlMs = 500)');
  ttlCache.put('tempKey', 'val1', 500);

  console.log('Action: put("permKey", "val2") (No TTL)');
  ttlCache.put('permKey', 'val2');

  console.log('\nImmediate lookup before expiration:');
  console.log('get("tempKey") ->', ttlCache.get('tempKey'), '(Expected: val1)');

  console.log('\nWaiting 600ms for "tempKey" to expire...');
  await sleep(600);

  console.log('Lookup after TTL duration:');
  console.log(
    'get("tempKey") ->',
    ttlCache.get('tempKey'),
    '(Expected: -1 [Expired & Purged])',
  );
  console.log(
    'get("permKey") ->',
    ttlCache.get('permKey'),
    '(Expected: val2 [Still Valid])',
  );
}

runDemo();
