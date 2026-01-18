import express from "express";
import passport from "passport";
import { generateToken } from "../config/passport.config.js";
import UserManager from "../managers/UserManager.js";

const router = express.Router();
const userManager = new UserManager();

// Registro de usuario
router.post("/register", passport.authenticate("register", { session: false }), (req, res) => {
    const user = req.user;
    const token = generateToken(user._id);

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      user: {
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        age: user.age,
        role: user.role,
      },
      token,
    });
  }
);

// Login de usuario
router.post("/login", passport.authenticate("login", { session: false }), (req, res) => {
    const user = req.user;
    const token = generateToken(user._id);

    res.status(200).json({
      message: "Login exitoso",
      user: {
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        age: user.age,
        role: user.role,
      },
      token,
    });
  }
);

// Obtener usuario actual (Current)
router.get("/current", passport.authenticate("current", { session: false }), (req, res) => {
  res.status(200).json({
    message: "Usuario autenticado",
    user: req.user,
  });
});

// Logout (Instrucción para cliente eliminar token)
router.post("/logout", (req, res) => {
  res.status(200).json({
    message:
      "Logout exitoso. Por favor, elimine el token del cliente.",
  });
});


// Obtener todos los usuarios
router.get("/", passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    const user = await userManager.getUserById(req.user._id);
    if (user.role !== "admin") {
      return res.status(403).json({
        error: "Acceso denegado. Se requiere rol de administrador",
      });
    }

    const users = await userManager.getAllUsers();
    res.status(200).json({
      message: "Usuarios obtenidos exitosamente",
      users,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener usuarios",
      details: error.message,
    });
  }
});

// Obtener usuario por ID
router.get("/:userId", passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    const { userId } = req.params;

    const currentUser = await userManager.getUserById(req.user._id);
    if (userId !== req.user._id.toString() && currentUser.role !== "admin") {
      return res.status(403).json({
        error:
          "Acceso denegado. Solo puedes ver tu propio perfil",
      });
    }

    const user = await userManager.getUserById(userId);
    if (!user) {
      return res.status(404).json({
        error: "Usuario no encontrado",
      });
    }

    res.status(200).json({
      message: "Usuario obtenido exitosamente",
      user,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener usuario",
      details: error.message,
    });
  }
});

// Actualizar usuario
router.put("/:userId", passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    const { userId } = req.params;

    const currentUser = await userManager.getUserById(req.user._id);
    if (
      userId !== req.user._id.toString() &&
      currentUser.role !== "admin"
    ) {
      return res.status(403).json({
        error:
          "Acceso denegado. Solo puedes editar tu propio perfil",
      });
    }

    const updatedUser = await userManager.updateUser(userId, req.body);
    if (!updatedUser) {
      return res.status(404).json({
        error: "Usuario no encontrado",
      });
    }

    res.status(200).json({
      message: "Usuario actualizado exitosamente",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error al actualizar usuario",
      details: error.message,
    });
  }
});

// Cambiar contraseña
router.put("/:userId/password", passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword, oldPassword } = req.body;

    if (!newPassword || !oldPassword) {
      return res.status(400).json({
        error: "Debe proporcionar contraseña anterior y nueva",
      });
    }

    if (userId !== req.user._id.toString()) {
      return res.status(403).json({
        error: "Acceso denegado. Solo puedes cambiar tu propia contraseña",
      });
    }

    const user = await userManager.getUserById(userId);
    if (!user) {
      return res.status(404).json({
        error: "Usuario no encontrado",
      });
    }

    if (!user.comparePassword(oldPassword)) {
      return res.status(401).json({
        error: "Contraseña anterior incorrecta",
      });
    }

    await userManager.updatePassword(userId, newPassword);

    res.status(200).json({
      message: "Contraseña actualizada exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      error: "Error al cambiar contraseña",
      details: error.message,
    });
  }
});

// Eliminar usuario (solo admin)
router.delete("/:userId", passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    const { userId } = req.params;

    const currentUser = await userManager.getUserById(req.user._id);
    if (currentUser.role !== "admin") {
      return res.status(403).json({
        error: "Acceso denegado. Se requiere rol de administrador",
      });
    }

    const deletedUser = await userManager.deleteUser(userId);
    if (!deletedUser) {
      return res.status(404).json({
        error: "Usuario no encontrado",
      });
    }

    res.status(200).json({
      message: "Usuario eliminado exitosamente",
      user: deletedUser,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error al eliminar usuario",
      details: error.message,
    });
  }
});

export default router;
