import * as React from "bloatless-react";

import { statHTMLString, updateStats } from "./model";

import { getText } from "./translations";

export function InfoScreen() {
  return (
    <article id="info-screen">
      <header>
        {getText("serverInfo")}
        <span>
          <button on:click={updateStats}>
            <span class="icon">refresh</span>
          </button>
        </span>
      </header>
      <div>
        <div class="flex-column gap" subscribe:innerHTML={statHTMLString}></div>
      </div>
    </article>
  );
}
