import { getFileChunk } from "./api";

export const CHUNK_SIZE = 64 * 1024;
export const MAX_CACHED_CHUNKS = 50;

interface CacheEntry {
  data: Uint8Array;
  lastAccessed: number;
}

export class ChunkCache {
  private cache = new Map<number, CacheEntry>();

  private pendingRequests = new Map<
    number,
    Promise<Uint8Array>
  >();
  private readonly fileId: string;

  constructor(fileId: string) {
    this.fileId = fileId;
  }

  async getChunk(
    chunkOffset: number
  ): Promise<Uint8Array> {
    const cached = this.cache.get(chunkOffset);

    if (cached) {
      cached.lastAccessed = Date.now();
      return cached.data;
    }

    const pending =
      this.pendingRequests.get(chunkOffset);

    if (pending) {
      return pending;
    }

    const request = this.fetchChunk(chunkOffset);

    this.pendingRequests.set(
      chunkOffset,
      request
    );

    try {
      return await request;
    } finally {
      this.pendingRequests.delete(chunkOffset);
    }
  }

  private async fetchChunk(
    chunkOffset: number
  ): Promise<Uint8Array> {
    const buffer = await getFileChunk(
      this.fileId,
      chunkOffset,
      CHUNK_SIZE
    );

    const data = new Uint8Array(buffer);

    this.cache.set(chunkOffset, {
      data,
      lastAccessed: Date.now(),
    });

    this.evictIfNeeded();

    return data;
  }

  private evictIfNeeded(): void {
    while (
      this.cache.size > MAX_CACHED_CHUNKS
    ) {
      let oldestOffset: number | null = null;
      let oldestAccess = Infinity;

      for (const [
        offset,
        entry,
      ] of this.cache) {
        if (entry.lastAccessed < oldestAccess) {
          oldestAccess = entry.lastAccessed;
          oldestOffset = offset;
        }
      }

      if (oldestOffset === null) {
        return;
      }

      this.cache.delete(oldestOffset);
    }
  }

  clear(): void {
    this.cache.clear();
  }
}