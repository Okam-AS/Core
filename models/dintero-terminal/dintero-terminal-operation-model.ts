export class DinteroTerminalOperationModel {
  // One of: check_update, send_logs, end_of_day, open_menu.
  operation: string;
  // Optional override; falls back to the backend default terminal.
  terminalId?: string;
}
