export class ServerError extends Error {
  readonly statusCode: number;

  constructor(message: string = 'Server Error', statusCode: number = 500) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
    console.error(message);
  }
}

export class InvalidIdException extends ServerError {

  constructor(id: string, provider: string, message?: string) {
    const defaultMessage = `the id "${id}
    is not a valid id for provider ${provider}`;
    super(message || defaultMessage, 400);
  }
}
export class ProviderNotFoundException extends ServerError {
  constructor(message: string = 'Provider not found') {
    super(message, 400);
  }
}