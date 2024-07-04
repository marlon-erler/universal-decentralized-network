import { forgetConnection, processMessage } from "./websocket-handler";

import Path from "path";
import { ServerWebSocket } from "bun";

// CONFIG
const staticDir = "static/dist";
const defaultPage = "index.html";

// TYPES
export type WS = ServerWebSocket<unknown>;

// SERVER
const server = Bun.serve({
  fetch(request, server) {
    // allow websockets
    server.upgrade(request);

    // respond
    const requestPath = new URL(request.url).pathname;
    switch (requestPath) {
      case "/":
        return createFileResponse(defaultPage);
      default:
        return createFileResponse(requestPath);
    }
  },

  websocket: {
    message(ws, message) {
      processMessage(ws, message.toString());
    },
    close(ws, code, reason) {
      forgetConnection(ws);
    },
  },
});

function createFileResponse(requestPath: string): Response {
  const fullPath = Path.join(staticDir, requestPath);
  return new Response(Bun.file(fullPath));
}

console.log(`Server up on port ${server.port}.`);
