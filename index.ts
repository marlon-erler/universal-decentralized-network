#!/usr/bin/env bun

import {
  addConnection,
  connectServers,
  forgetConnection,
  getWebSocketStats,
  processMessage,
} from "./websocket-handler";
import { writeInfo, writeStat, writeSuccess } from "./utility";

import Colors from "colors";
import IP from "ip";
import Path from "path";
import { ServerWebSocket } from "bun";
import { getConfig } from "./config-handler";

// CONFIG
const staticDir = Path.join(Path.dirname(import.meta.path), "static/dist");
const defaultPage = "index.html";

// TYPES
export type WS = ServerWebSocket<unknown> | WebSocket;

// MAIN
async function main() {
  // CONFIG
  const config = await getConfig();

  // SERVER
  const server = Bun.serve({
    port: config.port,

    fetch(request, server) {
      // allow websockets
      server.upgrade(request);

      // respond
      const requestPath = new URL(request.url).pathname;
      switch (requestPath) {
        case "/":
          return createFileResponse(defaultPage);
        case "/stats":
          return new Response(JSON.stringify(getAllStats()));
        default:
          return createFileResponse(requestPath);
      }
    },

    websocket: {
      open(ws) {
        addConnection(ws);
      },
      message(ws, message) {
        processMessage(ws, message.toString(), config);
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

  // OTHER SERVERS
  connectServers(config);

  // AUDIT
  function getServerStats(): [string, string][] {
    return [
      ["server url", server.url.toString()],
      ["server ip address", IP.address()],
    ];
  }

  function getAllStats(): [string, string | number][] {
    return [...getServerStats(), ...getWebSocketStats()];
  }

  // CLI
  writeSuccess(`###\nstarted up ${new Date().toLocaleString()}`);
  console.log("relevant output available in the 'logs' file");

  function updateCLI() {
    console.clear();
    console.log(Colors.bold.bgWhite("UNIVERSAL DECENTRALIZED NETWORK"));
    console.log();

    console.log(new Date().toLocaleString());
    console.log();

    getServerStats().forEach((entry) => writeInfo(...entry));
    console.log();
    getWebSocketStats().forEach((entry) => writeStat(...entry));
  }

  setInterval(updateCLI, 5000);
}

main();
