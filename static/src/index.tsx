import * as React from "bloatless-react";

import { MainScreen } from "./mainScreen";
import { MessageScreen } from "./messageScreen";
import { getText } from "./translations";

// WS
document.body.prepend(
  <menu>
    <a class="tab-link" href="#main-screen" active>
      <span class="icon">settings</span>
      {getText("settings")}
    </a>
    <a class="tab-link" href="#message-screen">
      <span class="icon">chat</span>
      {getText("messages")}
    </a>
  </menu>
);
document.querySelector("main")!.append(MainScreen(), MessageScreen());
