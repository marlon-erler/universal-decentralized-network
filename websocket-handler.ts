// TYPES

import { SubscriptionMap } from "./subscriptionMap";
import { WS } from "./index";
import { guardStringNotEmpty } from "./utility";

// requests
export interface IncomingMessage {
  // subscribing to channel
  subscribeChannel?: string;
  unsubscribeChannel?: string;

  //sending message
  messageChannel?: string;
  messageBody?: string;
}

// TRACKING
const subscriptions = new SubscriptionMap();

export function trackSubscription(ws: WS, channel: string): void {
  subscriptions.set(ws, channel);
  confirmSubscription(ws, channel);
}

export function removeSubscription(ws: WS, channel: string): void {
  subscriptions.delete(ws, channel);
  confirmSubscription(ws, channel);
}

export function forgetConnection(ws: WS): void {
  const channels = subscriptions.getChannelList(ws);
  channels?.forEach((channel) => {
    subscriptions.delete(ws, channel);
  });
}

// PROCESS MESSAGE
export function processMessage(ws: WS, messageString: string): void {
  const messageObject: IncomingMessage = parseMessage(messageString);

  guardStringNotEmpty(messageObject.subscribeChannel, (subscribeChannel) => {
    trackSubscription(ws, subscribeChannel);
  });
  guardStringNotEmpty(
    messageObject.unsubscribeChannel,
    (unsubscribeChannel) => {
      removeSubscription(ws, unsubscribeChannel);
    }
  );
  guardStringNotEmpty(
    messageObject.messageChannel == "string",
    (messageChannel) => {
      if (!messageObject.messageBody) return;
      sendMessage(messageChannel, messageObject.messageBody);
    }
  );
}

// MESSAGING
export function stringifyMessage(messageObject: Object): string {
  return JSON.stringify(messageObject);
}

export function parseMessage(messageString: string): Object {
  return JSON.parse(messageString);
}

export function sendMessage(channel: string, body: string): void {
  const messageObject = { channel, body };
  const messageString = stringifyMessage(messageObject);

  const subscribers = subscriptions.getClientList(channel);
  subscribers?.forEach((ws) => ws.send(messageString));
}

function confirmSubscription(ws: WS, channel: string): void {
  const messageObject = {
    channel: channel,
    subscribed: subscriptions.getChannelList(ws) ? true : false,
  };
  const messageString = stringifyMessage(messageObject);
  console.log(messageString);
  ws.send(messageString);
}
