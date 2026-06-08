import { defineConfig } from "vite-plus";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  fmt: {
    ignorePatterns: ["src/routeTree.gen.ts"],
  },

  lint: {
    ignorePatterns: ["src/routeTree.gen.ts"],
  },

  staged: {
    "*.{js,jsx,ts,tsx,css}": "vp check --fix",
  },

  plugins: [tanstackRouter(), react(), tailwindcss()],
  oxc: {
    jsx: {
      runtime: "automatic",
      importSource: "react",
    },
  },

  // 路径别名
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@routes": path.resolve(__dirname, "./src/routes"),
      "@stores": path.resolve(__dirname, "./src/stores"),
      "@services": path.resolve(__dirname, "./src/services"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@lib": path.resolve(__dirname, "./src/lib"),
      "@styles": path.resolve(__dirname, "./src/styles"),
      "@types": path.resolve(__dirname, "./src/types"),
      "@config": path.resolve(__dirname, "./src/config"),
    },
  },

  // 开发服务器配置
  server: {
    port: 5173,
    proxy: {
      // API 请求代理
      "/api": {
        target: "https://qsh.api.cc98.top",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      // OpenID 请求代理
      "/openid": {
        target: "https://qsh.openid.cc98.top",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/openid/, ""),
      },
      // SignalR WebSocket 代理
      "/hub": {
        target: "https://qsh.api.cc98.top",
        changeOrigin: true,
        ws: true,
      },
    },
  },

  // 构建配置
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;

          if (id.includes("/react/") || id.includes("/react-dom/")) {
            return "react-vendor";
          }

          if (id.includes("/@tanstack/react-router/")) {
            return "router-vendor";
          }

          if (id.includes("/@tanstack/react-query/")) {
            return "query-vendor";
          }

          if (id.includes("/@microsoft/signalr/")) {
            return "signalr-vendor";
          }

          if (id.includes("/@cc98/hell-react-mde/")) {
            return "editor-vendor";
          }

          return undefined;
        },
      },
    },
  },

  // 优化配置
  optimizeDeps: {
    include: ["react", "react-dom", "@tanstack/react-router", "@tanstack/react-query"],
  },
});
