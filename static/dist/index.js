(() => {
  // node_modules/bloatless-react/index.ts
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
  document.querySelector("main").append(
    /* @__PURE__ */ createElement("h1", null, "Hello there!")
  );
})();
