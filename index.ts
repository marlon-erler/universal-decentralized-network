import { ServerWebSocket, write } from "bun";
import {
  addConnection,
  audit,
  connectionCount,
  forgetConnection,
  processMessage,
  subscriptions,
} from "./websocket-handler";
import { writeInfo, writeStat } from "./utility";

import Colors from "colors";
import IP from "ip";
import Path from "path";

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
function updateCLI() {
  console.clear();
  console.log(Colors.bold.bgWhite("UNIVERSAL DECENTRALIZED NETWORK"));
  console.log();

  console.log(new Date().toLocaleString());
  console.log();

  writeInfo("server url", Colors.bold.green(server.url.toString()));
  writeInfo("server ip address", Colors.bold.green(IP.address()));
  console.log();

  audit().forEach((entry) => writeStat(...entry));
}

updateCLI();
setInterval(updateCLI, 5000);
