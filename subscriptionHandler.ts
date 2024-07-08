import {
  WebSocketMessage,
  sendWebSocketMessage,
  subscriptionMap,
} from "./websocket-handler";

import Crypto from "crypto";
import { WS } from "./index";

export interface Subscriber {
  send: (message: string) => void;
}

export class Mailbox implements Subscriber {
  // basic data
  id = Crypto.randomUUID();
  dateLastChecked = new Date();

  get expiryDate() {
    const expiryDate = new Date(this.dateLastChecked);
    TODO expiryDate.setDate(expiryDate.getDate() + 7);
    return expiryDate;
  }

  // init
  constructor(ws: WS) {
    this.ws = ws;
    this.sendId();
  }

  sendId(): void {
    if (!this.ws) return;

    sendWebSocketMessage(
      {
        assignedMailboxId: this.id,
      },
      this.ws
    );
  }

  // storage
  messages = new Set<string>();

  // websocket
  private _ws: WS | undefined;

  get ws(): WS | undefined {
    return this._ws;
  }

  set ws(ws: WS) {
    this._ws = ws;
    this.dateLastChecked = new Date();

    this.sendUnreadMessages();

    const channels = subscriptionMap.getChannelList(ws);
    channels?.forEach((channel) => this.subscribe(channel));

    subscriptionMap.deleteSubscriber(ws);
  }

  // subscribing
  subscribe(channelName: string): void {
    subscriptionMap.set(this, channelName);
  }

  unsubscribe(channelName: string): void {
    subscriptionMap.delete(this, channelName);
  }

  // sending
  send(message: string): void {
    if (this._ws?.readyState == 1) {
      this._ws.send(message);
    } else {
      this.messages.add(message);
    }
  }

  sendUnreadMessages(): void {
    console.log(this.messages);
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

  deleteSubscriber(subscriber: Subscriber): void {
    this.getChannelList(subscriber)?.forEach((channel) => {
      this.delete(subscriber, channel);
    });
  }

  // messages
  forwardMessage(channels: string[], messageObject: WebSocketMessage): void {
    channels.forEach((channel) => {
      const subscribers = this.getClientList(channel);
      subscribers?.forEach((subscriber) => {
        sendWebSocketMessage(messageObject, subscriber);
      });
    });
  }
}
