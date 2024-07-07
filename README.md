# universal-decentralized-network

The UDN project is an infrastructure for decentralized, local networks.

# How it works

## Introduction

Let's assume you want to set up a local network at home. Using this local network, you want to chat with family members. This has two advantages: nothing is sent out to the internet, so no company can observe your messages, and your communication continues to function even when the internet becomes unavailable. All you need is your local network.

In this example, it would be enough to set up one server. You can use any computer in your house for this. Remember that the UDN project is infrastructure. While your server does provide basic messaging, you should be using specific apps built for UDN. You can find a list of such apps below. In this explanation, we will continue working with the built-in messaging system.

## Channels

After starting, the server will print it's url. Opening this url on any device in the same Wi-Fi network will give you the server's interface. The messaging system alows to subscribe to channels and to send messages on channels. Users receive messages sent on channels they subscribe to. Think of a channel as an open group chat. This is fundamentally how your network will function. All apps will be using channels to coordinate their messages. Data is never stored on any server.

## Connecting Multiple Servers

Now, let's assume this network is used by a larger organization with hundreds of users. If all of these users connected to the same server, that server would have a very bad time. That's why you can connect multiple servers together. A server will basically behave like a user, meaning it will also subscribe to channels. The only difference is that communication between two servers goes both ways, so every message sent to server one will be forwarded to server two, and vice versa.

If every group chat gets its own channel, every server would have to subscribe to, and thereby know, every group chat, which would be highly impractical. So instead, you'll define a new channel, we'll call it "blue" for now.

In this example, we have a shared apartment instead of an organization. Josh, Alice, Bob, and Jane live here and are subscribed to the channel "who-stole-the-sandwich". But Josh and Alice are connected to server S1, and Bob and Jane are on S2. As we just established, none of the servers care about "who-stole-the-sandwich"; instead they are subscribed to the channel "blue". So the chat between Josh and Alice is completely separate from the chat between Bob and Jane.

How do we fix this? It is possible to send a message on multiple channels at a time. To do so, the channel names need to be separated with a slash. So, if Alice wants to send a message to Josh, Bob, and Jane, she will use the channel "blue/who-stole-the-sandwich" (or "who-stole-the-sandwich/blue", that does the same). Now, Josh will get the message through "who-stole-the-sandwich" and S2 will get it through "blue". S2 will then forward the message fo Bob and Jane through "who-stole-the-sandwich".

This is particularly useful in larger networks. Let's suppose Josh, Alice, Bob, and Jane all live in a blue house, hence the name of their network. Kevin and John live next door, in a red house. They have S-3 and S-4 connected and using channel "red". What if Bob wants to chat with Kevin? At least one server in the blue house needs to connect to a server in the red house, so we get **S1 <-> S2 <-> S3 <-> S4**. Then, all servers should subscribe to a new channel, we'll call it "purple". This way, the red house won't get bothered by the sandwich debate on channel "blue", and Bob and Kevin can chat on "purple/some-other-channel".

# Getting Started

1. Make sure [bun](https://bun.sh/) is installed on your server.
2. Run `bun install udn`.
3. Start the server with `bun run start`.
4. A configuration file will be created automatically.

# UDN Apps

There are no apps yet. I'm on this tho

# Configuration

By default, the configuration file looks like this:

```JSON
{
  "port": 3000,
  "connectedServers": [],
  "subscribedChannels": []
}
```

The port and channels are self-explanatory. For servers, you'll need to provide full addresses:

```JSON
{
  "port": 3000,
  "connectedServers": [
    "ws://192.168.0.100:3000", 
    "ws://192.168.0.200:3000"
  ],
  "subscribedChannels": [
    "blue", "purple"
  ]
}
```

# Developing

## Recommended way

For TypeScript-based apps, you can use the [udn-frontend](https://github.com/marlon-erler/udn-frontend) package to manage the connection. If you want to/need to implement this yourself, follow the instructions below.

The web interface of the server itself is based on my other two projects, [carbon-mini](https://github.com/marlon-erler/carbon-mini) and [bloatless-react](https://github.com/marlon-erler/bloatless-react).
Both of these projects are very minimal, bloat-free, and quick to get started with. I'd suggest you to build your app based on the same foundation for a consistent user experience.

1. Download [carbon-mini](https://github.com/marlon-erler/carbon-mini) from the releases page and read the docs
2. Install [bloatless-react](https://github.com/marlon-erler/bloatless-react) and read the docs
3. Install [udn-frontend](https://github.com/marlon-erler/udn-frontend) and read the docs
4. Generate your app icon [here](https://icongen.onrender.com/), move it to the `dist` directory
5. Start developing

## Manual way

The UDN is based on WebSockets, so you'd start by opening a WebSocket connection to a server. The only two types of messages you need to send are subscriptions and actual messages.

The possible properties of a message you need to know are:
```TypeScript
export interface WebSocketMessage {
  // subscribing to channel
  subscribeChannel?: string;
  unsubscribeChannel?: string;

  //sending message
  messageChannel?: string;
  messageBody?: string;
}
```

So, to send a message:
1. Create an empty object
2. Add the properties you want to send
3. Stringify the object
4. Send the string via WebSocket