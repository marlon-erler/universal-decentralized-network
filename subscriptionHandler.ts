import Crypto from "crypto";
import { WS } from "./index";

export interface Subscriber {
  send: (message: string) => void;
}

export class Mailbox implements Subscriber {
  // basic
  id = Crypto.randomUUID();
  messages = new Set<string>();

  // websocket
  _ws: WS | undefined;

  get ws(): WS | undefined {
    return this._ws;
  }

  set ws(ws: WS) {
    this._ws = ws;
    this.sendUnreadMessages();
  }

  // sending
  send(message) {
    if (this._ws) {
      this._ws.send(message);
    } else {
      this.messages.add(message);
    }
  }

  sendUnreadMessages() {
    this.messages.forEach((message) => {
      if (!this._ws) return;

      this._ws.send(message);
      this.messages.delete(message);
    });
  }
}

export class SubscriptionMap {
  channelsPerSubscriber = new Map<Subscriber, Set<string>>();
  subscribersPerChannel = new Map<string, Set<Subscriber>>();

  // prepare
  private prepareChannelSet(subscriber: Subscriber): void {
    if (this.channelsPerSubscriber.has(subscriber)) return;
    this.channelsPerSubscriber.set(subscriber, new Set());
  }

  private prepareSubscriberSet(channel: string): void {
    if (this.subscribersPerChannel.has(channel)) return;
    this.subscribersPerChannel.set(channel, new Set());
  }

  // utility
  getChannelList(subscriber: Subscriber): Set<string> | undefined {
    return this.channelsPerSubscriber.get(subscriber);
  }

  getClientList(channel: string): Set<Subscriber> | undefined {
    return this.subscribersPerChannel.get(channel);
  }

  // modifications
  set(subscriber: Subscriber, channel: string): void {
    this.prepareChannelSet(subscriber);
    this.prepareSubscriberSet(channel);

    this.getChannelList(subscriber)?.add(channel);
    this.getClientList(channel)?.add(subscriber);
  }

  delete(subscriber: Subscriber, channel: string): void {
    const channelList = this.getChannelList(subscriber);
    const clientList = this.getClientList(channel);

    channelList?.delete(channel);
    if (channelList?.size == 0) {
      this.channelsPerSubscriber.delete(subscriber);
    }

    clientList?.delete(subscriber);
    if (clientList?.size == 0) {
      this.subscribersPerChannel.delete(channel);
    }
  }

  // messages
  forwardMessage(channels: string[], messageString: string): void {
    channels.forEach((channel) => {
      const subscribers = this.getClientList(channel);
      subscribers?.forEach((subscriber) => subscriber.send(messageString));
    });
  }
}
