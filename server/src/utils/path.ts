import path from "node:path";

const DATA_DIR = path.resolve(process.cwd(), "..", "data");

export function getDataDirectory(): string {
  return DATA_DIR;
}

export function getFilePath(fileId: string): string {
  const filePath = path.resolve(DATA_DIR, fileId);

  const relativePath = path.relative(DATA_DIR, filePath);

  // Prevent:
  // ../outside-file
  // folder/file.bin
  if (
    relativePath.startsWith("..") ||
    path.isAbsolute(relativePath) ||
    relativePath.includes(path.sep)
  ) {
    throw new Error("Invalid file path");
  }

  return filePath;
}