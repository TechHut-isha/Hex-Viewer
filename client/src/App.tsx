import { useEffect, useState } from "react";
import { FileList } from "./components/FileList";
import { HexViewer } from "./components/HexViewer";
import { getFiles } from "./services/api";
import { useChunkCache } from "./hooks/useChunkCache";
import { useHexViewer } from "./hooks/useHexViewer";
import type { FileInfo } from "./types";
import "./styles.css";
import Inspector from "./components/Inspector";

function App() {
  const [files, setFiles] =
    useState<FileInfo[]>([]);

  const [selectedFileId, setSelectedFileId] =
    useState<string | null>(null);

  const [filesLoading, setFilesLoading] =
    useState(true);

  const [filesError, setFilesError] =
    useState<string | null>(null);

  const [bytesPerRow, setBytesPerRow] = useState(16);

  const [selectedOffset, setSelectedOffset] =
  useState<number | null>(null);

  const chunkCache =
    useChunkCache(selectedFileId);

  const {
    metadata,
    loading,
    error,
  } = useHexViewer(
    selectedFileId,
  );

  useEffect(() => {
    async function loadFiles() {
      try {
        const result = await getFiles();

        setFiles(result);

        if (result.length > 0) {
          setSelectedFileId(result[0].id);
        }
      } catch (error) {
        console.error(error);
        setFilesError("Failed to load files");
      } finally {
        setFilesLoading(false);
      }
    }

    loadFiles();
  }, []);

  if (filesLoading) {
    return (
      <div className="loading">
        Loading files...
      </div>
    );
  }

  if (filesError) {
    return (
      <div className="error">
        {filesError}
      </div>
    );
  }

  return (
    <div className="app">
      <FileList
        files={files}
        selectedFileId={selectedFileId}
        onSelect={(fileId) => {
          setSelectedFileId(fileId);
          setSelectedOffset(null);
        }}
      />

      {loading ? (
        <div className="loading">
          Loading file...
        </div>
      ) : error ? (
        <div className="error">
          {error}
        </div>
      ) :metadata ? (
        <>
        <HexViewer
        setBytesPerRow={setBytesPerRow}
        cache={chunkCache!}
        fileSize={metadata.size}
        bytesPerRow={bytesPerRow}
        selectedOffset={selectedOffset}
        setSelectedOffset={setSelectedOffset}
        />
           <Inspector
      fileName={metadata.name}
      fileSize={metadata.size}
      selectedOffset={selectedOffset}
      cache={chunkCache!}
    />
        </>
      ) : (
        <div className="loading">
          Select a file
        </div>
      )}
    </div>
  );
}

export default App;