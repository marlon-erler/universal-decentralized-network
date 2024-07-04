(() => {
  // node_modules/bloatless-react/index.ts
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
  function createElement(tagName, attributes = {}, ...children) {
    const element = document.createElement(tagName);
    if (attributes != null)
      Object.entries(attributes).forEach((entry) => {
        const [attributename, value] = entry;
        const [directiveKey, directiveValue] = attributename.split(":");
        switch (directiveKey) {
          case "on": {
            element.addEventListener(directiveValue, value);
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

  // src/index.tsx
  var ws = new WebSocket(`ws://${window.location.host}`);
  ws.addEventListener("message", (message) => {
    receivedMessage.value = message.data;
  });
  function send(object) {
    const stringified = JSON.stringify(object);
    ws.send(stringified);
  }
  var receivedMessage = new State("");
  var subscriptionChannel = new State("");
  var messageChannel = new State("");
  var messageBody = new State("");
  function subscribe() {
    send({ subscribeChannel: subscriptionChannel.value });
  }
  function unsubscribe() {
    send({ unsubscribeChannel: subscriptionChannel.value });
  }
  function sendMessage() {
    send({
      messageChannel: messageChannel.value,
      messageBody: messageBody.value
    });
  }
  document.querySelector("main").append(
    /* @__PURE__ */ createElement("article", null, /* @__PURE__ */ createElement("header", null, "UDN Test"), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("div", { class: "tile" }, /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("b", null, "Received message"), /* @__PURE__ */ createElement("p", { class: "secondary", "subscribe:innerText": receivedMessage }))), /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement("label", { class: "tile" }, /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", null, "Subscribe to channel"), /* @__PURE__ */ createElement(
      "input",
      {
        placeholder: "my-channel",
        "bind:value": subscriptionChannel
      }
    ))), /* @__PURE__ */ createElement("div", { class: "flex-row width-input justify-end" }, /* @__PURE__ */ createElement("button", { class: "danger width-50", "on:click": unsubscribe }, "Unsubscribe"), /* @__PURE__ */ createElement("button", { class: "primary width-50", "on:click": subscribe }, "Subscribe", /* @__PURE__ */ createElement("span", { class: "icon" }, "arrow_forward"))), /* @__PURE__ */ createElement("hr", null), /* @__PURE__ */ createElement("label", { class: "tile" }, /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", null, "Channel"), /* @__PURE__ */ createElement("input", { placeholder: "my-channel", "bind:value": messageChannel }))), /* @__PURE__ */ createElement("label", { class: "tile" }, /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("span", null, "Message"), /* @__PURE__ */ createElement("input", { placeholder: "Hello, world!", "bind:value": messageBody }))), /* @__PURE__ */ createElement("div", { class: "flex-row width-input justify-end" }, /* @__PURE__ */ createElement("button", { class: "primary width-50", "on:click": sendMessage }, "Send", /* @__PURE__ */ createElement("span", { class: "icon" }, "arrow_forward")))))
  );
})();
