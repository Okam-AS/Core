export interface IHttpModule {
  httpClient: any;
  // Native (NativeScript) implementations also expose a background-http session
  // factory used for multipart/file uploads; optional so web adapters need not provide it.
  bghttp?: any;
}