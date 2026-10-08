export type ErrorDetails = Record<string, string[] | undefined>;

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: ErrorDetails,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}
