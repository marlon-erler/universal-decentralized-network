import * as React from "bloatless-react";

const ws = new WebSocket(`ws://${window.location.host}`);

ws.onopen = () => ws.send("Hello!")
ws.onmessage = (data) => console.log(data);

document.querySelector("main")!.append(<h1>Hello there!</h1>);
