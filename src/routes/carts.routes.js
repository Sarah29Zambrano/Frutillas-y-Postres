import { Router } from "express";
import CartManager from "../managers/CartManager.js";

const router = Router();
const cartManager = new CartManager("./carts.json", "./products.json");

router.post("/", async (req, res) => {
  const newCart = await cartManager.createCart();

  res.status(201).json({
    message: "¡Nuevo carrito agregado exitosamente!",
    cart: newCart
  });
});

router.get("/:cid", async (req, res) => {
  const cart = await cartManager.getCartById(req.params.cid);

  if (!cart) {
    return res.status(404).json({ message: "¡Carrito inexistente!" });
  }

  res.status(200).json(cart);
});

router.post("/:cid/product/:pid", async (req, res) => {
  const result = await cartManager.addProductToCart(req.params.cid, req.params.pid);

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

router.delete("/:cid/product/:pid", async (req, res) => {
  const result = await cartManager.deleteProductFromCart(req.params.cid, req.params.pid);

  if (result.error) return res.status(404).json(result);

  res.json({
    message: "Producto eliminado del carrito",
    cart: result
  });
});

router.put("/:cid", async (req, res) => {
  const result = await cartManager.updateCartProducts(req.params.cid, req.body);

  if (result.error) return res.status(400).json(result);

  res.json({
    message: "Carrito actualizado",
    cart: result
  });
});

router.put("/:cid/product/:pid", async (req, res) => {
  const { quantity } = req.body;

  const result = await cartManager.updateProductQuantity(req.params.cid, req.params.pid, quantity);

  if (result.error) return res.status(400).json(result);

  res.json({
    message: "Cantidad actualizada",
    cart: result
  });
});

router.delete("/:cid", async (req, res) => {
  const result = await cartManager.clearCart(req.params.cid);

  if (result.error) return res.status(404).json(result);

  res.json({
    message: "Carrito vaciado",
    cart: result
  });
});

export default router;
