export default class UserDTO {
  constructor(user) {
    this._id = user._id;
    this.first_name = user.first_name;
    this.last_name = user.last_name;
    this.email = user.email;
    this.age = user.age;
    this.cart = user.cart;
    this.role = user.role;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }

  toPublicJSON() {
    return {
      _id: this._id,
      first_name: this.first_name,
      last_name: this.last_name,
      email: this.email,
      age: this.age,
      role: this.role,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  toJSON() {
    return {
      _id: this._id,
      first_name: this.first_name,
      last_name: this.last_name,
      email: this.email,
      age: this.age,
      cart: this.cart,
      role: this.role,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
