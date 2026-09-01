import { useEffect, useState } from "react";
import { CHUNK_SIZE } from "../services/chunk-cache";
import { formatFileSize, isPrintable } from "../utils/formatFIleSize";
import type { ChunkCache } from "../services/chunk-cache";

interface InspectorProps {
  fileName: string;
  fileSize: number;
  selectedOffset: number | null;
  cache: ChunkCache;
}


export default function Inspector({
  fileName,
  fileSize,
  selectedOffset,
  cache,
}: InspectorProps) {
  const [data, setData] =
    useState<Uint8Array | null>(null);

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    if (selectedOffset === null) {
      setData(null);
      return;
    }

    let cancelled = false;

    async function loadChunk() {
      setLoading(true);

      try {
        const chunkOffset =
          Math.floor(
            selectedOffset! / CHUNK_SIZE
          ) * CHUNK_SIZE;

        const chunk =
          await cache.getChunk(chunkOffset);

        if (!cancelled) {
          setData(chunk);
        }
      } catch (error) {
        console.error(
          "Failed to load inspector data",
          error
        );

        if (!cancelled) {
          setData(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadChunk();

    return () => {
      cancelled = true;
    };
  }, [selectedOffset, cache]);

  if (selectedOffset === null) {
    return (
      <aside className="inspector">
        <div className="panel-title">
          Inspector
        </div>

        <div className="empty-state">
          Select a byte to inspect it.
        </div>
      </aside>
    );
  }

  const chunkOffset =
    Math.floor(
      selectedOffset / CHUNK_SIZE
    ) * CHUNK_SIZE;

  const byteIndex =
    selectedOffset - chunkOffset;

  const availableBytes =
    data && byteIndex >= 0
      ? data.length - byteIndex
      : 0;

  const byte =
    data &&
    byteIndex >= 0 &&
    byteIndex < data.length
      ? data[byteIndex]
      : undefined;

  const readValue = (
    byteLength: number,
    littleEndian: boolean
  ): number | bigint | null => {
    if (
      !data ||
      byteIndex < 0 ||
      availableBytes < byteLength
    ) {
      return null;
    }

    const view = new DataView(
      data.buffer,
      data.byteOffset,
      data.byteLength
    );

    switch (byteLength) {
      case 1:
        return view.getUint8(byteIndex);

      case 2:
        return view.getUint16(
          byteIndex,
          littleEndian
        );

      case 4:
        return view.getUint32(
          byteIndex,
          littleEndian
        );

      case 8:
        return view.getBigUint64(
          byteIndex,
          littleEndian
        );

      default:
        return null;
    }
  };

  return (
    <aside className="inspector">
      <div className="panel-title">
        Inspector
      </div>

      <div className="inspector-content">
        <div className="inspector-section">
          <div className="label">
            File
          </div>

          <div>{fileName}</div>
        </div>

        <div className="inspector-section">
          <div className="label">
            Size
          </div>

          <div>
            {formatFileSize(fileSize)}
          </div>
        </div>

        <div className="inspector-section">
          <div className="label">
            Offset
          </div>

          <div>
            0x
            {selectedOffset
              .toString(16)
              .padStart(10, "0")
              .toUpperCase()}
          </div>
        </div>

        {loading ? (
          <div className="loading">
            Loading...
          </div>
        ) : (
          <>
            <InspectorValue
              label="uint8"
              value={readValue(1, true)}
            />

            <InspectorValue
              label="uint16 LE"
              value={readValue(2, true)}
            />

            <InspectorValue
              label="uint16 BE"
              value={readValue(2, false)}
            />

            <InspectorValue
              label="uint32 LE"
              value={readValue(4, true)}
            />

            <InspectorValue
              label="uint32 BE"
              value={readValue(4, false)}
            />

            <InspectorValue
              label="uint64 LE"
              value={readValue(8, true)}
            />

            <InspectorValue
              label="uint64 BE"
              value={readValue(8, false)}
            />

            <InspectorValue
              label="ASCII"
              value={
                byte === undefined
                  ? null
                  : isPrintable(byte)
                    ? String.fromCharCode(byte)
                    : "."
              }
            />
          </>
        )}
      </div>
    </aside>
  );
}

interface InspectorValueProps {
  label: string;
  value:
    | number
    | bigint
    | string
    | null;
}

function InspectorValue({
  label,
  value,
}: InspectorValueProps) {
  return (
    <div className="inspector-value">
      <span className="label">
        {label}
      </span>

      <span>
        {value === null
          ? "—"
          : value.toString()}
      </span>
    </div>
  );
}
