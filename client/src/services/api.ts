import type {
    FileInfo,
    FileMetadata,
  } from "../types";
  
  const API_BASE_URL = "http://localhost:3000/api";
  
  export async function getFiles(): Promise<FileInfo[]> {
    const response = await fetch(`${API_BASE_URL}/files`);
  
    if (!response.ok) {
      throw new Error("Failed to fetch files");
    }
  
    return response.json();
  }
  
  export async function getFileMetadata(
    fileId: string
  ): Promise<FileMetadata> {
    const response = await fetch(
      `${API_BASE_URL}/files/${encodeURIComponent(fileId)}/meta`
    );
  
    if (!response.ok) {
      throw new Error("Failed to fetch file metadata");
    }
  
    return response.json();
  }
  
  export async function getFileChunk(
    fileId: string,
    offset: number,
    length: number
  ): Promise<ArrayBuffer> {
    const params = new URLSearchParams({
      offset: String(offset),
      length: String(length),
    });
  
    const response = await fetch(
      `${API_BASE_URL}/files/${encodeURIComponent(fileId)}/chunk?${params}`
    );
  
    if (!response.ok) {
      throw new Error("Failed to fetch file chunk");
    }
  
    return response.arrayBuffer();
  }