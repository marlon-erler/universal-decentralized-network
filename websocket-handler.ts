import {
  doIfIsString,
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

  // mailbox
  requestingMailboxSetup?: boolean;
  assignedMailboxId?: string;

  // subscribing to channel
  subscribeChannel?: string;
  unsubscribeChannel?: string;

  //sending message
  messageChannel?: string;
  messageBody?: string;
}

// TRACKING
const knownMessageIds = new Set<string>();

export const subscriptionMap = new SubscriptionMap();
export const clientsConnected = new Set<WS>();
export const serversConnectedAsClient = new Set<WS>();
export const serversConnected = new Set<WebSocket>();
export const serversDisconnected = new Set<string>();

export function getServerCount() {
  return serversConnected.size + serversConnectedAsClient.size;
}

export function trackConnection(ws: WS) {
  clientsConnected.add(ws);
}

export function forgetConnection(ws: WS): void {
  clientsConnected.delete(ws);
  serversConnectedAsClient.delete(ws);

  const channels = subscriptionMap.getChannelList(ws);
  channels?.forEach((channel) => {
    subscriptionMap.delete(ws, channel);
  });
}

export function trackSubscription(ws: WS, channel: string): void {
  subscriptionMap.set(ws, channel);
  confirmSubscription(ws, channel);
}

export function forgetSubscription(ws: WS, channel: string): void {
  subscriptionMap.delete(ws, channel);
  confirmSubscription(ws, channel);
}

// OTHER SERVERS
export function connectServers(config: typeof defaultConfig): void {
  config.connectedServers.forEach((serverAddress) => {
    connectServer(serverAddress, config);
  });
}

export function reconnectServers(config: typeof defaultConfig): void {
  [...serversDisconnected.values()].forEach((address) => {
    connectServer(address, config);
  });
}

export function connectServer(
  address: string,
  config: typeof defaultConfig
): void {
  try {
    // connect
    const ws = new WebSocket(address);
    serversConnected.add(ws);

    // listen
    ws.addEventListener("open", () => {
      serversDisconnected.delete(address);

      writeSuccess(`connected to server at "${address}".`);

      subscribeChannels(ws, config);
      requestServerConnection(ws);
    });

    ws.addEventListener("message", (message) => {
      processMessage(ws, message.data.toString(), config);
    });

    ws.addEventListener("close", () => {
      serversConnected.delete(ws);
      serversDisconnected.add(address);
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
    ["channels", subscriptionMap.clientsPerChannel.size],
    ["clients connected", clientsConnected.size],
    ["servers connected", getServerCount()],
    ["servers disconnected", serversDisconnected.size],
  ];
}

// PROCESS MESSAGE
export function processMessage(
  ws: WS,
  messageString: string,
  config: typeof defaultConfig
): void {
  // check id
  const messageObject: WebSocketMessage = parseMessage(messageString);
  if (!messageObject.uuid) {
    // assign if no id
    messageObject.uuid = Crypto.randomUUID();
  } else {
    // ignore if already seen
    if (knownMessageIds.has(messageObject.uuid)) return;
  }
  // remember message
  knownMessageIds.add(messageObject.uuid);

  // subscriptions
  doIfIsString(messageObject.subscribeChannel, (subscribeChannel) => {
    trackSubscription(ws, subscribeChannel);
  });
  doIfIsString(messageObject.unsubscribeChannel, (unsubscribeChannel) => {
    forgetSubscription(ws, unsubscribeChannel);
  });

  // message
  doIfIsString(messageObject.messageChannel, (messageChannel) => {
    if (messageObject.messageBody == undefined) return;
    sendMessage(messageChannel, messageObject.messageBody, messageObject.uuid!);
  });

  // other server
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
    const subscribers = subscriptionMap.getClientList(channel);
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
    subscribed: subscriptionMap.getChannelList(ws) ? true : false,
  };
  const messageString = stringifyMessage(messageObject);
  ws.send(messageString);
}
