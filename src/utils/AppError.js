/**
 * Error "esperado" de la aplicación (validación, auth, no encontrado...).
 * El middleware de errores lo convierte en una respuesta JSON con su status.
 */
export class AppError extends Error {
  constructor(message, status = 500, details = undefined) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.details = details;
  }

  static badRequest(message, details) { return new AppError(message, 400, details); }
  static unauthorized(message = 'No autenticado') { return new AppError(message, 401); }
  static forbidden(message = 'No tienes permiso para esta acción') { return new AppError(message, 403); }
  static notFound(message = 'Recurso no encontrado') { return new AppError(message, 404); }
  static conflict(message) { return new AppError(message, 409); }
}
