import Colors from "colors";
import Fs from "fs/promises";
import { WebSocketMessage } from "./websocket-handler";

// CONFIG
const indent = 25;

// METHODS
export function guardStringNotEmpty(
  data: any,
  cb: (data: string) => void
): void {
  if (typeof data != "string" || data == "") return;
  cb(data);
}

// writing
async function writeToLogFile(message: string): Promise<void> {
  await Fs.appendFile("logs", `${message}\n`);
}

export function writeInfo(label: string, value: string): void {
  console.log(`${label.padEnd(indent, " ")} ${Colors.bold.green(value)}`);
}

export function writeStat(label: string, value: number): void {
  console.log(
    `${label.padEnd(indent, " ")} ${Colors.bold.blue(value.toString())}`
  );
}

export function writeError(message: string): void {
  console.log(Colors.bold.red(message));
  writeToLogFile(message);
}

export function writeSuccess(message: string): void {
  console.log(Colors.bold.green(message));
  writeToLogFile(message);
}

// messages
export function stringifyMessage(messageObject: WebSocketMessage): string {
  return JSON.stringify(messageObject);
}

export function parseMessage(messageString: string): Object {
  return JSON.parse(messageString);
}
