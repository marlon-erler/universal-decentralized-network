# udn-frontend

TypeScript library for [UDN](https://github.com/marlon-erler/universal-decentralized-network) apps

# Install

`npm install udn-frontend`

# Usage

```TypeScript
import UDNFrontend from "udn-frontend";

// setup
const UDN = new UDNFrontend();

// connect
UDN.onconnect = () => {
  console.log("connected!");
};
UDN.ondisconnect = () => {
  console.log("disconnected!");
};

UDN.connect("ws://192.168.0.69:1234");
UDN.disconnect();

// messages
UDN.onmessage = (data: Message) => {
  console.log(data);
};

UDN.sendMessage("my-channel", "Hello, world!");

// subscribe
UDN.subscribe("my-channel");
UDN.unsubscribe("my-channel");

// mailbox
UDN.onmailbox = (mailboxId: string) => {
  UDN.connectMailbox(mailboxId);
}
UDN.onmailboxconnect = (mailboxId: string) => {
  UDN.deleteMailbox(mailboxId);
}

UDN.requestMailbox();
```
