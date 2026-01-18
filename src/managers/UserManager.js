import User from "../model/user.model.js";

class UserManager {
  // Crear un nuevo usuario
  async createUser(userData) {
    try {
      const newUser = new User(userData);
      await newUser.save();
      return newUser;
    } catch (error) {
      throw error;
    }
  }

  // Obtener todos los usuarios
  async getAllUsers() {
    try {
      const users = await User.find().populate("cart");
      return users;
    } catch (error) {
      throw error;
    }
  }

  // Obtener usuario por ID
  async getUserById(userId) {
    try {
      const user = await User.findById(userId).populate("cart");
      return user;
    } catch (error) {
      throw error;
    }
  }

  // Obtener usuario por email
  async getUserByEmail(email) {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      return user;
    } catch (error) {
      throw error;
    }
  }

  // Actualizar usuario
  async updateUser(userId, updateData) {
    try {
      // No permitir actualizar la contraseña por este método
      const { password, ...safeData } = updateData;

      const updatedUser = await User.findByIdAndUpdate(userId, safeData, {
        new: true,
      }).populate("cart");

      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

  // Cambiar contraseña
  async updatePassword(userId, newPassword) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("Usuario no encontrado");
      }

      user.password = newPassword;
      await user.save();
      return user;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar usuario
  async deleteUser(userId) {
    try {
      const deletedUser = await User.findByIdAndDelete(userId);
      return deletedUser;
    } catch (error) {
      throw error;
    }
  }

  // Validar email único
  async isEmailTaken(email) {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      return user !== null;
    } catch (error) {
      throw error;
    }
  }
}

export default UserManager;
