// How a cash point routes in-person card payments. Auto keeps the implicit rule (a Surfboard
// terminal id ⇒ Surfboard, otherwise Dintero); the explicit values override it.
export enum TerminalProvider {
  Auto = 'Auto',
  Surfboard = 'Surfboard',
  Dintero = 'Dintero'
}
