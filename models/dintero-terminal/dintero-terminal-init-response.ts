export class DinteroTerminalInitResponse {
  sessionId: string;
  merchantReference: string;
  // Raw session JSON from Dintero, for debugging.
  raw: string;
}
