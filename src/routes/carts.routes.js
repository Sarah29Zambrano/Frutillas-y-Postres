import { Router } from "express";
import { readFileSync, writeFileSync } from "fs";

const router = Router();

let carts = JSON.parse(readFileSync("./carts.json", "utf-8"));
let products = JSON.parse(readFileSync("./products.json", "utf-8"));

router.post("/", (req, res) => {
  const newCart = {
    id: carts.length + 1,
    products: [],
    ...req.body
  };

  carts.push(newCart);
  writeFileSync("./carts.json", JSON.stringify(carts, null, 2), "utf-8");

  res.status(201).json({
    message: "¡Nuevo carrito agregado exitosamente!",
    cart: newCart
  });
});

router.get("/:cid", (req, res) => {
  const cartId = req.params.cid;
  const cart = carts.find(c => c.id == cartId);

  if (!cart) {
    return res.status(404).json({ message: "¡Carrito inexistente!" });
  }

  res.status(200).json(cart);
});

router.post("/:cid/product/:pid", (req, res) => {
  const cartId = req.params.cid;
  const cart = carts.find(c => c.id == cartId);

  if (!cart) {
    return res.status(404).json({ message: "¡Carrito inexistente!" });
  }

  const productId = req.params.pid;
  const product = products.find(p => p.id == productId);

  if (!product) {
    return res.status(404).json({ message: "¡Producto inexistente!" });
  }

  const cartProduct = cart.products.find(p => p.product == productId);

  if (!cartProduct) {
    cart.products.push({ product: product.id, quantity: 1 });
  } else {
    cartProduct.quantity += 1;
  }

  writeFileSync("./carts.json", JSON.stringify(carts, null, 2), "utf-8");

  res.status(201).json({
    message: `Producto agregado correctamente al carrito ${cartId}`,
    cart
  });
});

export default router;
