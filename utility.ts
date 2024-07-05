import Colors from "colors";

export function guardStringNotEmpty(
  data: any,
  cb: (data: string) => void
): void {
  if (typeof data != "string" || data == "") return;
  cb(data);
}

export function writeInfo(label: string, value: string) {
  console.log(label.padEnd(20, " "), Colors.bold.green(value));
}

export function writeStat(label: string, value: number) {
  console.log(label.padEnd(20, " "), Colors.bold.blue(value.toString()));
}
