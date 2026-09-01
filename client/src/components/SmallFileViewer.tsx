import { useVisibleBytes } from "../hooks/useVisibleBytes";
import type { ChunkCache } from "../services/chunk-cache";
import HexRow from "./HexRow";

interface SmallFileViewerProps {
    cache: ChunkCache;
    fileSize: number;
    bytesPerRow?: number;
    setBytesPerRow: (bytesPerRow: number) => void;
    hoveredOffset: number | null;
    selectedOffset: number | null;
    onHover: (offset: number | null) => void;
    onSelect: (offset: number) => void;
  }
  
function SmallFileViewer({
    cache,
    fileSize,
    bytesPerRow = 16,
    setBytesPerRow,
    hoveredOffset,
    selectedOffset,
    onHover,
    onSelect,
  }: SmallFileViewerProps) {
    const totalRows = Math.ceil(
      fileSize / bytesPerRow
    );
  
    const {
      data,
      startOffset,
      loading,
      error,
    } = useVisibleBytes(
      cache,
      0,
      totalRows,
      bytesPerRow,
      fileSize
    );
  
    const rows = [];
  
    if (data) {
      for (let row = 0; row < totalRows; row++) {
        const rowOffset =
          row * bytesPerRow;
  
        const dataStart =
          rowOffset - startOffset;
  
        const rowBytes =
          data.slice(
            dataStart,
            Math.min(
              dataStart + bytesPerRow,
              data.length
            )
          );
  
        rows.push(
          <HexRow
            key={row}
            offset={rowOffset}
            bytes={rowBytes}
            bytesPerRow={bytesPerRow}
            hoveredOffset={hoveredOffset}
            selectedOffset={selectedOffset}
            onHover={onHover}
            onSelect={onSelect}
          />
        );
      }
    }
  
    return (
      <main className="hex-viewer">
        <div className="hex-header">
          <span>Offset</span>
          <span>Hex</span>
          <span>ASCII</span>
        </div>
        <div className="row-size-control">
  <span>Bytes per row:</span>

  {[8, 16, 32].map((size) => (
    <button
      key={size}
      type="button"
      onClick={() => setBytesPerRow(size)}
      className={
        bytesPerRow === size
          ? "active"
          : ""
      }
    >
      {size}
    </button>
  ))}
</div>
        {loading && (
          <div className="loading">
            Loading bytes...
          </div>
        )}
  
        {error && (
          <div className="error">
            {error}
          </div>
        )}
  
        {rows}
      </main>
    );
  }

  export default SmallFileViewer;