export interface Message {
  // subscribing to channel
  subscribeChannel?: string;
  unsubscribeChannel?: string;

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
  set onconnect(handler: () => void) {
    this.connectionHandler = handler;
  }
  set ondisconnect(handler: () => void) {
    this.disconnectionHandler = handler;
  }
  set onmessage(handler: (data: Message) => void) {
    this.messageHandler = handler;
  }

  // utility methods
  private send(messageObject: Object): boolean {
    if (this.ws == undefined) return false;

    const messageString = JSON.stringify(messageObject);
    this.ws.send(messageString);
    return true;
  }

  // public methods
  connect(address: string): void {
    this.ws = new WebSocket(address);
    this.ws.addEventListener("open", this.connectionHandler);
    this.ws.addEventListener("close", this.disconnectionHandler);
    this.ws.addEventListener("message", (message) => {
      const dataString = message.data.toString();
      const data = JSON.parse(dataString);
      this.messageHandler(data);
    });
  }

  sendMessage(channel: string, body: string): boolean {
    const messageObject = {
      messageChannel: channel,
      messageBody: body,
    };
    return this.send(messageObject);
  }

  subscribe(channel: string): boolean {
    const messageObject = {
      subscribeChannel: channel,
    };
    return this.send(messageObject);
  }

  unsubscribe(channel: string): boolean {
    const messageObject = {
      unsubscribeChannel: channel,
    };
    return this.send(messageObject);
  }
}
