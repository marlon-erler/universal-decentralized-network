import { WS } from "./index";

export class SubscriptionMap {
  private channelsPerClient = new Map<WS, Set<string>>();
  private clientsPerChannel = new Map<string, Set<WS>>();

  // prepare
  private prepareChannelSet(ws: WS) {
    if (this.channelsPerClient.has(ws)) return;
    this.channelsPerClient.set(ws, new Set());
  }

  private prepareClientSet(channel: string) {
    if (this.clientsPerChannel.has(channel)) return;
    this.clientsPerChannel.set(channel, new Set());
  }

  // utility
  getChannelList(ws: WS) {
    return this.channelsPerClient.get(ws);
  }

  getClientList(channel: string) {
    return this.clientsPerChannel.get(channel);
  }

  // modifications
  set(ws: WS, channel: string) {
    this.prepareChannelSet(ws);
    this.prepareClientSet(channel);

    this.getChannelList(ws)?.add(channel);
    this.getClientList(channel)?.add(ws);
  }

  delete(ws: WS, channel: string) {
    this.getChannelList(ws)?.delete(channel);
    this.getClientList(channel)?.delete(ws);
  }
}
