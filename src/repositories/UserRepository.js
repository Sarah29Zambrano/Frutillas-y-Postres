import BaseRepository from "./BaseRepository.js";
import UserModel from "../model/user.model.js";

export default class UserRepository extends BaseRepository {
  constructor() {
    super(UserModel);
  }

  async getUserByEmail(email) {
    try {
      return await this.model.findOne({ email: email.toLowerCase() });
    } catch (error) {
      throw new Error(`Error al obtener usuario por email: ${error.message}`);
    }
  }

  async getUserByIdWithCart(userId) {
    try {
      return await this.model.findById(userId).populate("cart");
    } catch (error) {
      throw new Error(`Error al obtener usuario con carrito: ${error.message}`);
    }
  }

  async getAllUsers() {
    try {
      return await this.model.find().populate("cart");
    } catch (error) {
      throw new Error(`Error al obtener usuarios: ${error.message}`);
    }
  }

  async createUser(userData) {
    try {
      const newUser = new this.model(userData);
      await newUser.save();
      return newUser;
    } catch (error) {
      throw new Error(`Error al crear usuario: ${error.message}`);
    }
  }

  async updateUser(userId, updateData) {
    try {
      // No permitir actualizar la contraseña por este método
      const { password, ...safeData } = updateData;

      return await this.model.findByIdAndUpdate(userId, safeData, {
        new: true,
      }).populate("cart");
    } catch (error) {
      throw new Error(`Error al actualizar usuario: ${error.message}`);
    }
  }

  async updatePassword(userId, newPassword) {
    try {
      const user = await this.model.findById(userId);
      if (!user) {
        throw new Error("Usuario no encontrado");
      }

      user.password = newPassword;
      await user.save();
      return user;
    } catch (error) {
      throw new Error(`Error al actualizar contraseña: ${error.message}`);
    }
  }

  async updatePasswordWithValidation(userId, newPassword, currentPassword) {
    try {
      const user = await this.model.findById(userId);
      if (!user) {
        throw new Error("Usuario no encontrado");
      }

      // Validar que la contraseña actual sea correcta
      if (!user.comparePassword(currentPassword)) {
        throw new Error("La contraseña actual es incorrecta");
      }

      // Validar que la nueva contraseña sea diferente a la anterior
      if (user.comparePassword(newPassword)) {
        throw new Error("La nueva contraseña no puede ser igual a la anterior");
      }

      user.password = newPassword;
      await user.save();
      return user;
    } catch (error) {
      throw new Error(`Error al actualizar contraseña: ${error.message}`);
    }
  }

  async deleteUser(userId) {
    try {
      return await this.model.findByIdAndDelete(userId);
    } catch (error) {
      throw new Error(`Error al eliminar usuario: ${error.message}`);
    }
  }

  async isEmailAvailable(email) {
    try {
      const user = await this.model.findOne({ email: email.toLowerCase() });
      return user === null;
    } catch (error) {
      throw new Error(`Error al verificar email: ${error.message}`);
    }
  }

  async getUsersByRole(role) {
    try {
      return await this.model.find({ role });
    } catch (error) {
      throw new Error(`Error al obtener usuarios por rol: ${error.message}`);
    }
  }

  async updateUserRole(userId, newRole) {
    try {
      const validRoles = ["user", "admin"];
      if (!validRoles.includes(newRole)) {
        throw new Error(`Rol inválido. Los roles válidos son: ${validRoles.join(", ")}`);
      }

      return await this.model.findByIdAndUpdate(userId, { role: newRole }, {
        new: true,
      });
    } catch (error) {
      throw new Error(`Error al actualizar rol: ${error.message}`);
    }
  }

  async updateUserCart(userId, cartId) {
    try {
      return await this.model.findByIdAndUpdate(
        userId,
        { cart: cartId },
        { new: true }
      ).populate("cart");
    } catch (error) {
      throw new Error(`Error al actualizar carrito de usuario: ${error.message}`);
    }
  }
}
