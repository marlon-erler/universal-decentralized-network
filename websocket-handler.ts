import {
  guardStringNotEmpty,
  parseMessage,
  stringifyMessage,
  writeError,
  writeSuccess,
} from "./utility";

import Crypto from "crypto";
import { SubscriptionMap } from "./subscriptionMap";
import { WS } from "./index";
import { defaultConfig } from "./config-handler";

// requests
export interface WebSocketMessage {
  uuid?: string;

  // connecting to server
  requestingServerConnection?: boolean;

  // subscribing to channel
  subscribeChannel?: string;
  unsubscribeChannel?: string;

  //sending message
  messageChannel?: string;
  messageBody?: string;
}

// TRACKING
const knownMessageIds = new Set<string>();

export const subscriptions = new SubscriptionMap();
export const clientsConnected = new Set<WS>();
export const serversConnectedAsClient = new Set<WS>();
export const serversConnected = new Set<WebSocket>();

export function getServerCount() {
  return serversConnected.size + serversConnectedAsClient.size;
}

export function addConnection(ws: WS) {
  clientsConnected.add(ws);
}

export function trackSubscription(ws: WS, channel: string): void {
  subscriptions.set(ws, channel);
  confirmSubscription(ws, channel);
}

export function removeSubscription(ws: WS, channel: string): void {
  subscriptions.delete(ws, channel);
  confirmSubscription(ws, channel);
}

export function forgetConnection(ws: WS): void {
  clientsConnected.delete(ws);
  const channels = subscriptions.getChannelList(ws);
  channels?.forEach((channel) => {
    subscriptions.delete(ws, channel);
  });
}

// OTHER SERVERS
export function connectServers(config: typeof defaultConfig): void {
  config.connectedServers.forEach((serverAddress) => {
    connectServer(serverAddress, config);
  });
}

export function connectServer(
  address: string,
  config: typeof defaultConfig
): void {
  try {
    const ws = new WebSocket(address);
    serversConnected.add(ws);

    ws.addEventListener("open", () => {
      writeSuccess(`connected to server at "${address}".`);

      subscribeChannels(ws, config);
      requestServerConnection(ws);
    });

    ws.addEventListener("message", (message) => {
      processMessage(ws, message.data.toString(), config);
    });

    ws.addEventListener("close", () => {
      serversConnected.delete(ws);
      writeError(`server at "${address}" disconnected`);
    });
  } catch (error) {
    writeError(`failed to connect to server at "${address}": ${error}`);
  }
}

function subscribeChannels(ws: WS, config: typeof defaultConfig): void {
  config.subscribedChannels.forEach((channel) => {
    subscribeChannel(ws, channel);
  });
}

export function subscribeChannel(server: WS, channel: string): void {
  const message: WebSocketMessage = {
    subscribeChannel: channel,
  };
  const messageString = stringifyMessage(message);
  server.send(messageString);
}

// AUDIT
export function getWebSocketStats(): [string, number][] {
  return [
    ["channels", subscriptions.clientsPerChannel.size],
    ["clients connected", clientsConnected.size],
    ["servers connected", getServerCount()],
  ];
}

// PROCESS MESSAGE
export function processMessage(
  ws: WS,
  messageString: string,
  config: typeof defaultConfig
): void {
  const messageObject: WebSocketMessage = parseMessage(messageString);
  if (!messageObject.uuid) {
    messageObject.uuid = Crypto.randomUUID();
  } else {
    if (knownMessageIds.has(messageObject.uuid)) return;
  }
  knownMessageIds.add(messageObject.uuid);

  guardStringNotEmpty(messageObject.subscribeChannel, (subscribeChannel) => {
    trackSubscription(ws, subscribeChannel);
  });
  guardStringNotEmpty(
    messageObject.unsubscribeChannel,
    (unsubscribeChannel) => {
      removeSubscription(ws, unsubscribeChannel);
    }
  );
  guardStringNotEmpty(messageObject.messageChannel, (messageChannel) => {
    if (messageObject.messageBody == undefined) return;
    sendMessage(messageChannel, messageObject.messageBody, messageObject.uuid!);
  });
  if (messageObject.requestingServerConnection == true) {
    clientsConnected.delete(ws);
    serversConnectedAsClient.add(ws);
    subscribeChannels(ws, config);
  }
}

// MESSAGING
export function sendMessage(
  messageChannel: string,
  messageBody: string,
  uuid: string
): void {
  const channels = messageChannel.split("/");

  const messageObject = { uuid, messageChannel, messageBody };
  const messageString = stringifyMessage(messageObject);

  channels.forEach((channel) => {
    const subscribers = subscriptions.getClientList(channel);
    subscribers?.forEach((ws) => ws.send(messageString));
  });
}

function requestServerConnection(ws: WS): void {
  const messageObject = {
    requestingServerConnection: true,
  };
  const messageString = stringifyMessage(messageObject);
  ws.send(messageString);
}

function confirmSubscription(ws: WS, messageChannel: string): void {
  const messageObject = {
    messageChannel,
    subscribed: subscriptions.getChannelList(ws) ? true : false,
  };
  const messageString = stringifyMessage(messageObject);
  ws.send(messageString);
}
