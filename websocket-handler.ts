// TYPES
// requests
interface IncomingMessage {
  //sent on new connections
  connectionType?: ConnectionType;

  // subscribing to channel
  channelSubscription?: string;

  //sending message
  messageChannel?: string;
  messageBody?: string;
}

// connections
enum ConnectionType {
  Server = "server",
  Client = "client",
}

// TRACKING
const serversOnEntireNetwork = new Set<WebSocket>();

const socketsPerChannel = new Map<string, Set<WebSocket>>();
const channelsPerSocket = new Map<WebSocket, Set<string>>();

export function trackServer(ws: WebSocket): void {
  serversOnEntireNetwork.add(ws);
}

export function trackSubscription(channel: string, ws: WebSocket): void {
  if (!socketsPerChannel.has(channel)) socketsPerChannel.set(channel, new Set());
  if (!channelsPerSocket.has(ws)) channelsPerSocket.set(ws, new Set());

  socketsPerChannel.get(channel)!.add(ws);
  channelsPerSocket.get(ws)!.add(channel);
}

export function forgetConnection(ws: WebSocket): void {
  serversOnEntireNetwork.delete(ws);
  serversOnEntireNetwork.delete(ws);
}
