import express from "express";
import passport from "passport";
import UserRepository from "../repositories/UserRepository.js";
import { sendPasswordResetEmail } from "../services/emailService.js";
import {
  ValidationError,
  NotFoundError,
  AuthenticationError,
  asyncHandler,
} from "../middlewares/errorHandler.js";

const router = express.Router();
const userRepository = new UserRepository();

router.post(
  "/request",
  asyncHandler(async (req, res) => {
    const { email } = req.body;

    // Validar que el email sea proporcionado
    if (!email) {
      throw new ValidationError("El email es requerido");
    }

    // Buscar usuario por email
    const user = await userRepository.getUserByEmail(email);

    if (!user) {
      // Por seguridad, no revelar si el email existe o no
      return res.status(200).json({
        message:
          "Si el email existe en el sistema, recibirás instrucciones para recuperar tu contraseña",
      });
    }

    // Generar token de recuperación
    const resetToken = user.generatePasswordResetToken();

    await user.save();

    // Construir URL de recuperación
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password/${resetToken}`;

    try {
      // Enviar correo
      await sendPasswordResetEmail(user.email, resetUrl);

      res.status(200).json({
        message: "Se ha enviado un correo con instrucciones para recuperar tu contraseña",
        note: "El enlace expirará en 1 hora",
      });
    } catch (error) {
      // Limpiar tokens en caso de error
      user.clearPasswordResetToken();
      await user.save();

      throw new Error("Error al enviar el correo de recuperación");
    }
  })
);

router.post(
  "/reset/:token",
  asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;

    // Validaciones
    if (!newPassword || !confirmPassword) {
      throw new ValidationError(
        "Las contraseñas son requeridas"
      );
    }

    if (newPassword !== confirmPassword) {
      throw new ValidationError("Las contraseñas no coinciden");
    }

    if (newPassword.length < 6) {
      throw new ValidationError(
        "La contraseña debe tener al menos 6 caracteres"
      );
    }

    // Buscar usuario con token válido
    const user = await userRepository.findOne({
      resetPasswordToken: require("crypto")
        .createHash("sha256")
        .update(token)
        .digest("hex"),
    });

    if (!user || !user.verifyPasswordResetToken(token)) {
      throw new AuthenticationError(
        "Token inválido o expirado. Solicita una nueva recuperación."
      );
    }

    // Validar que la nueva contraseña sea diferente a la anterior
    if (user.comparePassword(newPassword)) {
      throw new ValidationError(
        "La nueva contraseña no puede ser igual a la anterior"
      );
    }

    // Actualizar contraseña
    user.password = newPassword;
    user.clearPasswordResetToken();
    await user.save();

    res.status(200).json({
      message: "Contraseña restablecida exitosamente",
      note: "Ya puedes iniciar sesión con tu nueva contraseña",
    });
  })
);

router.get(
  "/verify/:token",
  asyncHandler(async (req, res) => {
    const { token } = req.params;
    const crypto = await import("crypto");

    // Buscar usuario con token válido
    const user = await userRepository.findOne({
      resetPasswordToken: crypto.default
        .createHash("sha256")
        .update(token)
        .digest("hex"),
    });

    if (!user || !user.verifyPasswordResetToken(token)) {
      return res.status(400).json({
        valid: false,
        message: "Token inválido o expirado",
      });
    }

    res.status(200).json({
      valid: true,
      message: "Token válido",
      email: user.email,
    });
  })
);

router.post(
  "/change-password",
  passport.authenticate("current", { session: false }),
  asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validaciones
    if (!currentPassword || !newPassword || !confirmPassword) {
      throw new ValidationError(
        "Todos los campos son requeridos"
      );
    }

    if (newPassword !== confirmPassword) {
      throw new ValidationError("Las contraseñas no coinciden");
    }

    if (newPassword.length < 6) {
      throw new ValidationError(
        "La contraseña debe tener al menos 6 caracteres"
      );
    }

    // Obtener usuario
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError("Usuario");
    }

    // Validar contraseña actual
    if (!user.comparePassword(currentPassword)) {
      throw new ValidationError("La contraseña actual es incorrecta");
    }

    // Validar que la nueva contraseña sea diferente
    if (user.comparePassword(newPassword)) {
      throw new ValidationError(
        "La nueva contraseña no puede ser igual a la anterior"
      );
    }

    // Actualizar contraseña
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      message: "Contraseña actualizada exitosamente",
    });
  })
);

export default router;
