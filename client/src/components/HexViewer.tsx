import { useMemo, useRef, useState } from "react";

import { useLogicalScroll } from "../hooks/useLogicalScroll";
import { useVisibleBytes } from "../hooks/useVisibleBytes";
import type { ChunkCache } from "../services/chunk-cache";
import HexRow from "./HexRow";
import SmallFileViewer from "./SmallFileViewer";
import { VISIBLE_ROWS, OVERSCAN_ROWS, LARGE_FILE_THRESHOLD } from "../constants/viewer";

interface HexViewerProps {
  cache: ChunkCache;
  fileSize: number;
  bytesPerRow?: number;
  setBytesPerRow: (bytesPerRow: number) => void;
  selectedOffset: number | null;
  setSelectedOffset: (offset: number | null) => void;
}


export function HexViewer({
  cache,
  fileSize,
  bytesPerRow = 16,
  setBytesPerRow,
  selectedOffset,
  setSelectedOffset,
}: HexViewerProps) {
  const parentRef =
    useRef<HTMLDivElement>(null);

    const [hoveredOffset, setHoveredOffset] =
    useState<number | null>(null);

  const {
    scrollHeight,
    scrollTop,
    logicalOffset,
    onScroll,
  } = useLogicalScroll(fileSize);

  const logicalRow =
    Math.floor(
      logicalOffset / bytesPerRow
    );

  const startRow = Math.max(
    0,
    logicalRow - OVERSCAN_ROWS
  );

  const totalRows = Math.ceil(
    fileSize / bytesPerRow
  );

  const endRow = Math.min(
    totalRows,
    startRow +
      VISIBLE_ROWS +
      OVERSCAN_ROWS * 2
  );

  const {
    data,
    startOffset,
    loading,
    error,
  } = useVisibleBytes(
    cache,
    startRow,
    endRow,
    bytesPerRow,
    fileSize
  );

  const rows = useMemo(() => {
    if (!data) {
      return [];
    }

    return Array.from(
      {
        length: endRow - startRow,
      },
      (_, index) => {
        const globalRow =
          startRow + index;

        const rowOffset =
          globalRow * bytesPerRow;

        const dataStart =
          rowOffset - startOffset;

        const rowBytes =
          dataStart >= 0 &&
          dataStart < data.length
            ? data.slice(
                dataStart,
                Math.min(
                  dataStart +
                    bytesPerRow,
                  data.length
                )
              )
            : new Uint8Array();

        return {
          globalRow,
          offset: rowOffset,
          bytes: rowBytes,
        };
      }
    );
  }, [
    data,
    startOffset,
    startRow,
    endRow,
    bytesPerRow,
  ]);

  if (fileSize <= LARGE_FILE_THRESHOLD) {
    return (
      <SmallFileViewer
      cache={cache}
      fileSize={fileSize}
      bytesPerRow={bytesPerRow}
      setBytesPerRow={setBytesPerRow}
      hoveredOffset={hoveredOffset}
      selectedOffset={selectedOffset}
      onHover={setHoveredOffset}
      onSelect={setSelectedOffset}
      />
    );
  }

  return (
    <main
      ref={parentRef}
      className="hex-viewer"
      onScroll={onScroll}
    >
      
      <div
        style={{
          position: "relative",
          height: `${scrollHeight}px`,
          width: "100%",
        }}
      >
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

        <div
          style={{
            position: "absolute",
            top: `${scrollTop + 90}px`,
            left: 0,
            right: 0,
          }}
        >
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

          {rows.map((row) => (
            <HexRow
            key={row.globalRow}
            offset={row.offset}
            bytes={row.bytes}
            bytesPerRow={bytesPerRow}
            hoveredOffset={hoveredOffset}
            selectedOffset={selectedOffset}
            onHover={setHoveredOffset}
            onSelect={setSelectedOffset}
            />
          ))}
        </div>
      </div>
    </main>
  );
}



