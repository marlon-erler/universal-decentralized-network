(() => {
  // node_modules/uuid/dist/esm-browser/stringify.js
  var byteToHex = [];
  for (i = 0; i < 256; ++i) {
    byteToHex.push((i + 256).toString(16).slice(1));
  }
  var i;
  function unsafeStringify(arr, offset = 0) {
    return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
  }

  // node_modules/uuid/dist/esm-browser/rng.js
  var getRandomValues;
  var rnds8 = new Uint8Array(16);
  function rng() {
    if (!getRandomValues) {
      getRandomValues = typeof crypto !== "undefined" && crypto.getRandomValues && crypto.getRandomValues.bind(crypto);
      if (!getRandomValues) {
        throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
      }
    }
    return getRandomValues(rnds8);
  }

  // node_modules/uuid/dist/esm-browser/native.js
  var randomUUID = typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID.bind(crypto);
  var native_default = {
    randomUUID
  };

  // node_modules/uuid/dist/esm-browser/v4.js
  function v4(options, buf, offset) {
    if (native_default.randomUUID && !buf && !options) {
      return native_default.randomUUID();
    }
    options = options || {};
    var rnds = options.random || (options.rng || rng)();
    rnds[6] = rnds[6] & 15 | 64;
    rnds[8] = rnds[8] & 63 | 128;
    if (buf) {
      offset = offset || 0;
      for (var i = 0; i < 16; ++i) {
        buf[offset + i] = rnds[i];
      }
      return buf;
    }
    return unsafeStringify(rnds);
  }
  var v4_default = v4;

  // node_modules/bloatless-react/index.ts
  function UUID() {
    return v4_default();
  }
  var State = class {
    _value;
    _bindings = /* @__PURE__ */ new Set();
    // init
    constructor(initialValue) {
      this._value = initialValue;
    }
    // value
    get value() {
      return this._value;
    }
    set value(newValue) {
      if (this._value == newValue) return;
      this._value = newValue;
      this.callSubscriptions();
    }
    // subscriptions
    callSubscriptions() {
      this._bindings.forEach((fn) => fn(this._value));
    }
    subscribe(fn) {
      this._bindings.add(fn);
      fn(this._value);
    }
    // stringify
    toString() {
      return JSON.stringify(this._value);
    }
  };
  var ListState = class extends State {
    additionHandlers = /* @__PURE__ */ new Set();
    removalHandlers = /* @__PURE__ */ new Map();
    // init
    constructor(initialItems) {
      super(new Set(initialItems));
    }
    // list
    add(...items) {
      items.forEach((item) => {
        this.value.add(item);
        this.additionHandlers.forEach((handler) => handler(item));
      });
      this.callSubscriptions();
    }
    remove(...items) {
      items.forEach((item) => {
        this.value.delete(item);
        const id = item.id;
        if (!this.removalHandlers.has(id)) return;
        this.removalHandlers.get(id)(item);
        this.removalHandlers.delete(id);
      });
      this.callSubscriptions();
    }
    clear() {
      this.remove(...this.value.values());
    }
    // handlers
    handleAddition(handler) {
      this.additionHandlers.add(handler);
      [...this.value.values()].forEach(handler);
    }
    handleRemoval(item, handler) {
      this.removalHandlers.set(item.id, handler);
    }
    // stringification
    toString() {
      const array = [...this.value];
      const json = JSON.stringify(array);
      return json;
    }
  };
  function createProxyState(statesToSubscibe, fn) {
    const proxyState = new State(fn());
    statesToSubscibe.forEach(
      (state) => state.subscribe(() => proxyState.value = fn())
    );
    return proxyState;
  }
  function persistState(localStorageKey, state) {
    state.subscribe(() => {
      const stringifiedValue = state.toString();
      localStorage.setItem(localStorageKey, stringifiedValue);
    });
  }
  function restoreState(localStorageKey, initialStateValue) {
    const storedString = localStorage.getItem(localStorageKey) ?? JSON.stringify(initialStateValue);
    const convertedValue = JSON.parse(storedString);
    const state = new State(convertedValue);
    persistState(localStorageKey, state);
    return state;
  }
  function createElement(tagName, attributes = {}, ...children) {
    const element = document.createElement(tagName);
    if (attributes != null)
      Object.entries(attributes).forEach((entry) => {
        const [attributename, value] = entry;
        const [directiveKey, directiveValue] = attributename.split(":");
        switch (directiveKey) {
          case "on": {
            switch (directiveValue) {
              case "enter": {
                element.addEventListener("keydown", (e) => {
                  if (e.key != "Enter") return;
                  value();
                });
                break;
              }
              default: {
                element.addEventListener(directiveValue, value);
              }
            }
            break;
          }
          case "subscribe": {
            if (directiveValue == "children") {
              element.style.scrollBehavior = "smooth";
              try {
                const [listState, toElement] = value;
                listState.handleAddition((newItem) => {
                  const child = toElement(newItem);
                  listState.handleRemoval(
                    newItem,
                    () => child.remove()
                  );
                  element.append(child);
                  element.scrollTop = element.scrollHeight;
                });
              } catch {
                throw `error: cannot process subscribe:children directive because ListItemConverter is not defined. Usage: "subscribe:children={[list, converter]}"; you can find a more detailed example in the documentation`;
              }
            } else {
              const state = value;
              state.subscribe(
                (newValue) => element[directiveValue] = newValue
              );
            }
            break;
          }
          case "bind": {
            const state = value;
            state.subscribe(
              (newValue) => element[directiveValue] = newValue
            );
            element.addEventListener(
              "input",
              () => state.value = element[directiveValue]
            );
            break;
          }
          case "toggle": {
            if (value.subscribe) {
              const state = value;
              state.subscribe(
                (newValue) => element.toggleAttribute(directiveValue, newValue)
              );
            } else {
              element.toggleAttribute(directiveValue, value);
            }
            break;
          }
          case "set": {
            const state = value;
            state.subscribe(
              (newValue) => element.setAttribute(directiveValue, newValue)
            );
            break;
          }
          default:
            element.setAttribute(attributename, value);
        }
      });
    children.filter((x) => x).forEach((child) => element.append(child));
    return element;
  }

  // node_modules/udn-frontend/index.ts
  var UDNFrontend = class {
    ws;
    // handlers
    connectionHandler = () => {
    };
    disconnectionHandler = () => {
    };
    messageHandler = (data) => {
    };
    mailboxHandler = (mailboxId2) => {
    };
    // init
    set onconnect(handler) {
      this.connectionHandler = handler;
    }
    set ondisconnect(handler) {
      this.disconnectionHandler = handler;
    }
    set onmessage(handler) {
      this.messageHandler = handler;
    }
    set onmailbox(handler) {
      this.mailboxHandler = handler;
    }
    // utility methods
    send(messageObject) {
      if (this.ws == void 0) return false;
      const messageString = JSON.stringify(messageObject);
      this.ws.send(messageString);
      return true;
    }
    // public methods
    connect(address) {
      this.disconnect();
      this.ws = new WebSocket(address);
      this.ws.addEventListener("open", this.connectionHandler);
      this.ws.addEventListener("close", this.disconnectionHandler);
      this.ws.addEventListener("message", (message) => {
        const dataString = message.data.toString();
        const data = JSON.parse(dataString);
        if (data.assignedMailboxId) {
          return this.mailboxHandler(data.assignedMailboxId);
        } else {
          this.messageHandler(data);
        }
      });
    }
    disconnect() {
      this.ws?.close();
    }
    sendMessage(channel, body) {
      const messageObject = {
        messageChannel: channel,
        messageBody: body
      };
      return this.send(messageObject);
    }
    subscribe(channel) {
      const messageObject = {
        subscribeChannel: channel
      };
      return this.send(messageObject);
    }
    unsubscribe(channel) {
      const messageObject = {
        unsubscribeChannel: channel
      };
      return this.send(messageObject);
    }
    requestMailbox() {
      const messageObject = {
        requestingMailboxSetup: true
      };
      return this.send(messageObject);
    }
    accessMailbox(mailboxId2) {
      const messageObject = {
        requestedMailbox: mailboxId2
      };
      return this.send(messageObject);
    }
  };

  // src/translations.tsx
  var staticTextEnglish = {
    mailbox: "Mailbox",
    requestMailbox: "Request Mailbox",
    channel: "Channel",
    channel_placeholder: "my-channel",
    disconnected: "Server disconnected",
    reconnecting: "Reconnecting...",
    info: "Info",
    message: "Message",
    messages: "Messages",
    message_placeholder: "Hello, world!",
    message_placeholder_generic: "Type a message...",
    noMessagesReceived: "No messages received",
    messageLastReceived: "Last received message",
    messagesReceived: "Received Messages",
    send: "Send",
    serverInfo: "Server Info",
    settings: "Settings",
    subscribeToChannel: "Subscribe to channel",
    subscribe: "Subscribe",
    unsubscribe: "Unubscribe"
  };
  var translations = {
    en: staticTextEnglish,
    es: {
      mailbox: "Buz\xF3n",
      requestMailbox: "Solicitar buz\xF3n",
      channel: "Canal",
      channel_placeholder: "mi-canal",
      disconnected: "Sin coneci\xF3n",
      reconnecting: "Conectando...",
      info: "Info",
      message: "Mensaje",
      messages: "Mensajes",
      message_placeholder: "Hola!",
      message_placeholder_generic: "Nuevo mensaje",
      noMessagesReceived: "Sin mensajes",
      messageLastReceived: "\xDAltimo mensaje",
      messagesReceived: "Todos los Mensajes",
      send: "Enviar",
      serverInfo: "Informaci\xF3n",
      settings: "Configuraci\xF3n",
      subscribeToChannel: "Suscribirse a un canal",
      subscribe: "Suscribirse",
      unsubscribe: "Cancelar"
    },
    de: {
      mailbox: "Briefkasten",
      requestMailbox: "Briefkasten beantragen",
      channel: "Kanal",
      channel_placeholder: "mein-kanal",
      disconnected: "Verbindung getrennt",
      reconnecting: "Verbindung wird hergestellt...",
      info: "Daten",
      message: "Nachricht",
      messages: "Nachrichten",
      message_placeholder: "Hallo!",
      message_placeholder_generic: "Neue Nachricht",
      noMessagesReceived: "Keine Nachrichten",
      messageLastReceived: "Letzte Nachricht",
      messagesReceived: "Empfangene Nachrichten",
      send: "Senden",
      serverInfo: "Serverdaten",
      settings: "Einstellungen",
      subscribeToChannel: "Kanal beitreten",
      subscribe: "Beitreten",
      unsubscribe: "Verlassen"
    }
  };
  function getText(key) {
    const language = navigator.language.substring(0, 2);
    if (translations[language]) {
      return translations[language][key];
    }
    return translations.en[key];
  }

  // src/model.tsx
  var Message = class {
    constructor(channel, body) {
      this.channel = channel;
      this.body = body;
    }
    id = UUID();
  };
  var UDN = new UDNFrontend();
  UDN.onconnect = () => {
    isDisconnected.value = false;
    updateStats();
    if (mailboxId.value != "") {
      UDN.accessMailbox(mailboxId.value);
    }
  };
  UDN.onmessage = (data) => {
    lastReceivedMessage.value = JSON.stringify(data, null, 4);
    const { messageChannel, messageBody } = data;
    if (messageChannel && messageBody) {
      const messageObject = new Message(messageChannel, messageBody);
      if (messageBody) messages.add(messageObject);
    }
  };
  UDN.onmailbox = (id) => {
    mailboxId.value = id;
  };
  UDN.ondisconnect = () => {
    isDisconnected.value = true;
    setTimeout(connect, 2e3);
  };
  function connect() {
    UDN.connect(`wss://${window.location.host}`);
  }
  connect();
  var isDisconnected = new State(true);
  var mailboxId = restoreState("mailbox-id", "");
  var messages = new ListState();
  var lastReceivedMessage = new State(
    getText("noMessagesReceived")
  );
  var statHTMLString = new State("");
  async function updateStats() {
    const response = await fetch(
      `${window.location.protocol}//${window.location.host}/stats`
    );
    const data = await response.json();
    let html = "";
    data.forEach((item) => {
      const tile = /* @__PURE__ */ createElement("div", { class: "tile" }, /* @__PURE__ */ createElement("span", { class: "secondary flex width-100" }, item[0].toString()), /* @__PURE__ */ createElement("b", null, item[1].toString()));
      html += tile.outerHTML;
    });
    statHTMLString.value = html;
  }
  var subscriptionChannel = new State("");
  var newMessageChannel = new State("");
  var newMessageBody = new State("");
  var isMessageEmpty = createProxyState(
    [newMessageChannel, newMessageBody],
    () => newMessageChannel.value == "" || newMessageBody.value == ""
  );
  function subscribe() {
    UDN.subscribe(subscriptionChannel.value);
  }
  function unsubscribe() {
    UDN.unsubscribe(subscriptionChannel.value);
  }
  function sendMessage() {
    if (isMessageEmpty.value == true) return;
    UDN.sendMessage(newMessageChannel.value, newMessageBody.value);
    newMessageBody.value = "";
  }
  function requestMailbox() {
    UDN.requestMailbox();
  }

  // src/infoScreen.tsx
  function InfoScreen() {
    return /* @__PURE__ */ createElement("article", { id: "info-screen" }, /* @__PURE__ */ createElement("header", null, getText("serverInfo"), /* @__PURE__ */ createElement("span", null, /* @__PURE__ */ createElement("button", { "on:click": updateStats }, /* @__PURE__ */ createElement("span", { class: "icon" }, "refresh")))), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("div", { class: "flex-column gap", "subscribe:innerHTML": statHTMLString })));
  }

  // src/mainScreen.tsx
  function MainScreen() {
    return /* @__PURE__ */ createElement("article", { id: "main-screen" }, /* @__PURE__ */ createElement("header", null, getText("settings")), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("div", { class: "tile width-input" }, /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("b", null, getText("messageLastReceived")), /* @__PURE__ */ createElement("p", { class: "secondary", "subscribe:innerText": lastReceivedMessage }))), /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement("div", { class: "tile width-input" }, /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("b", null, getText("mailbox")), /* @__PURE__ */ createElement("p", { class: "secondary", "subscribe:innerText": mailboxId }))), /* @__PURE__ */ createElement("div", { class: "flex-row width-input justify-end" }, /* @__PURE__ */ createElement("button", { class: "primary width-100", "on:click": requestMailbox }, getText("requestMailbox"), /* @__PURE__ */ createElement("span", { class: "icon" }, "inbox"))), /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement("label", { class: "tile" }, /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", null, getText("subscribeToChannel")), /* @__PURE__ */ createElement(
      "input",
      {
        placeholder: getText("channel_placeholder"),
        "bind:value": subscriptionChannel,
        "on:enter": subscribe
      }
    ))), /* @__PURE__ */ createElement("div", { class: "flex-row width-input justify-end" }, /* @__PURE__ */ createElement("button", { class: "danger width-50", "on:click": unsubscribe }, getText("unsubscribe")), /* @__PURE__ */ createElement("button", { class: "primary width-50", "on:click": subscribe }, getText("subscribe"), /* @__PURE__ */ createElement("span", { class: "icon" }, "arrow_forward"))), /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement("label", { class: "tile" }, /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", null, getText("channel")), /* @__PURE__ */ createElement(
      "input",
      {
        placeholder: getText("channel_placeholder"),
        "bind:value": newMessageChannel,
        "on:enter": sendMessage
      }
    ))), /* @__PURE__ */ createElement("label", { class: "tile" }, /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", null, getText("message")), /* @__PURE__ */ createElement(
      "input",
      {
        placeholder: getText("message_placeholder"),
        "bind:value": newMessageBody,
        "on:enter": sendMessage
      }
    ))), /* @__PURE__ */ createElement("div", { class: "flex-row width-input justify-end" }, /* @__PURE__ */ createElement(
      "button",
      {
        class: "primary width-50",
        "on:click": sendMessage,
        "toggle:disabled": isMessageEmpty
      },
      getText("send"),
      /* @__PURE__ */ createElement("span", { class: "icon" }, "send")
    ))));
  }

  // src/messageScreen.tsx
  var convertMessageToElement = (message) => {
    return /* @__PURE__ */ createElement("div", { class: "tile", style: "flex: 0" }, /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", { class: "secondary" }, message.channel), /* @__PURE__ */ createElement("b", null, message.body)));
  };
  function MessageScreen() {
    return /* @__PURE__ */ createElement("article", { id: "message-screen" }, /* @__PURE__ */ createElement("header", null, getText("messagesReceived")), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement(
      "div",
      {
        class: "flex-column gap",
        "subscribe:children": [messages, convertMessageToElement]
      }
    )), /* @__PURE__ */ createElement("footer", null, /* @__PURE__ */ createElement(
      "input",
      {
        style: "max-width: unset",
        placeholder: getText("message_placeholder_generic"),
        "bind:value": newMessageBody,
        "on:enter": sendMessage
      }
    ), /* @__PURE__ */ createElement(
      "button",
      {
        class: "primary",
        "on:click": sendMessage,
        "toggle:disabled": isMessageEmpty
      },
      /* @__PURE__ */ createElement("span", { class: "icon" }, "send")
    )));
  }

  // src/index.tsx
  document.body.prepend(
    /* @__PURE__ */ createElement("menu", null, /* @__PURE__ */ createElement("a", { class: "tab-link", href: "#info-screen", active: true }, /* @__PURE__ */ createElement("span", { class: "icon" }, "info"), getText("info")), /* @__PURE__ */ createElement("a", { class: "tab-link", href: "#main-screen" }, /* @__PURE__ */ createElement("span", { class: "icon" }, "settings"), getText("settings")), /* @__PURE__ */ createElement("a", { class: "tab-link", href: "#message-screen" }, /* @__PURE__ */ createElement("span", { class: "icon" }, "chat"), getText("messages")))
  );
  document.querySelector("main").append(InfoScreen(), MainScreen(), MessageScreen());
  document.body.append(
    /* @__PURE__ */ createElement("div", { class: "modal", "toggle:open": isDisconnected }, /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("main", null, /* @__PURE__ */ createElement("div", { class: "flex-column align-center justify-center width-100 height-100", style: "gap: 1rem" }, /* @__PURE__ */ createElement("span", { class: "icon error", style: "font-size: 3rem" }, "signal_disconnected"), /* @__PURE__ */ createElement("h1", { class: "error" }, getText("disconnected")), /* @__PURE__ */ createElement("p", { class: "secondary" }, getText("reconnecting"))))))
  );
})();
