import { formatOffset, isPrintable } from "../utils/formatFIleSize";

interface HexRowProps {
  offset: number;
  bytes: Uint8Array;
  bytesPerRow: number;

  hoveredOffset: number | null;
  selectedOffset: number | null;

  onHover: (offset: number | null) => void;
  onSelect: (offset: number) => void;
}

export default function HexRow({
  offset,
  bytes,
  bytesPerRow,
  hoveredOffset,
  selectedOffset,
  onHover,
  onSelect,
}: HexRowProps) {
  return (
    <div className="hex-row">
      <span className="offset">
        {formatOffset(offset)}
      </span>

      <span className="hex">
        {Array.from(
          { length: bytesPerRow },
          (_, index) => {
            const byte = bytes[index];

            if (byte === undefined) {
              return (
                <span
                  key={index}
                  className="byte"
                >
                  {"  "}
                </span>
              );
            }

            const byteOffset =
              offset + index;

            const isHovered =
              hoveredOffset === byteOffset;

            const isSelected =
              selectedOffset === byteOffset;

            return (
              <span
                key={index}
                className={[
                  "byte",
                  isHovered
                    ? "hovered"
                    : "",
                  isSelected
                    ? "selected"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onMouseEnter={() =>
                  onHover(byteOffset)
                }
                onMouseLeave={() =>
                  onHover(null)
                }
                onClick={() =>
                  onSelect(byteOffset)
                }
              >
                {byte
                  .toString(16)
                  .padStart(2, "0")
                  .toUpperCase()}
              </span>
            );
          }
        )}
      </span>

      <span className="ascii">
        {Array.from(
          { length: bytesPerRow },
          (_, index) => {
            const byte = bytes[index];

            if (byte === undefined) {
              return (
                <span
                  key={index}
                  className="ascii-byte"
                >
                  {" "}
                </span>
              );
            }

            const byteOffset =
              offset + index;

            const isHovered =
              hoveredOffset === byteOffset;

            const isSelected =
              selectedOffset === byteOffset;

            return (
              <span
                key={index}
                className={[
                  "ascii-byte",
                  isHovered
                    ? "hovered"
                    : "",
                  isSelected
                    ? "selected"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onMouseEnter={() =>
                  onHover(byteOffset)
                }
                onMouseLeave={() =>
                  onHover(null)
                }
                onClick={() =>
                  onSelect(byteOffset)
                }
              >
                {isPrintable(byte)
                  ? String.fromCharCode(byte)
                  : "."}
              </span>
            );
          }
        )}
      </span>
    </div>
  );
}