/**
 * LRU Cache implementation using a Doubly Linked List + Map.
 * Supports both `new Cache(capacity)` and `Cache(capacity)`.
 *
 * @param {number} capacity - Maximum number of items the cache can hold.
 */
function Cache(capacity) {
  if (!Number.isInteger(capacity) || capacity <= 0) {
    throw new Error('Capacity must be a positive integer.');
  }

  // Node helper
  function createNode(key, value, expiry = null) {
    return {
      key,
      value,
      expiry,
      prev: null,
      next: null,
    };
  }

  // Sentinel dummy nodes to eliminate boundary checks
  const head = createNode(null, null);
  const tail = createNode(null, null);
  head.next = tail;
  tail.prev = head;

  // Hash Map: key -> node reference
  const map = new Map();

  // Internal Doubly Linked List operations (all O(1))
  function removeNode(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }

  function addToHead(node) {
    node.next = head.next;
    node.prev = head;
    head.next.prev = node;
    head.next = node;
  }

  function moveToHead(node) {
    removeNode(node);
    addToHead(node);
  }

  function removeTail() {
    const lruNode = tail.prev;
    removeNode(lruNode);
    return lruNode;
  }

  return {
    /**
     * Retrieves the value for a key and marks it as Most Recently Used (MRU).
     * @param {string|number} key
     * @returns {any} Stored value or -1 if missing/expired.
     */
    get(key) {
      if (!map.has(key)) return -1;

      const node = map.get(key);

      // Lazy TTL eviction check
      if (node.expiry !== null && Date.now() > node.expiry) {
        removeNode(node);
        map.delete(key);
        return -1;
      }

      // Mark as MRU
      moveToHead(node);
      return node.value;
    },

    /**
     * Inserts or updates a key-value pair.
     * @param {string|number} key
     * @param {any} value
     * @param {number|null} [ttlMs=null] Optional TTL in milliseconds.
     */
    put(key, value, ttlMs = null) {
      const expiry = ttlMs && ttlMs > 0 ? Date.now() + ttlMs : null;

      if (map.has(key)) {
        const node = map.get(key);
        node.value = value;
        node.expiry = expiry;
        moveToHead(node);
        return;
      }

      // Evict LRU node if at capacity
      if (map.size >= capacity) {
        const lruNode = removeTail();
        map.delete(lruNode.key);
      }

      // Insert new node at head (MRU)
      const newNode = createNode(key, value, expiry);
      map.set(key, newNode);
      addToHead(newNode);
    },

    /**
     * Helper to inspect cache state in order from MRU to LRU.
     */
    inspect() {
      const items = [];
      let curr = head.next;
      while (curr !== tail) {
        items.push(`${curr.key}:${curr.value}`);
        curr = curr.next;
      }
      return items.join(' -> ') || '(empty)';
    },
  };
}

module.exports = { Cache, createLRUCache: Cache };
