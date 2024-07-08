import * as React from "bloatless-react";

import {
  isMessageEmpty,
  lastReceivedMessage,
  newMessageBody,
  newMessageChannel,
  sendMessage,
  subscribe,
  subscriptionChannel,
  unsubscribe,
} from "./model";

import { getText } from "./translations";

export function MainScreen() {
  // UI
  return (
    <article id="main-screen">
      <header>{getText("settings")}</header>
      <div>
        <div class="tile width-input">
          <div>
            <b>{getText("messageLastReceived")}</b>
            <p class="secondary" subscribe:innerText={lastReceivedMessage}></p>
          </div>
        </div>

        <hr></hr>

        <label class="tile">
          <div>
            <span>{getText("subscribeToChannel")}</span>
            <input
              placeholder={getText("channel_placeholder")}
              bind:value={subscriptionChannel}
              on:enter={subscribe}
            ></input>
          </div>
        </label>

        <div class="flex-row width-input justify-end">
          <button class="danger width-50" on:click={unsubscribe}>
            {getText("unsubscribe")}
          </button>
          <button class="primary width-50" on:click={subscribe}>
            {getText("subscribe")}
            <span class="icon">check</span>
          </button>
        </div>

        <hr></hr>

        <label class="tile">
          <div>
            <span>{getText("channel")}</span>
            <input
              placeholder={getText("channel_placeholder")}
              bind:value={newMessageChannel}
              on:enter={sendMessage}
            ></input>
          </div>
        </label>

        <label class="tile">
          <div>
            <span>{getText("message")}</span>
            <input
              placeholder={getText("message_placeholder")}
              bind:value={newMessageBody}
              on:enter={sendMessage}
            ></input>
          </div>
        </label>

        <div class="flex-row width-input justify-end">
          <button
            class="primary width-50"
            on:click={sendMessage}
            toggle:disabled={isMessageEmpty}
          >
            {getText("send")}
            <span class="icon">send</span>
          </button>
        </div>
      </div>
    </article>
  );
}
