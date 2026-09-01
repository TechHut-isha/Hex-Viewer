import type { FileInfo } from "../types";
import { formatFileSize } from "../utils/formatFIleSize";

interface FileListProps {
  files: FileInfo[];
  selectedFileId: string | null;
  onSelect: (fileId: string) => void;
}

export function FileList({
  files,
  selectedFileId,
  onSelect,
}: FileListProps) {
  return (
    <aside className="file-list">
      <div className="panel-title">Files</div>

      {files.length === 0 ? (
        <div className="empty-state">
          No files found
        </div>
      ) : (
        <div>
          {files.map((file) => (
            <button
              key={file.id}
              className={`file-item ${
                file.id === selectedFileId
                  ? "selected"
                  : ""
              }`}
              onClick={() => onSelect(file.id)}
            >
              <span className="file-name">
                {file.name}
              </span>

              <span className="file-size">
                {formatFileSize(file.size)}
              </span>
            </button>
          ))}
        </div>
      )}
    </aside>
  );
}

