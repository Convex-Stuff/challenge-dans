/**
 * The app's error types. The data layer throws these rather than bare
 * `Error`s, so callers can tell a missing record from a permission failure
 * with `instanceof` instead of matching on messages.
 *
 * Client-safe: no server imports, so a Client Component can check an error's
 * type too. Messages are written to be shown to the user; put anything
 * sensitive in logs, not here.
 */

/** Base class for every error the app throws on purpose. */
export abstract class AppError extends Error {
  /** The HTTP status a route handler should answer with. */
  abstract readonly status: number;

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    // Subclasses name themselves, so logs and stack traces say which one.
    this.name = new.target.name;
  }
}

/** A record that doesn't exist, or that the viewer isn't allowed to know about. */
export class NotFoundError extends AppError {
  readonly status = 404;

  constructor(
    readonly resource: string,
    readonly id?: string,
  ) {
    super(id === undefined ? `${resource} not found` : `${resource} ${id} not found`);
  }
}

/** Signed out, on a path that needs a signed-in user. */
export class UnauthorizedError extends AppError {
  readonly status = 401;

  constructor(message = "Sign in to continue") {
    super(message);
  }
}

/** Signed in, but without the role or ownership the action needs. */
export class ForbiddenError extends AppError {
  readonly status = 403;

  constructor(message = "You don't have permission to do that") {
    super(message);
  }
}

/**
 * Input that fails validation, with a message per field so a form can show
 * each one next to its control.
 */
export class ValidationError<Field extends string = string> extends AppError {
  readonly status = 400;

  constructor(readonly fields: Partial<Record<Field, string>>) {
    super("Some fields are invalid");
  }
}
