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
  var UUID = class {
    value;
    constructor() {
      this.value = v4_default();
    }
    toString() {
      return this.value;
    }
  };
  var State = class {
    _value;
    _bindings = /* @__PURE__ */ new Set();
    constructor(initialValue) {
      this._value = initialValue;
    }
    get value() {
      return this._value;
    }
    set value(newValue) {
      if (this._value == newValue) return;
      this._value = newValue;
      this.callSubscriptions();
    }
    callSubscriptions() {
      this._bindings.forEach((fn) => fn(this._value));
    }
    subscribe(fn) {
      this._bindings.add(fn);
      fn(this._value);
    }
  };
  var ListState = class extends State {
    additionHandlers = /* @__PURE__ */ new Set();
    removalHandlers = /* @__PURE__ */ new Map();
    constructor() {
      super(/* @__PURE__ */ new Set());
    }
    add(...items) {
      items.forEach((item) => {
        this.value.add(item);
        this.additionHandlers.forEach((handler) => handler(item));
      });
    }
    remove(...items) {
      items.forEach((item) => {
        this.value.delete(item);
        const uuid = item.uuid;
        if (!this.removalHandlers.has(uuid)) return;
        this.removalHandlers.get(uuid)(item);
        this.removalHandlers.delete(uuid);
      });
    }
    handleAddition(handler) {
      this.additionHandlers.add(handler);
    }
    handleRemoval(item, handler) {
      this.removalHandlers.set(item.uuid, handler);
    }
  };
  function createProxyState(statesToSubscibe, fn) {
    const proxyState = new State(fn());
    statesToSubscibe.forEach(
      (state) => state.subscribe(() => proxyState.value = fn())
    );
    return proxyState;
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
              const [listState, toElement] = value;
              listState.handleAddition((newItem) => {
                const child = toElement(newItem, listState);
                listState.handleRemoval(
                  newItem,
                  () => child.remove()
                );
                element.append(child);
              });
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
            const state = value;
            state.subscribe(
              (newValue) => element.toggleAttribute(directiveValue, newValue)
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

  // src/translations.tsx
  var staticTextEnglish = {
    channel: "Channel",
    channel_placeholder: "my-channel",
    message: "Message",
    messages: "Messages",
    message_placeholder: "Hello, world!",
    message_placeholder_generic: "Type a message...",
    noMessagesReceived: "No messages received",
    messageLastReceived: "Last received message",
    messagesReceived: "Received Messages",
    send: "Send",
    settings: "Settings",
    subscribeToChannel: "Subscribe to channel",
    subscribe: "Subscribe",
    unsubscribe: "Unubscribe"
  };
  var translations = {
    en: staticTextEnglish,
    es: {
      channel: "Canal",
      channel_placeholder: "mi-canal",
      message: "Mensaje",
      messages: "Mensajes",
      message_placeholder: "Hola!",
      message_placeholder_generic: "Nuevo mensaje",
      noMessagesReceived: "Sin mensajes",
      messageLastReceived: "\xDCltimo mensaje",
      messagesReceived: "Todos los Mensajes",
      send: "Enviar",
      settings: "Configuraci\xF3n",
      subscribeToChannel: "Suscribirse a un canal",
      subscribe: "Suscribirse",
      unsubscribe: "Cancelar"
    },
    de: {
      channel: "Kanal",
      channel_placeholder: "mein-kanal",
      message: "Nachricht",
      messages: "Nachrichten",
      message_placeholder: "Hallo!",
      message_placeholder_generic: "Neue Nachricht",
      noMessagesReceived: "Keine Nachrichten",
      messageLastReceived: "Letzte Nachrichte",
      messagesReceived: "Empfangene Nachrichten",
      send: "Senden",
      settings: "Einstellungen",
      subscribeToChannel: "Kanal Abonnieren",
      subscribe: "Abonnieren",
      unsubscribe: "Verlassen"
    }
  };
  function getText(key) {
    if (translations[navigator.language] && translations[navigator.language][key]) {
      return translations[navigator.language.substring(0, 2)][key];
    }
    return translations.en[key];
  }

  // src/model.tsx
  var Message = class {
    constructor(channel, body) {
      this.channel = channel;
      this.body = body;
    }
    uuid = new UUID();
  };
  var ws = new WebSocket(`ws://${window.location.host}`);
  ws.addEventListener("message", (message) => {
    const formatted = formatMessage(message);
    const { messageChannel, messageBody } = parseMessage(message);
    if (formatted) {
      lastReceivedMessage.value = formatted;
    }
    if (messageChannel && messageBody) {
      const messageObject = new Message(messageChannel, messageBody);
      if (messageBody) messages.add(messageObject);
    }
  });
  var messages = new ListState();
  var lastReceivedMessage = new State(
    getText("noMessagesReceived")
  );
  var subscriptionChannel = new State("");
  var newMessageChannel = new State("");
  var newMessageBody = new State("");
  var isMessageEmpty = createProxyState(
    [newMessageChannel, newMessageBody],
    () => newMessageChannel.value == "" || newMessageBody.value == ""
  );
  function formatMessage(message) {
    const object = parseMessage(message);
    const lines = Object.entries(object).map(
      (entry) => `${entry[0]}: ${entry[1]}`
    );
    return lines.join("\n");
  }
  function parseMessage(message) {
    return JSON.parse(message.data.toString());
  }
  function sendToWS(object) {
    const stringified = JSON.stringify(object);
    ws.send(stringified);
  }
  function subscribe() {
    sendToWS({ subscribeChannel: subscriptionChannel.value });
  }
  function unsubscribe() {
    sendToWS({ unsubscribeChannel: subscriptionChannel.value });
  }
  function sendMessage() {
    sendToWS({
      messageChannel: newMessageChannel.value,
      messageBody: newMessageBody.value
    });
    newMessageBody.value = "";
  }

  // src/mainScreen.tsx
  function MainScreen() {
    return /* @__PURE__ */ createElement("article", { id: "main-screen" }, /* @__PURE__ */ createElement("header", null, getText("settings")), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("div", { class: "tile width-input" }, /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("b", null, getText("messageLastReceived")), /* @__PURE__ */ createElement("p", { class: "secondary", "subscribe:innerText": lastReceivedMessage }))), /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement("label", { class: "tile" }, /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", null, getText("subscribeToChannel")), /* @__PURE__ */ createElement(
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
      /* @__PURE__ */ createElement("span", { class: "icon" }, "arrow_forward")
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
    /* @__PURE__ */ createElement("menu", null, /* @__PURE__ */ createElement("a", { class: "tab-link", href: "#main-screen", active: true }, /* @__PURE__ */ createElement("span", { class: "icon" }, "settings"), getText("settings")), /* @__PURE__ */ createElement("a", { class: "tab-link", href: "#message-screen" }, /* @__PURE__ */ createElement("span", { class: "icon" }, "chat"), getText("messages")))
  );
  document.querySelector("main").append(MainScreen(), MessageScreen());
})();
