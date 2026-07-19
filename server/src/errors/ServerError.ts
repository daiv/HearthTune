
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
export class UserAlreadyExistsException extends ServerError {
  constructor(message: string = 'User already exists') {
    super(message, 409);
  }
}
export class UserNotFoundException extends ServerError {
  constructor(message: string = 'User not found') {
    super(message, 404);
  }
}

export class InvalidTokenException extends ServerError {
  constructor(message: string = 'Invalid or expired token') {
    super(message, 401);
  }
}
export class InvalidCredentialsException extends ServerError {
  constructor(message: string = 'Invalid credentials') {
    super(message, 401);
  }
}
export class MissingUserRoleException extends ServerError {
  constructor(message: string = 'Invalid role') {
    super(message, 500);
  }
}
export class AccountNotActiveException extends ServerError {
  constructor(message: string = 'Account is not ready') {
    super(message, 403);
  }
}
export class ForbiddenException extends ServerError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403);
  }
}
export class TrialExpiredException extends ServerError {
  constructor(message: string = "Your 15-day trial access has concluded. " +
    "I hope you've enjoyed exploring the application! " +
    "If you're interested in the full architecture or would like to discuss my development process, I'd love to chat.") {
    super(message, 401);
  }
}