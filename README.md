# Least Recently Used (LRU) Cache with TTL Support

An in-memory Least Recently Used (LRU) cache implementation in Node.js supporting $O(1)$ operations and an optional Time-To-Live (TTL) expiration policy.

---

## 1. Data Structures Used & Justification

To achieve true **$O(1)$ average time complexity** for both `get` and `put` operations, the cache pairs two data structures:

1. **Hash Map (`Map`):**
   - **Role:** Maps each `key` directly to its corresponding node reference in memory.
   - **Why:** Offers $O(1)$ lookup, insertion, and deletion by key.

2. **Doubly Linked List:**
   - **Role:** Maintains the recency order of cached items.
   - **Why:** Unlike an array (where inserting/removing an element takes $O(n)$ due to shifting indexes), a doubly linked list can remove a node or insert it at the head in $O(1)$ time once a direct reference to the node is available.
   - **Sentinels:** Uses dummy `head` and `tail` nodes to simplify edge cases, avoiding null checks during boundary insertions and removals.

---

## 2. How LRU Ordering is Maintained

The list is ordered from **Most Recently Used (Head)** to **Least Recently Used (Tail)**:

- **`get(key)`:**
  1. Looks up the node reference in the hash map ($O(1)$).
  2. If found (and not expired), detaches the node from its current position and re-links it directly behind `head` (`moveToHead`).
  3. Returns the node's value.

- **`put(key, value, [ttlMs])`:**
  - **Key exists:** Updates the node's value/expiry and moves it to the head (`moveToHead`).
  - **Key is new:**
    1. If `map.size >= capacity`, the least recently used node (`tail.prev`) is detached from the list and deleted from the map.
    2. A new node is allocated, added to the map, and placed right behind `head` (`addToHead`).

---

## 3. Complexity Analysis

| Operation         | Time Complexity | Space Complexity | Description                              |
| :---------------- | :-------------- | :--------------- | :--------------------------------------- |
| `get(key)`        | **$O(1)$**      | **$O(1)$**       | Hash map lookup + pointer updates        |
| `put(key, value)` | **$O(1)$**      | **$O(1)$**       | Hash map update/insert + pointer updates |
| Overall Cache     | —               | **$O(C)$**       | $C$ is the maximum capacity              |

---

## 4. Optional Bonus: TTL Support & Trade-offs

### Approach: Lazy (Passive) Eviction

- Each node stores an optional timestamp: `expiry = Date.now() + ttlMs`.
- Expiration is checked lazily inside `get(key)`:
  - If `Date.now() > node.expiry`, the node is removed from the linked list, removed from the map, and `-1` is returned.

### Trade-offs

- **Advantages:** Zero background CPU overhead. Does not require active background interval loops (`setInterval`) or timer handles for each key, keeping execution lean and predictable.
- **Drawback:** If an expired key is never queried again, its memory is not reclaimed immediately. However, it will still naturally be evicted when newer entries push it out of the cache via the standard LRU capacity policy.

---

## 5. How to Run

### Prerequisites

- Node.js (v14 or higher)

### Instructions

```bash
# Clone the repository
git clone <YOUR_GITHUB_REPO_URL>
cd <YOUR_REPO_NAME>

# Run the test suite and demonstration
node index.js
```
