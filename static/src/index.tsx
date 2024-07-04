import * as React from "bloatless-react";

// WS
const ws = new WebSocket(`ws://${window.location.host}`);

ws.addEventListener("message", (message) => {
  receivedMessage.value = message.data;
});

function send(object: any) {
  const stringified = JSON.stringify(object);
  ws.send(stringified);
}

// STATE
const receivedMessage = new React.State("");

const subscriptionChannel = new React.State("");
const messageChannel = new React.State("");
const messageBody = new React.State("");

function subscribe() {
  send({ subscribeChannel: subscriptionChannel.value });
}

function unsubscribe() {
  send({ unsubscribeChannel: subscriptionChannel.value });
}

function sendMessage() {
  send({
    messageChannel: messageChannel.value,
    messageBody: messageBody.value,
  });
}

// UI
document.querySelector("main")!.append(
  <article>
    <header>UDN Test</header>
    <div>
      <div class="tile">
        <div>
          <b>Received message</b>
          <p class="secondary" subscribe:innerText={receivedMessage}></p>
        </div>
      </div>

      <hr></hr>

      <label class="tile">
        <div>
          <span>Subscribe to channel</span>
          <input
            placeholder="my-channel"
            bind:value={subscriptionChannel}
          ></input>
        </div>
      </label>

      <div class="flex-row width-input justify-end">
        <button class="danger width-50" on:click={unsubscribe}>
          Unsubscribe
        </button>
        <button class="primary width-50" on:click={subscribe}>
          Subscribe
          <span class="icon">arrow_forward</span>
        </button>
      </div>

      <hr></hr>

      <label class="tile">
        <div>
          <span>Channel</span>
          <input placeholder="my-channel" bind:value={messageChannel}></input>
        </div>
      </label>

      <label class="tile">
        <div>
          <span>Message</span>
          <input placeholder="Hello, world!" bind:value={messageBody}></input>
        </div>
      </label>

      <div class="flex-row width-input justify-end">
        <button class="primary width-50" on:click={sendMessage}>
          Send
          <span class="icon">arrow_forward</span>
        </button>
      </div>
    </div>
  </article>
);
