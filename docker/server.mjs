/* global console, process, Response */

import { readFile } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";

import { serve } from "@hono/node-server";
import { Hono } from "hono";

const app = new Hono();

const DIST_DIR = resolve(process.cwd(), process.env.DIST_DIR ?? "dist");
const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? "0.0.0.0";

const CONTENT_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const getContentType = (filePath) => {
  const ext = extname(filePath).toLowerCase();
  return CONTENT_TYPES[ext] ?? "application/octet-stream";
};

const safePath = (requestPath) => {
  const decodedPath = (() => {
    try {
      return decodeURIComponent(requestPath);
    } catch {
      return requestPath;
    }
  })();

  const normalizedPath = normalize(decodedPath).replace(/^([.][./\\])+/, "");
  const relativePath = normalizedPath.replace(/^[/\\]+/, "");
  return resolve(join(DIST_DIR, relativePath));
};

const isWithinDist = (filePath) => filePath === DIST_DIR || filePath.startsWith(`${DIST_DIR}/`);

const readStaticFile = async (requestPath) => {
  const filePath = safePath(requestPath);
  if (!isWithinDist(filePath)) {
    return null;
  }

  try {
    const file = await readFile(filePath);
    return {
      file,
      filePath,
    };
  } catch {
    return null;
  }
};

const staticHandler = async (c) => {
  const requestPath = c.req.path === "/" ? "/index.html" : c.req.path;

  const staticFile = await readStaticFile(requestPath);
  if (staticFile) {
    const headers = {
      "content-type": getContentType(staticFile.filePath),
      "cache-control": requestPath.startsWith("/assets/")
        ? "public, max-age=31536000, immutable"
        : "no-cache",
    };
    return new Response(staticFile.file, { headers });
  }

  const indexFile = await readStaticFile("/index.html");
  if (!indexFile) {
    return c.text("index.html not found", 500);
  }

  return new Response(indexFile.file, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-cache",
    },
  });
};

app.get("/health", (c) => c.json({ status: "ok" }));
app.on(["GET", "HEAD"], "*", staticHandler);
app.all("*", (c) => c.text("Method Not Allowed", 405));

serve(
  {
    fetch: app.fetch,
    hostname: HOST,
    port: PORT,
  },
  (info) => {
    console.log(`CC98 web server listening on http://${info.address}:${info.port}`);
  },
);
