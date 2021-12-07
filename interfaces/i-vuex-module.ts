export interface IVuexModule {
  state: any;
  getters: any;
  commit: any;
  dispatch: any;
  subscribe: any;
  watch: any;
}
// If we need more strongly typed, we can get the full type definition from here:
// https://gist.github.com/sue71/6239026e528593f637826cdbadaddc79