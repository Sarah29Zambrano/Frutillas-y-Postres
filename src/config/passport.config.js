import passport from "passport";
import LocalStrategy from "passport-local";
import JWTStrategy from "passport-jwt";
import jwt from "jsonwebtoken";
import UserManager from "../managers/UserManager.js";

const userManager = new UserManager();
const JWT_SECRET = process.env.JWT_SECRET;

// Estrategia Local (Login con email y password)
passport.use("register",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        // Validar que todos los campos requeridos estén presentes
        const { first_name, last_name, age, role } = req.body;

        if (!first_name || !last_name || !age) {
          return done(null, false, {
            message:
              "Debe proporcionar nombre, apellido y edad",
          });
        }

        // Verificar si el email ya existe
        const existingUser = await userManager.getUserByEmail(email);
        if (existingUser) {
          return done(null, false, {
            message: "El email ya está registrado",
          });
        }

        // Crear nuevo usuario
        const newUser = await userManager.createUser({
          first_name,
          last_name,
          email,
          age,
          role,
          password,
        });

        return done(null, newUser);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.use("login",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await userManager.getUserByEmail(email);

        if (!user) {
          return done(null, false, {
            message: "Usuario no encontrado",
          });
        }

        // Comparar contraseñas
        if (!user.comparePassword(password)) {
          return done(null, false, {
            message: "Contraseña incorrecta",
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Estrategia JWT (Validar token JWT)
passport.use("jwt",
  new JWTStrategy.Strategy(
    {
      jwtFromRequest: JWTStrategy.ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_SECRET,
    },
    async (payload, done) => {
      try {
        const user = await userManager.getUserById(payload.userId);

        if (!user) {
          return done(null, false);
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Estrategia Current (Validar usuario actual desde el header Authorization)
passport.use("current",
  new JWTStrategy.Strategy(
    {
      jwtFromRequest: JWTStrategy.ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_SECRET,
    },
    async (payload, done) => {
      try {
        const user = await userManager.getUserById(payload.userId);

        if (!user) {
          return done(null, false, {
            message: "Token inválido o usuario no encontrado",
          });
        }

        // Devolver el usuario sin la contraseña
        return done(null, {
          userId: user._id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          age: user.age,
          cart: user.cart,
          role: user.role,
        });
      } catch (error) {
        return done(null, false, {
          message: "Error al validar el token",
        });
      }
    }
  )
);

// Función para generar JWT
export const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: "24h",
  });
};

export default passport;
