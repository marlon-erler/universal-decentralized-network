import Colors from "colors";

export function guardStringNotEmpty(
  data: any,
  cb: (data: string) => void
): void {
  if (typeof data != "string" || data == "") return;
  cb(data);
}

export function writeStat(label: string, value: number) {
  console.log(Colors.bold.blue(value.toString().padStart(9, " ")), label);
}
