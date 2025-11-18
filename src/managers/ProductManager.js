import fs from "fs";

export default class ProductManager {
  constructor(path) {
    this.path = path;
    this.loadProducts();
  }

  loadProducts() {
    if (!fs.existsSync(this.path)) {
      fs.writeFileSync(this.path, JSON.stringify([], null, 2));
    }
    this.products = JSON.parse(fs.readFileSync(this.path, "utf-8"));
  }

  saveProducts() {
    fs.writeFileSync(this.path, JSON.stringify(this.products, null, 2), "utf-8");
  }

  getProducts() {
    this.loadProducts();
    return this.products;
  }

  getProductById(id) {
    this.loadProducts();
    return this.products.find(p => p.id == id) || null;
  }

  addProduct(data) {
    const newProduct = {
      id: this.products.length + 1,
      ...data
    };
    this.products.push(newProduct);
    this.saveProducts();
    return newProduct;
  }

  updateProduct(id, data) {
    this.loadProducts();

    const index = this.products.findIndex(p => p.id == id);
    if (index === -1) return null;

    const updatedProduct = { id: Number(id), ...data };
    this.products[index] = updatedProduct;

    this.saveProducts();

    return updatedProduct;
  }

  deleteProduct(id) {
    const product = this.products.find(p => p.id == id);
    if (!product) return null;

    this.products = this.products.filter(p => p.id != id);
    this.saveProducts();

    return product;
  }
}
