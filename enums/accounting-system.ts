// The one accounting system a store keeps its books in. Before this existed the system was implied
// by whichever integration happened to be configured, so two could be live for the same store.
export enum AccountingSystem {
  None = 'None',
  Emonkey = 'Emonkey',
  Tripletex = 'Tripletex',
  // Recorded only; no provider or issuer implements it yet.
  Fiken = 'Fiken'
}
