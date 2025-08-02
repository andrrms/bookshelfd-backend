export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

export class InvalidIdError extends Error {
  constructor(message: string = 'ID inválido.') {
    super(message);
    this.name = 'InvalidIdError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string = 'Acesso não autorizado.') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}
