import { Router } from "express";
import passport from "passport";
import { productManager, emitUpdatedProducts } from "../App.js";
import { isAdmin } from "../middlewares/authorization.js";
import { asyncHandler } from "../middlewares/errorHandler.js";

const router = Router();

// GET /api/products - Obtener todos los productos (acceso público)
router.get("/", async (req, res) => {
  try {
    const result = await productManager.getProducts(req.query.limit, req.query.page, req.query.query, req.query.sort)

    const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}`;

    res.status(200).json({
      status: "success",
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage
        ? `${baseUrl}?page=${result.prevPage}&limit=${req.query.limit}`
        : null,
      nextLink: result.hasNextPage
        ? `${baseUrl}?page=${result.nextPage}&limit=${req.query.limit}`
        : null
    });

  } catch (error) {
    console.error("Error obteniendo productos:", error);

    res.status(500).json({
      status: "error",
      payload: "No se pudo obtener los productos: " + error
    });
  }
});

// GET /api/products/:pid - Obtener producto por ID (acceso público)
router.get("/:pid", async (req, res) => {
  const product = await productManager.getProductById(req.params.pid);

  if (!product) {
    return res.status(404).json({ message: "¡Producto no encontrado!" });
  }
  res.status(200).json(product);
});

// POST /api/products - Crear producto (solo administradores)
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  asyncHandler(async (req, res) => {
    const newProduct = await productManager.addProduct(req.body);

    emitUpdatedProducts();

    res.status(201).json({
      message: "¡Producto creado con éxito!",
      product: newProduct
    });
  })
);

// PUT /api/products/:pid - Actualizar producto (solo administradores)
router.put(
  "/:pid",
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  asyncHandler(async (req, res) => {
    const productoActualizado = await productManager.updateProduct(req.params.pid, req.body);

    if (!productoActualizado) {
      return res.status(404).json({ message: "¡Producto no encontrado!" });
    }
    
    emitUpdatedProducts();

    res.status(200).json({
      message: "¡Producto modificado con éxito!",
      product: productoActualizado
    });
  })
);

// DELETE /api/products/:pid - Eliminar producto (solo administradores)
router.delete(
  "/:pid",
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  asyncHandler(async (req, res) => {
    const deleted = await productManager.deleteProduct(req.params.pid);

    if (!deleted) {
      return res.status(404).json({ message: "¡Producto no encontrado!" });
    }

    emitUpdatedProducts();

    res.status(200).json({
      message: "¡Producto eliminado con éxito!",
      product: deleted
    });
  })
);

export default router;
