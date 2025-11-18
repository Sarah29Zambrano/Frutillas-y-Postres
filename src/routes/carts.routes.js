import { Router } from "express";
import { readFileSync, writeFileSync } from "fs";
import CartManager from "../managers/CartManager.js";

const router = Router();
const cartManager = new CartManager("./carts.json", "./products.json");

let carts = JSON.parse(readFileSync("./carts.json", "utf-8"));
let products = JSON.parse(readFileSync("./products.json", "utf-8"));

router.post("/", (req, res) => {
  const newCart = cartManager.createCart(req.body);

  res.status(201).json({
    message: "¡Nuevo carrito agregado exitosamente!",
    cart: newCart
  });
});

router.get("/:cid", (req, res) => {
  const cart = cartManager.getCartById(req.params.cid);

  if (!cart) {
    return res.status(404).json({ message: "¡Carrito inexistente!" });
  }

  res.status(200).json(cart);
});

router.post("/:cid/product/:pid", (req, res) => {
  const result = cartManager.addProductToCart(req.params.cid, req.params.pid);

  if (result.error === "CART_NOT_FOUND") {
    return res.status(404).json({ message: "¡Carrito inexistente!" });
  }

  if (result.error === "PRODUCT_NOT_FOUND") {
    return res.status(404).json({ message: "¡Producto inexistente!" });
  }

  res.status(201).json({
    message: `Producto agregado correctamente al carrito ${req.params.cid}`,
    cart: result
  });
});

export default router;
