import { Router } from "express";
import fs from "node:fs";
import { getFilePath } from "../utils/path.js";
import { getFileMetadata, listFiles } from "../services/file-service.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const files = await listFiles();

    res.json(files);
  } catch (error) {
    console.error("Failed to list files:", error);

    res.status(500).json({
      error: "Failed to list files",
    });
  }
});

router.get("/:id/meta", async (req, res) => {
    try {
      const file = await getFileMetadata(req.params.id);
  
      res.json({
        name: file.name,
        size: file.size,
      });
    } catch (error) {
      console.error("Failed to get file metadata:", error);
  
      res.status(404).json({
        error: "File not found",
      });
    }
  });

router.get("/:id/chunk", async (req, res) => {
  try {
    const { id } = req.params;

    const offset = Number(req.query.offset);
    const length = Number(req.query.length);

    if (
      !Number.isSafeInteger(offset) ||
      !Number.isSafeInteger(length) ||
      offset < 0 ||
      length <= 0
    ) {
      return res.status(400).json({
        error: "offset and length must be positive integers",
      });
    }

    const filePath = getFilePath(id);

    const stats = await fs.promises.stat(filePath);

    if (!stats.isFile()) {
      return res.status(404).json({
        error: "File not found",
      });
    }

    // Offset must point inside the file.
    if (offset >= stats.size) {
      return res.status(416).json({
        error: "Offset is outside the file",
      });
    }

    const actualLength = Math.min(
      length,
      stats.size - offset
    );

    const end = offset + actualLength - 1;

    res.status(200);
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Length", actualLength);

    const stream = fs.createReadStream(filePath, {
      start: offset,
      end,
    });

    stream.on("error", (error) => {
      console.error("Failed to read file chunk:", error);

      if (!res.headersSent) {
        res.status(500).json({
          error: "Failed to read file",
        });
      } else {
        res.destroy(error);
      }
    });

    stream.pipe(res);
  } catch (error) {
    console.error("Chunk request failed:", error);

    res.status(404).json({
      error: "File not found",
    });
  }
});

export default router;