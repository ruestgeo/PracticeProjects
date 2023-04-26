export class generateUniqueIdError extends Error {
  constructor(...params: any[]) {
      // Pass remaining arguments (including vendor specific ones) to parent constructor
      super(...params);

      this.name = "generateUniqueIdError";
  
      // Maintains proper stack trace for where our error was thrown (only available on V8)
      if (Error?.captureStackTrace) {
        Error.captureStackTrace(this, generateUniqueIdError);
      }
  }
}

export class OutOfTokensError extends generateUniqueIdError {
    constructor(...params: any[]) {
        super(...params);
        this.name = "OutOfTokensError";
        if (Error?.captureStackTrace) {
          Error.captureStackTrace(this, OutOfTokensError);
        }
    }
}

export class InvalidPatternError extends generateUniqueIdError {
  constructor(...params: any[]) {
      super(...params);
      this.name = "InvalidPatternError";
      if (Error?.captureStackTrace) {
        Error.captureStackTrace(this, InvalidPatternError);
      }
  }
}

export class NoSuchCollectionError extends generateUniqueIdError {
  constructor(...params: any[]) {
      super(...params);
      this.name = "NoSuchCollectionError";
      if (Error?.captureStackTrace) {
        Error.captureStackTrace(this, NoSuchCollectionError);
      }
  }
}

export class NoSuchIdError extends generateUniqueIdError {
  constructor(...params: any[]) {
      super(...params);
      this.name = "NoSuchIdError";
      if (Error?.captureStackTrace) {
        Error.captureStackTrace(this, NoSuchIdError);
      }
  }
}

export class IdAlreadyExistsError extends generateUniqueIdError {
  constructor(...params: any[]) {
      super(...params);
      this.name = "IdAlreadyExistsError";
      if (Error?.captureStackTrace) {
        Error.captureStackTrace(this, IdAlreadyExistsError);
      }
  }
}


