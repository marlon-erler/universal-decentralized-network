# udn-frontend

TypeScript library for [UDN](https://github.com/marlon-erler/universal-decentralized-network) apps

# Install

`npm install udn-frontend`

# Usage

```TypeScript
import UDNFrontend from "udn-frontend";

// setup
const UDN = new UDNFrontend();
UDN.onconnect = () => {
  console.log("connected!");
};
UDN.ondisconnect = () => {
  console.log("disconnected!");
};
UDN.onmessage = (data: Message) => {
  console.log(data);
};

// do stuff
UDN.connect("ws://192.168.0.69:1234");

UDN.subscribe("my-channel");
UDN.sendMessage("my-channel", "Hello, world!");
UDN.unsubscribe("my-channel");
```

# Type Reference

```TypeScript
export interface Message {
  // subscribing to channel
  subscribeChannel?: string;
  unsubscribeChannel?: string;
  subscribed?: boolean; // sent by the server to confirm subscription

  //sending message
  messageChannel?: string;
  messageBody?: string;
}

export default class UDNFrontend {
  private ws: WebSocket | undefined;

  // handlers
  private connectionHandler = () => {};
  private disconnectionHandler = () => {};
  private messageHandler = (data: Message) => {};

  // init
  set onconnect(handler: () => void);
  set ondisconnect(handler: () => void);
  set onmessage(handler: (data: Message) => void);

  // methods
  connect(address: string): void;
  sendMessage(channel: string, body: string): boolean; // true if message is sent
  subscribe(channel: string): boolean; // true if request is sent, NOT inherently when subscribed
  unsubscribe(channel: string): boolean; // true if request is sent, NOT inherently when unsubscribed
}
```

# Changelog

## 1.0.1

- minor fixes

## 1.0.2

- minor fixes
