import { useEffect, useState } from "react";
import { getFileMetadata } from "../services/api";
import type { FileMetadata } from "../types";

interface UseHexViewerResult {
  metadata: FileMetadata | null;
  loading: boolean;
  error: string | null;
}

export function useHexViewer(
  fileId: string | null,
): UseHexViewerResult {
  const [metadata, setMetadata] =
    useState<FileMetadata | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

    useEffect(() => {
        if (!fileId) {
          setMetadata(null);
          setLoading(false);
          return;
        }
      
        const currentFileId = fileId;
      
        let cancelled = false;
      
        async function loadMetadata() {
          try {
            setLoading(true);
            setError(null);
      
            const fileMetadata =
              await getFileMetadata(
                currentFileId
              );
      
            if (cancelled) {
              return;
            }
      
            setMetadata(fileMetadata);
          } catch (error) {
            if (cancelled) {
              return;
            }
      
            console.error(error);
      
            setError(
              "Failed to load file metadata"
            );
            setMetadata(null);
          } finally {
            if (!cancelled) {
              setLoading(false);
            }
          }
        }
      
        loadMetadata();
      
        return () => {
          cancelled = true;
        };
      }, [fileId]);

  return {
    metadata,
    loading,
    error,
  };
}