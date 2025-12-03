import CartModel from "../model/carts.model.js";
import ProductModel from "../model/products.model.js";

export default class CartManager {
  // Crear un nuevo carrito
  async createCart() {
    const lastCart = await CartModel.findOne().sort({ id: -1 });
    const newId = lastCart ? lastCart.id + 1 : 1;

    return await CartModel.create({
      id: newId,
      products: []
    });
  }

  // Obtener carrito por ID
  async getCartById(cartId) {
    return await CartModel.findOne({ id: Number(cartId) }).populate("products.product");
  }

  // Agregar producto a carrito
  async addProductToCart(cartId, productId) {
    const cart = await CartModel.findOne({ id: Number(cartId) });
    if (!cart) return { error: "CART_NOT_FOUND" };

    const product = await ProductModel.findOne({ id: Number(productId) });
    if (!product) return { error: "PRODUCT_NOT_FOUND" };

    const existingItem = cart.products.find(p => p.product.toString() == product._id);

    if (existingItem) {
      existingItem.quantity++;
    } else {
      cart.products.push({ product: product._id, quantity: 1 });
    }

    await cart.save();
    return cart;
  }

  // Eliminar producto del carrito
  async deleteProductFromCart(cartId, productId) {
    const cart = await CartModel.findOne({ id: Number(cartId) });
    if (!cart) return { error: "CART_NOT_FOUND" };

    const product = await ProductModel.findOne({ id: Number(productId) });
    if (!product) return { error: "PRODUCT_NOT_FOUND" };

    cart.products = cart.products.filter(p => p.product.toString() != product._id);

    await cart.save();
    return cart;
  }

  // Actualizar todos los productos del carrito
  async updateCartProducts(cartId, productsArray) {
    const cart = await CartModel.findOne({ id: Number(cartId) });
    if (!cart) return { error: "CART_NOT_FOUND" };

    // Validación de productos
    for (const item of productsArray) {
      const exists = await ProductModel.findOne({ id: Number(item.productId) });
      if (!exists) return { error: "INVALID_PRODUCT", productId: item.productId };
    }

    // Convertir IDs numéricos a ObjectId
    const newList = await Promise.all(
      productsArray.map(async item => {
        const prod = await ProductModel.findOne({ id: Number(item.productId) });
        return {
          product: prod._id,
          quantity: item.quantity
        };
      })
    );

    cart.products = newList;
    await cart.save();

    return cart;
  }

  // Actualizar cantidad de un producto
  async updateProductQuantity(cartId, productId, quantity) {
    const cart = await CartModel.findOne({ id: Number(cartId) });
    if (!cart) return { error: "CART_NOT_FOUND" };

    const product = await ProductModel.findOne({ id: Number(productId) });
    if (!product) return { error: "PRODUCT_NOT_FOUND" };

    const item = cart.products.find(p => p.product.toString() == product._id);

    if (!item) return { error: "PRODUCT_NOT_IN_CART" };

    item.quantity = quantity;

    await cart.save();
    return cart;
  }

  // Elimina todos los productos del carrito
  async clearCart(cartId) {
    const cart = await CartModel.findOne({ id: Number(cartId) });
    if (!cart) return { error: "CART_NOT_FOUND" };

    cart.products = [];
    await cart.save();

    return cart;
  }
}
