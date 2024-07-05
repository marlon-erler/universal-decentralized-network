import * as React from "bloatless-react";

import { InfoScreen } from "./infoScreen";
import { MainScreen } from "./mainScreen";
import { MessageScreen } from "./messageScreen";
import { getText } from "./translations";

// WS
document.body.prepend(
  <menu>
    <a class="tab-link" href="#info-screen" active>
      <span class="icon">info</span>
      {getText("info")}
    </a>
    <a class="tab-link" href="#main-screen">
      <span class="icon">settings</span>
      {getText("settings")}
    </a>
    <a class="tab-link" href="#message-screen">
      <span class="icon">chat</span>
      {getText("messages")}
    </a>
  </menu>
);
document
  .querySelector("main")!
  .append(InfoScreen(), MainScreen(), MessageScreen());
