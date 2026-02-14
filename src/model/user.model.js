import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    cart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "carritos",
      default: null,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    // Campos para recuperación de contraseña
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Middleware para encriptar la contraseña antes de guardar
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compareSync(plainPassword, this.password);
};

userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  
  // Hashear el token para guardarlo en la BD
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  
  // Token válido por 1 hora
  this.resetPasswordExpires = Date.now() + 60 * 60 * 1000;

  return resetToken; // Retornar el token sin hashear para enviar al usuario
};

// Verificar si el token de recuperación es válido
userSchema.methods.verifyPasswordResetToken = function (token) {
  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  return (
    this.resetPasswordToken === hashedToken &&
    this.resetPasswordExpires > Date.now()
  );
};

// Limpiar tokens de recuperación después de usar
userSchema.methods.clearPasswordResetToken = function () {
  this.resetPasswordToken = null;
  this.resetPasswordExpires = null;
};

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpires;
  return user;
};

const User = mongoose.model("users", userSchema);

export default User;
