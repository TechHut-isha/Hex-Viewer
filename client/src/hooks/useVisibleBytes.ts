import {
    useEffect,
    useState,
  } from "react";
  
  import {
    CHUNK_SIZE,
    ChunkCache,
  } from "../services/chunk-cache";
  
  interface UseVisibleBytesResult {
    data: Uint8Array | null;
    startOffset: number;
    loading: boolean;
    error: string | null;
  }
  
  export function useVisibleBytes(
    cache: ChunkCache | null,
    startRow: number,
    endRow: number,
    bytesPerRow: number,
    fileSize: number
  ): UseVisibleBytesResult {
    const [data, setData] =
      useState<Uint8Array | null>(null);
  
    const [startOffset, setStartOffset] =
      useState(0);
  
    const [loading, setLoading] =
      useState(false);
  
    const [error, setError] =
      useState<string | null>(null);
  
    useEffect(() => {
      if (
        !cache ||
        fileSize === 0 ||
        startRow >= endRow
      ) {
        setData(null);
        setStartOffset(0);
        return;
      }
  
      let cancelled = false;
      const chunkCache = cache;
  
      async function loadVisibleBytes() {
        try {
          setLoading(true);
          setError(null);
  
          const requestedStart =
            startRow * bytesPerRow;
  
          const requestedEnd = Math.min(
            endRow * bytesPerRow,
            fileSize
          );
  
          if (
            requestedStart >= requestedEnd
          ) {
            return;
          }
  
          const firstChunkOffset =
            Math.floor(
              requestedStart / CHUNK_SIZE
            ) * CHUNK_SIZE;
  
          const lastChunkOffset =
            Math.floor(
              (requestedEnd - 1) /
                CHUNK_SIZE
            ) * CHUNK_SIZE;
  
  
          const chunkOffsets: number[] = [];

          for (
            let chunkOffset = firstChunkOffset;
            chunkOffset <= lastChunkOffset;
            chunkOffset += CHUNK_SIZE
          ) {
            chunkOffsets.push(chunkOffset);
          }
          
          const chunks =
            await Promise.all(
              chunkOffsets.map(
                (chunkOffset) =>
                  chunkCache.getChunk(chunkOffset)
              )
            );
          
          if (cancelled) {
            return;
          }
  
          const totalLength =
            requestedEnd - requestedStart;
  
          const visibleData =
            new Uint8Array(totalLength);
  
          let destinationOffset = 0;
  
          for (
            let i = 0;
            i < chunks.length;
            i++
          ) {
            const chunkOffset =
              firstChunkOffset +
              i * CHUNK_SIZE;
  
            const copyStart = Math.max(
              requestedStart -
                chunkOffset,
              0
            );
  
            const copyEnd = Math.min(
              requestedEnd -
                chunkOffset,
              chunks[i].length
            );
  
            if (copyEnd <= copyStart) {
              continue;
            }
  
            const chunkSlice =
              chunks[i].subarray(
                copyStart,
                copyEnd
              );
  
            visibleData.set(
              chunkSlice,
              destinationOffset
            );
  
            destinationOffset +=
              chunkSlice.length;
          }
  
          if (cancelled) {
            return;
          }
  
          setStartOffset(requestedStart);
          setData(visibleData);
        } catch (error) {
          if (cancelled) {
            return;
          }
  
          console.error(error);
  
          setError(
            "Failed to load visible bytes"
          );
          setData(null);
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      }
  
      loadVisibleBytes();
  
      return () => {
        cancelled = true;
      };
    }, [
      cache,
      startRow,
      endRow,
      bytesPerRow,
      fileSize,
    ]);
  
    return {
      data,
      startOffset,
      loading,
      error,
    };
  }