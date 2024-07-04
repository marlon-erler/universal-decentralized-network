import * as React from "bloatless-react";

import { getText } from "./translations";

export class Message implements React.Identifiable {
  uuid = new React.UUID();

  constructor(public channel: string, public body: string) {}
}

// WS
const ws = new WebSocket(`ws://${window.location.host}`);

ws.addEventListener("message", (message) => {
  const formatted = formatMessage(message);
  const { channel, body } = parseMessage(message);

  if (formatted) {
    lastReceivedMessage.value = formatted;
  }
  if (channel && body) {
    const messageObject = new Message(channel, body);
    if (body) messages.add(messageObject);
  }
});

// STATE
export const messages = new React.ListState<Message>();
export const lastReceivedMessage = new React.State(
  getText("noMessagesReceived")
);

export const subscriptionChannel = new React.State("");

export const newMessageChannel = new React.State("");
export const newMessageBody = new React.State("");

export const isMessageEmpty = React.createProxyState(
  [newMessageChannel, newMessageBody],
  () => newMessageChannel.value == "" || newMessageBody.value == ""
);

// METHODS
export function formatMessage(message: MessageEvent<any>): string | undefined {
  const object = parseMessage(message);
  const lines = Object.entries(object).map(
    (entry) => `${entry[0]}: ${entry[1]}`
  );
  return lines.join("\n");
}

export function parseMessage(message: MessageEvent<any>) {
  return JSON.parse(message.data.toString());
}

export function sendToWS(object: any) {
  const stringified = JSON.stringify(object);
  ws.send(stringified);
}

export function subscribe() {
  sendToWS({ subscribeChannel: subscriptionChannel.value });
}

export function unsubscribe() {
  sendToWS({ unsubscribeChannel: subscriptionChannel.value });
}

export function sendMessage() {
  sendToWS({
    messageChannel: newMessageChannel.value,
    messageBody: newMessageBody.value,
  });
  newMessageBody.value = "";
}
