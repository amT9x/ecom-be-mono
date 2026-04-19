export function encodeCursor(data: {
  created_at: string;
  id: string;
}) {
  return Buffer
    .from(JSON.stringify(data))
    .toString("base64");
}

export function decodeCursor(cursor: string) {
  return JSON.parse(
    Buffer.from(cursor, "base64").toString()
  );
}
