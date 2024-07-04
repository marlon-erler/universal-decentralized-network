import * as React from "bloatless-react";

import {
  Message,
  isMessageEmpty,
  messages,
  newMessageBody,
  parseMessage,
  sendMessage,
} from "./model";

import { getText } from "./translations";

const convertMessageToElement: React.ListItemConverter<Message> = (message) => {
  return (
    <div class="tile" style="flex: 0">
      <div>
        <span class="secondary">{message.channel}</span>
        <b>{message.body}</b>
      </div>
    </div>
  );
};

export function MessageScreen() {
  return (
    <article id="message-screen">
      <header>{getText("messagesReceived")}</header>
      <div>
        <div
          class="flex-column gap"
          subscribe:children={[messages, convertMessageToElement]}
        ></div>
      </div>
      <footer>
        <input
          style="max-width: unset"
          placeholder={getText("message_placeholder_generic")}
          bind:value={newMessageBody}
          on:enter={sendMessage}
        ></input>
        <button
          class="primary"
          on:click={sendMessage}
          toggle:disabled={isMessageEmpty}
        >
          <span class="icon">send</span>
        </button>
      </footer>
    </article>
  );
}
