export class HttpError extends Error {
  constructor(reason: string, readonly code: number, readonly context?: any) {
    super(reason);
  }
}