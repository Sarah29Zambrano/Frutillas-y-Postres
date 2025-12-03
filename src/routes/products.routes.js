import { Router } from "express";
import { productManager, emitUpdatedProducts } from "../App.js";

const router = Router();

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

router.get("/:pid", async (req, res) => {
  const product = await productManager.getProductById(req.params.pid);

  if (!product) {
    return res.status(404).json({ message: "¡Producto no encontrado!" });
  }
  res.status(200).json(product);
});

router.post("/", async (req, res) => {
  const newProduct = await productManager.addProduct(req.body);

  emitUpdatedProducts();

  res.status(201).json({
    message: "¡Producto creado con éxito!",
    product: newProduct
  });
});

router.put("/:pid", async (req, res) => {
  const productoActualizado = await productManager.updateProduct(req.params.pid, req.body);

  if (!productoActualizado) {
    return res.status(404).json({ message: "Not Found" });
  }
  
  emitUpdatedProducts();

  res.status(201).json({
    message: "¡Producto modificado con éxito!",
    product: productoActualizado
  });
});

router.delete("/:pid", async (req, res) => {
  const deleted = await productManager.deleteProduct(req.params.pid);

  if (!deleted) {
    return res.status(404).json({ message: "¡Producto no encontrado!" });
  }

  emitUpdatedProducts();

  res.status(200).json({
    message: "¡Producto eliminado con éxito!",
    product: deleted
  });
});

export default router;
