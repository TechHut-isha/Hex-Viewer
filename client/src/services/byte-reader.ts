import {
    CHUNK_SIZE,
    ChunkCache,
  } from "./chunk-cache";
  
  export async function readByte(
    cache: ChunkCache,
    offset: number
  ): Promise<number> {
    const chunkOffset =
      Math.floor(offset / CHUNK_SIZE) *
      CHUNK_SIZE;
  
    const chunk =
      await cache.getChunk(chunkOffset);
  
    const index = offset - chunkOffset;
  
    return chunk[index];
  }