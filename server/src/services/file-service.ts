import fs from "node:fs/promises";
import path from "node:path";
import { getDataDirectory, getFilePath } from "../utils/path.js";

export interface FileInfo {
  id: string;
  name: string;
  size: number;
}

export async function listFiles(): Promise<FileInfo[]> {
  const dataDirectory = getDataDirectory();

  const entries = await fs.readdir(dataDirectory, {
    withFileTypes: true,
  });

  const files: FileInfo[] = [];

  for (const entry of entries) {
    if (!entry.isFile()) {
      continue;
    }

    const filePath = path.join(dataDirectory, entry.name);
    const stats = await fs.stat(filePath);

    files.push({
      id: entry.name,
      name: entry.name,
      size: stats.size,
    });
  }

  return files;
}

export async function getFileMetadata(
  fileId: string
): Promise<FileInfo> {
  const filePath = getFilePath(fileId);
  const stats = await fs.stat(filePath);

  if (!stats.isFile()) {
    throw new Error("File not found");
  }

  return {
    id: fileId,
    name: fileId,
    size: stats.size,
  };
}