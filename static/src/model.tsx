import * as React from "bloatless-react";

import UDNFrontend from "udn-frontend";
import { getText } from "./translations";

export class Message implements React.Identifiable {
  id = React.UUID();

  constructor(public channel: string, public body: string) {}
}

// UDN Frontend
const UDN = new UDNFrontend();

UDN.onconnect = () => {
  isDisconnected.value = false;
  updateStats();
  if (mailboxId.value != "") {
    UDN.accessMailbox(mailboxId.value);
  }
};

UDN.onmessage = (data) => {
  lastReceivedMessage.value = JSON.stringify(data, null, 4);

  const { messageChannel, messageBody } = data;
  if (messageChannel && messageBody) {
    const messageObject = new Message(messageChannel, messageBody);
    if (messageBody) messages.add(messageObject);
  }
};

UDN.onmailbox = (id) => {
  mailboxId.value = id;
};

UDN.ondisconnect = () => {
  isDisconnected.value = true;
  setTimeout(connect, 2000);
};

function connect() {
  UDN.connect(`wss://${window.location.host}`);
}
connect();

// STATE
// connection
export const isDisconnected = new React.State(true);
export const mailboxId = React.restoreState("mailbox-id", "");

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
export function subscribe() {
  UDN.subscribe(subscriptionChannel.value);
}

export function unsubscribe() {
  UDN.unsubscribe(subscriptionChannel.value);
}

export function sendMessage() {
  if (isMessageEmpty.value == true) return;
  UDN.sendMessage(newMessageChannel.value, newMessageBody.value);
  newMessageBody.value = "";
}

export function requestMailbox() {
  UDN.requestMailbox();
}
