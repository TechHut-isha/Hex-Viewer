function formatFileSize(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`;
    }
  
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
  
    if (bytes < 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }

  function formatOffset(offset: number): string {
    return offset
      .toString(16)
      .padStart(10, "0")
      .toUpperCase();
  }
  
  function isPrintable(byte: number): boolean {
    return byte >= 0x20 && byte <= 0x7e;
  }

  export { formatFileSize, formatOffset, isPrintable };