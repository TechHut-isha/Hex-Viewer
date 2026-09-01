# File Hex Viewer

A browser-based hex viewer built with React, TypeScript, Node.js, and Express.

The viewer is designed to inspect files ranging from small files to very large files such as 10 GB while keeping memory usage, network transfer, and DOM size bounded.

## Tech Stack

- React
- TypeScript
- Vite
- Node.js
- Express
- Client-side LRU chunk cache
- Custom logical/page virtualization

---

## Prerequisites

Only **Node.js and npm** are required.

Check your installation:

```bash
node --version
npm --version
````

---

## Project Structure

```text
hex-viewer/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── constants/
│   └── package.json
│
├── server/                 # Node.js + Express backend
│   ├── src/
│   └── package.json
│
├── data/                   # Files available to the viewer
│   ├── sample.bin
│   ├── sample.txt
│   ├── large.bin
│   └── 10gb.bin
│
└── README.md
```

The backend reads files from the root `./data/` directory. Only files directly inside this directory are considered.

---

## Running the Project

### Start the Backend

Open a terminal:

```bash
cd server
npm install
npm run dev
```

The backend runs on:

```text
http://localhost:3000
```

### Start the Frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

Open the URL displayed by Vite, typically:

```text
http://localhost:5173
```

---

## Test Data

Place files directly inside:

```text
./data/
```

The backend automatically discovers the available files.

---

# API

The Express backend provides the following endpoints:

### List Files

```http
GET /api/files
```

Returns the available files and their metadata.

### File Metadata

```http
GET /api/files/:id/meta
```

Returns metadata for a selected file.

### Read File Chunk

```http
GET /api/files/:id/chunk?offset=<offset>&length=<length>
```

Returns the requested byte range as raw binary data.

The backend reads only the requested range rather than loading the complete file.

---

# Implemented Features

* File listing and selection
* File metadata
* HEX and ASCII views
* 8 / 16 / 32 bytes per row
* Byte hover
* HEX/ASCII synchronized hover
* Byte selection
* HEX/ASCII synchronized selection
* Byte Inspector
* `uint8`
* `uint16` little-endian / big-endian
* `uint32` little-endian / big-endian
* `uint64` little-endian / big-endian
* ASCII representation
* Chunked file loading
* Bounded LRU cache
* Custom virtualization
* Logical scrolling for large files
* Large-file testing, including a 10 GB file

---

# Architecture

The application is split into a React frontend and an Express backend.

```text
Browser
   │
   ├── File List
   ├── Hex Viewer
   └── Inspector
          │
          ▼
     Chunk Cache
          │
          │ byte-range requests
          ▼
   Express Backend
          │
          ▼
       ./data/
```

The backend is responsible for file discovery, metadata, validation, and reading requested byte ranges.

The frontend is responsible for rendering, virtualization, caching, scrolling, selection, and byte inspection.

---

# Large File Approach

The viewer does not load the complete file into browser memory.

Instead, the data flow is:

```text
File
  ↓
Byte-range request
  ↓
64 KB chunk
  ↓
LRU cache
  ↓
Visible data
  ↓
Rendered rows
```

Only the data required around the current viewport is fetched and rendered.

The cache is bounded so memory usage does not continuously grow while navigating through a large file.

---

# Virtualization and Logical Scrolling

The viewer renders only a small window of rows around the current viewport instead of creating DOM elements for the entire file.

For very large files, logical file position is separated from the browser's physical scroll position. This allows the scrollbar to represent the position within a large file without requiring an enormous DOM element.

The virtualization and scrolling logic are implemented in the application rather than relying on a third-party virtualization library.

---

# Design Decisions

### 64 KB Chunks

A 64 KB chunk size provides a balance between request overhead and the amount of data fetched for the viewport.

### Bounded LRU Cache

Recently accessed chunks are retained while older chunks are evicted to keep memory usage bounded.

### Custom Virtualization

Only the rows needed for the current viewport are rendered, keeping the DOM size approximately constant as file size increases.

### Logical Scrolling

Logical scrolling avoids relying on a browser element whose physical height directly represents the entire file.

---

# Prioritization

The assignment contains more functionality than can reasonably be completed within the available implementation time.

I prioritized the core large-file requirements:

1. Chunked backend access
2. Correct byte ranges
3. Bounded caching
4. Virtualized rendering
5. Logical scrolling
6. Accurate offsets
7. HEX/ASCII synchronization
8. 8 / 16 / 32 bytes per row
9. Hover and click selection
10. Byte Inspector

---

# Testing

The viewer was manually tested with:

* Small binary files
* Text files
* 100 MB files
* 10 GB files
* Different byte offsets and ranges
* 8 / 16 / 32 bytes per row
* HEX/ASCII synchronization
* Hover and selection
* Inspector decoding
* Large-file scrolling

The 10 GB file was tested to verify that the application can open and navigate a very large file without loading the entire file into browser memory.

```
```
