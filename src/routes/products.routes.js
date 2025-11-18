import { Router } from "express";
import { readFileSync, writeFileSync } from "fs";
import { productManager, emitUpdatedProducts } from "../App.js";

const router = Router();

router.get("/", (req, res) => {
  res.status(200).json(productManager.getProducts());
});

router.get("/:pid", (req, res) => {
  const product = productManager.getProductById(req.params.pid);

  if (!product) {
    return res.status(404).json({ message: "¡Producto no encontrado!" });
  }
  res.status(200).json(product);
});

router.post("/", (req, res) => {
  const newProduct = productManager.addProduct(req.body);

  emitUpdatedProducts();

  res.status(201).json({
    message: "¡Producto creado con éxito!",
    product: newProduct
  });
});

router.put("/:pid", (req, res) => {
  const productoActualizado = productManager.updateProduct(req.params.pid, req.body);

  if (!productoActualizado) {
    return res.status(404).json({ message: "Not Found" });
  }
  
  emitUpdatedProducts();

  res.status(201).json({
    message: "¡Producto modificado con éxito!",
    product: productoActualizado
  });
});

router.delete("/:pid", (req, res) => {
  const deleted = productManager.deleteProduct(req.params.pid);

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
