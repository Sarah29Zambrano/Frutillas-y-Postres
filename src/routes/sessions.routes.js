import express from "express";
import passport from "passport";

const router = express.Router();

router.get("/current", passport.authenticate("current", { session: false }), (req, res) => {
    if (!req.user) {
      return res.status(401).json({
        error: "No autorizado. Token inválido o expirado.",
      });
    }

    res.status(200).json({
      message: "Usuario actual obtenido exitosamente",
      user: req.user,
    });
  }
);

export default router;
