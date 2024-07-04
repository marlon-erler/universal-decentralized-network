export function guardStringNotEmpty(
  data: any,
  cb: (data: string) => void
): void {
  if (typeof data != "string" || data == "") return;
  cb(data);
}
