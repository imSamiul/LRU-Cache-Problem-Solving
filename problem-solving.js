/**
 * Creates an LRU Cache using a Doubly Linked List + Map (No Classes).
 * @param {number} capacity
 */
function createLRUCache(capacity) {
  if (capacity <= 0) throw new Error('Capacity must be positive');

  // Private node factory helper
  function createNode(key, value, expiry = null) {
    return {
      key,
      value,
      expiry,
      prev: null,
      next: null,
    };
  }

  // Sentinel head and tail nodes to simplify edge cases
  const head = createNode(null, null);
  const tail = createNode(null, null);
  head.next = tail;
  tail.prev = head;

  // Map stores: key -> node reference
  const map = new Map();

  // Helper functions for Doubly Linked List mutations
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
     * @param {string|number} key
     * @returns {any}
     */
    get(key) {
      if (!map.has(key)) return -1;

      const node = map.get(key);

      // Check TTL expiration
      if (node.expiry && Date.now() > node.expiry) {
        removeNode(node);
        map.delete(key);
        return -1;
      }

      // Move accessed node to Most Recently Used (MRU) position
      moveToHead(node);

      return node.value;
    },

    /**
     * @param {string|number} key
     * @param {any} value
     * @param {number} [ttlMs]
     */
    put(key, value, ttlMs = null) {
      const expiry = ttlMs ? Date.now() + ttlMs : null;

      if (map.has(key)) {
        // Update existing node
        const node = map.get(key);
        node.value = value;
        node.expiry = expiry;
        moveToHead(node);
      } else {
        // Evict LRU item if capacity is reached
        if (map.size >= capacity) {
          const lruNode = removeTail();
          map.delete(lruNode.key);
        }

        // Add new node
        const newNode = createNode(key, value, expiry);
        map.set(key, newNode);
        addToHead(newNode);
      }
    },
  };
}
