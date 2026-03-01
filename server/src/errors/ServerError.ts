export class ServerError extends Error {
  readonly statusCode: number;

  constructor(message: string = 'Server Error', statusCode: number = 500) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class InvalidIdException extends ServerError {
  constructor(message: string = 'Invalid id') {
    super(message, 400);
  }
}