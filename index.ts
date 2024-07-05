import { ServerWebSocket, write } from "bun";
import {
  addConnection,
  audit,
  connectionCount,
  forgetConnection,
  processMessage,
  subscriptions,
} from "./websocket-handler";

import Colors from "colors";
import Path from "path";
import { writeStat } from "./utility";

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
    open() {
      addConnection();
    },
    message(ws, message) {
      processMessage(ws, message.toString());
    },
    close(ws) {
      forgetConnection(ws);
    },
  },
});

function createFileResponse(requestPath: string): Response {
  const fullPath = Path.join(staticDir, requestPath);
  return new Response(Bun.file(fullPath));
}

// CLI
function output() {
  console.clear();
  console.log("Server up on", Colors.bold.green(server.url.toString()));
  console.log();
  console.log(new Date().toLocaleString());
  console.log();
  audit().forEach((entry) => writeStat(...entry));
}

output();
setInterval(output, 5000);
