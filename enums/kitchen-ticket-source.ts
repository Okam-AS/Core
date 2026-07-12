// Where a kitchen ticket comes from: an in-house POS table check (per-line coursing) or an online
// consumer order (order-level status). Wire values match the backend KitchenTicketSource enum.
export enum KitchenTicketSource {
  PosTable = 'PosTable',
  Online = 'Online'
}
