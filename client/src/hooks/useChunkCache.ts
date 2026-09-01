import { useMemo } from "react";
import { ChunkCache } from "../services/chunk-cache";

export function useChunkCache(
  fileId: string | null
): ChunkCache | null {
  return useMemo(() => {
    if (!fileId) {
      return null;
    }

    return new ChunkCache(fileId);
  }, [fileId]);
}