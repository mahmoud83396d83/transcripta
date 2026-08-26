import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "../server/_core/oauth";
import { registerStorageProxy } from "../server/_core/storageProxy";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import { uploadRequestFile } from "../server/uploads";

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.post("/api/uploads/request-file", express.raw({ type: "application/octet-stream", limit: "50mb" }), async (req, res) => {
  try {
    const encodedFileName = String(req.header("x-file-name") || "transcription-file");
    const fileName = decodeURIComponent(encodedFileName);
    const contentType = String(req.header("x-file-type") || "application/octet-stream");
    const data = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body || []);
    const result = await uploadRequestFile({ fileName, contentType, data });
    res.status(201).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    const status = message.startsWith("Unsupported") || message.startsWith("File size") ? 400 : 500;
    res.status(status).json({ error: message });
  }
});

registerStorageProxy(app);
registerOAuthRoutes(app);

app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

export default app;
