export const authenticate = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: "No autorizado. Debes estar autenticado.",
      code: "NOT_AUTHENTICATED",
    });
  }
  next();
};

export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: "No autorizado. Debes estar autenticado.",
      code: "NOT_AUTHENTICATED",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      error: "Acceso denegado. Solo los administradores pueden realizar esta acción.",
      code: "FORBIDDEN",
      userRole: req.user.role,
    });
  }

  next();
};

export const isUser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: "No autorizado. Debes estar autenticado.",
      code: "NOT_AUTHENTICATED",
    });
  }

  if (req.user.role !== "user") {
    return res.status(403).json({
      error: "Acceso denegado. Solo los usuarios regulares pueden realizar esta acción.",
      code: "FORBIDDEN",
      userRole: req.user.role,
    });
  }

  next();
};

export const isOwner = (resourceOwnerPath) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "No autorizado. Debes estar autenticado.",
        code: "NOT_AUTHENTICATED",
      });
    }

    // Extraer el valor del campo especificado
    const pathParts = resourceOwnerPath.split(".");
    let resourceOwnerId = null;

    if (pathParts[0] === "body") {
      resourceOwnerId = req.body[pathParts[1]];
    } else if (pathParts[0] === "params") {
      resourceOwnerId = req.params[pathParts[1]];
    } else if (pathParts[0] === "query") {
      resourceOwnerId = req.query[pathParts[1]];
    }

    if (!resourceOwnerId) {
      return res.status(400).json({
        error: "No se puede determinar el propietario del recurso.",
        code: "INVALID_REQUEST",
      });
    }

    const userId = req.user._id.toString();
    
    if (userId !== resourceOwnerId) {
      return res.status(403).json({
        error: "Acceso denegado. No tienes permiso para acceder a este recurso.",
        code: "FORBIDDEN",
      });
    }

    next();
  };
};

export const hasRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "No autorizado. Debes estar autenticado.",
        code: "NOT_AUTHENTICATED",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Acceso denegado. Se requiere uno de los siguientes roles: ${allowedRoles.join(", ")}`,
        code: "FORBIDDEN",
        userRole: req.user.role,
        allowedRoles,
      });
    }

    next();
  };
};

export const checkPermission = (permissionCheck) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: "No autorizado. Debes estar autenticado.",
          code: "NOT_AUTHENTICATED",
        });
      }

      const hasPermission = await permissionCheck(req);

      if (!hasPermission) {
        return res.status(403).json({
          error: "Acceso denegado. No tienes permiso para realizar esta acción.",
          code: "FORBIDDEN",
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        error: "Error al verificar permisos.",
        code: "INTERNAL_ERROR",
        message: error.message,
      });
    }
  };
};

export const rateLimitByIP = (maxAttempts = 5, windowMs = 60000) => {
  const attempts = new Map();

  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();

    if (!attempts.has(ip)) {
      attempts.set(ip, []);
    }

    const ipAttempts = attempts.get(ip);

    // Limpiar intentos expirados
    const validAttempts = ipAttempts.filter((timestamp) => now - timestamp < windowMs);

    if (validAttempts.length >= maxAttempts) {
      return res.status(429).json({
        error: "Demasiados intentos. Intenta de nuevo más tarde.",
        code: "TOO_MANY_REQUESTS",
        retryAfter: Math.ceil((validAttempts[0] + windowMs - now) / 1000),
      });
    }

    validAttempts.push(now);
    attempts.set(ip, validAttempts);

    next();
  };
};
