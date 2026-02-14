export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Errores de validación de Mongoose
  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Error de validación",
      code: "VALIDATION_ERROR",
      details: Object.values(err.errors).map((e) => e.message),
    });
  }

  // Errores de ID inválido en Mongoose
  if (err.name === "CastError") {
    return res.status(400).json({
      error: "ID inválido",
      code: "INVALID_ID",
      message: err.message,
    });
  }

  // Errores de clave duplicada
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      error: "Conflict: El valor ya existe",
      code: "DUPLICATE_ENTRY",
      field,
      message: `El ${field} ya está registrado en el sistema`,
    });
  }

  // Errores JWT
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      error: "Token inválido",
      code: "INVALID_TOKEN",
      message: err.message,
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      error: "Token expirado",
      code: "TOKEN_EXPIRED",
      message: "Tu sesión ha expirado. Por favor, inicia sesión de nuevo.",
      expiredAt: err.expiredAt,
    });
  }

  // Errores personalizados
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code || "INTERNAL_ERROR",
      details: err.details,
    });
  }

  // Error genérico
  res.status(500).json({
    error: "Error interno del servidor",
    code: "INTERNAL_SERVER_ERROR",
    message: process.env.NODE_ENV === "development" ? err.message : "Algo salió mal",
  });
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: "Ruta no encontrada",
    code: "NOT_FOUND",
    path: req.originalUrl,
    method: req.method,
  });
};

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Clase para errores personalizados de aplicación
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, code = "INTERNAL_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = null;

    // Capturar el stack trace correcto
    Error.captureStackTrace(this, this.constructor);
  }

  withDetails(details) {
    this.details = details;
    return this;
  }
}

/**
 * Errores específicos de validación
 */
export class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, "VALIDATION_ERROR");
    this.details = details;
  }
}

/**
 * Errores de autenticación
 */
export class AuthenticationError extends AppError {
  constructor(message = "No autorizado") {
    super(message, 401, "AUTHENTICATION_ERROR");
  }
}

/**
 * Errores de autorización
 */
export class AuthorizationError extends AppError {
  constructor(message = "Acceso denegado") {
    super(message, 403, "AUTHORIZATION_ERROR");
  }
}

/**
 * Errores de recurso no encontrado
 */
export class NotFoundError extends AppError {
  constructor(resource = "Recurso") {
    super(`${resource} no encontrado`, 404, "NOT_FOUND");
  }
}

/**
 * Errores de conflicto
 */
export class ConflictError extends AppError {
  constructor(message = "Conflicto en la solicitud", details = null) {
    super(message, 409, "CONFLICT");
    this.details = details;
  }
}
