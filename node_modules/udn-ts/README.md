# udn-ts
TypeScript library for [UDN](https://github.com/marlon-erler/universal-decentralized-network) apps

# Install
`npm install udn-ts`

# Usage
```TypeScript
import UDNFrontend from "udn-ts";

// setup
const UDN = new UDNFrontend();
UDN.onconnect = () => {
  console.log("connected!");
};
UDN.ondisconnect = () => {
  console.log("disconnected!");
};
UDN.onmessage = (data) => {
  console.log(data);
};

// do stuff
UDN.connect("ws://192.168.0.69:1234");

UDN.subscribe("my-channel");
UDN.sendMessage("my-channel", "Hello, world!");
UDN.unsubscribe("my-channel");
```