import * as React from "bloatless-react";

import { getText } from "./translations";

export class Message implements React.Identifiable {
  uuid = new React.UUID();

  constructor(public channel: string, public body: string) {}
}

// WS
const ws = new WebSocket(`ws://${window.location.host}`);

ws.addEventListener("open", () => updateStats());

ws.addEventListener("message", (message) => {
  const formatted = formatMessage(message);
  const { messageChannel, messageBody } = parseMessage(message);

  if (formatted) {
    lastReceivedMessage.value = formatted;
  }
  if (messageChannel && messageBody) {
    const messageObject = new Message(messageChannel, messageBody);
    if (messageBody) messages.add(messageObject);
  }
});

// STATE
// messages
export const messages = new React.ListState<Message>();
export const lastReceivedMessage = new React.State(
  getText("noMessagesReceived")
);

// stats
export const statHTMLString = new React.State<string>("");
export async function updateStats() {
  const response = await fetch(
    `${window.location.protocol}//${window.location.host}/stats`
  );
  const data: [string, string][] = await response.json();

  let html = "";
  data.forEach((item) => {
    const tile = (
      <div class="tile">
        <span class="secondary flex width-100">{item[0].toString()}</span>
        <b>{item[1].toString()}</b>
      </div>
    );
    html += tile.outerHTML;
  });
  statHTMLString.value = html;
}

// elements
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
  if (isMessageEmpty.value == true) return;
  sendToWS({
    messageChannel: newMessageChannel.value,
    messageBody: newMessageBody.value,
  });
  newMessageBody.value = "";
}
