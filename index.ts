#!/usr/bin/env bun

import { ServerWebSocket, write } from "bun";
import {
  addConnection,
  connectServer,
  connectServers,
  connectedClientCount,
  forgetConnection,
  getStats,
  processMessage,
  subscribeChannel,
  subscriptions,
} from "./websocket-handler";
import { writeInfo, writeStat, writeSuccess } from "./utility";

import Colors from "colors";
import IP from "ip";
import Path from "path";
import { getConfig } from "./config-handler";

// CONFIG
const staticDir = "static/dist";
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
          return new Response(JSON.stringify(getStats()));
        default:
          return createFileResponse(requestPath);
      }
    },

    websocket: {
      open() {
        addConnection();
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

  // CLI
  writeSuccess(`###\nstarted up ${new Date().toLocaleString()}`);

  function updateCLI() {
    console.clear();
    console.log(Colors.bold.bgWhite("UNIVERSAL DECENTRALIZED NETWORK"));
    console.log();

    console.log(new Date().toLocaleString());
    console.log();

    writeInfo("server url", Colors.bold.green(server.url.toString()));
    writeInfo("server ip address", Colors.bold.green(IP.address()));
    console.log();

    getStats().forEach((entry) => writeStat(...entry));
  }

  setInterval(updateCLI, 5000);
}

main();
