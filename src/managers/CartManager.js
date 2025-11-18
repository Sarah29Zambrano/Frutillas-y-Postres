import fs from "fs";
import ProductManager from "./ProductManager.js";

export default class CartManager {
  constructor(path, productsPath) {
    this.path = path;
    this.productsPath = productsPath;
    this.loadCarts();
    this.loadProducts();
  }

  loadCarts() {
    if (!fs.existsSync(this.path)) {
      fs.writeFileSync(this.path, JSON.stringify([], null, 2));
    }
    this.carts = JSON.parse(fs.readFileSync(this.path, "utf-8"));
  }

  loadProducts() {
    const productManager = new ProductManager(this.productsPath);
    this.products = productManager.getProducts();
  }

  saveCarts() {
    fs.writeFileSync(this.path, JSON.stringify(this.carts, null, 2), "utf-8");
  }

  // Crear un nuevo carrito
  createCart(body) {
    this.loadCarts();

    const newCart = {
      id: this.carts.length ? this.carts[this.carts.length - 1].id + 1 : 1,
      products: [],
      ...body
    };

    this.carts.push(newCart);
    this.saveCarts();

    return newCart;
  }

  // Obtener carrito por ID
  getCartById(id) {
    this.loadCarts();
    return this.carts.find(c => c.id == id) || null;
  }

  // Agregar producto a carrito
  addProductToCart(cartId, productId) {
    this.loadCarts();
    this.loadProducts();

    const cart = this.carts.find(c => c.id == cartId);
    if (!cart) return { error: "CART_NOT_FOUND" };

    const product = this.products.find(p => p.id == productId);
    if (!product) return { error: "PRODUCT_NOT_FOUND" };

    const existing = cart.products.find(p => p.product == productId);

    if (!existing) {
      cart.products.push({ product: product.id, quantity: 1 });
    } else {
      existing.quantity++;
    }

    this.saveCarts();
    return cart;
  }
}
