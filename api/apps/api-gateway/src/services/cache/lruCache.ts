class LRUCache {
  private readonly capacity: number = 0;
  private readonly cache = new Map<string, unknown>();
  private readonly leastUsed = new Array<string>();

  constructor(capacity: number) {
    // code
    this.capacity = capacity;
  }

  get(key: string) {
    // code
    // push the element to top
    const index = this.leastUsed.indexOf(key);
    if (index !== -1) {
      this.leastUsed.splice(index, 0);
    }
    this.leastUsed.unshift(key);

    return this.cache.get(key) ?? -1;
  }

  put(key: string, value: unknown) {
    // remove if key already exist
    const index = this.leastUsed.indexOf(key);
    if (index !== -1) {
      this.leastUsed.splice(index, 1);
    }

    // code
    if (!this.cache.has(key) && this.cache.size >= this.capacity) {
      const lruKey = this.leastUsed.pop();
      if (lruKey) {
        this.cache.delete(lruKey);
      }
    }

    this.leastUsed.push(key);
    this.cache.set(key, value);
  }
}

const cache = new LRUCache(2);
cache.put('a', 1);
cache.put('b', 2);
console.log(cache.get('a'));
cache.put('c', 3);
console.log(cache.get('c'));
