import { Router } from "express";
import passport from "passport";
import CartManager from "../managers/CartManager.js";
import { isUser, authenticate } from "../middlewares/authorization.js";
import { asyncHandler } from "../middlewares/errorHandler.js";

const router = Router();
const cartManager = new CartManager("./carts.json", "./products.json");

// POST /api/carts - Crear nuevo carrito (usuarios autenticados)
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  authenticate,
  asyncHandler(async (req, res) => {
    const newCart = await cartManager.createCart();

    res.status(201).json({
      message: "¡Nuevo carrito agregado exitosamente!",
      cart: newCart
    });
  })
);

// GET /api/carts/:cid - Obtener carrito por ID (usuarios autenticados)
router.get(
  "/:cid",
  passport.authenticate("jwt", { session: false }),
  authenticate,
  asyncHandler(async (req, res) => {
    const cart = await cartManager.getCartById(req.params.cid);

    if (!cart) {
      return res.status(404).json({ message: "¡Carrito inexistente!" });
    }

    res.status(200).json(cart);
  })
);

// POST /api/carts/:cid/product/:pid - Agregar producto a carrito (solo usuarios)
router.post(
  "/:cid/product/:pid",
  passport.authenticate("jwt", { session: false }),
  isUser,
  asyncHandler(async (req, res) => {
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
  })
);

// DELETE /api/carts/:cid/product/:pid - Eliminar producto del carrito (solo usuarios)
router.delete(
  "/:cid/product/:pid",
  passport.authenticate("jwt", { session: false }),
  isUser,
  asyncHandler(async (req, res) => {
    const result = await cartManager.deleteProductFromCart(req.params.cid, req.params.pid);

    if (result.error) return res.status(404).json(result);

    res.status(200).json({
      message: "Producto eliminado del carrito",
      cart: result
    });
  })
);

// PUT /api/carts/:cid - Actualizar carrito (solo usuarios)
router.put(
  "/:cid",
  passport.authenticate("jwt", { session: false }),
  isUser,
  asyncHandler(async (req, res) => {
    const result = await cartManager.updateCartProducts(req.params.cid, req.body);

    if (result.error) return res.status(400).json(result);

    res.status(200).json({
      message: "Carrito actualizado",
      cart: result
    });
  })
);

// PUT /api/carts/:cid/product/:pid - Actualizar cantidad de producto (solo usuarios)
router.put(
  "/:cid/product/:pid",
  passport.authenticate("jwt", { session: false }),
  isUser,
  asyncHandler(async (req, res) => {
    const { quantity } = req.body;

    const result = await cartManager.updateProductQuantity(req.params.cid, req.params.pid, quantity);

    if (result.error) return res.status(400).json(result);

    res.status(200).json({
      message: "Cantidad actualizada",
      cart: result
    });
  })
);

// DELETE /api/carts/:cid - Vaciar carrito (solo usuarios)
router.delete(
  "/:cid",
  passport.authenticate("jwt", { session: false }),
  isUser,
  asyncHandler(async (req, res) => {
    const result = await cartManager.clearCart(req.params.cid);

    if (result.error) return res.status(404).json(result);

    res.status(200).json({
      message: "Carrito vaciado",
      cart: result
    });
  })
);

export default router;
