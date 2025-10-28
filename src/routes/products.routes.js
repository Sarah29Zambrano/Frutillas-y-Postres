import { Router } from "express";
import { readFileSync, writeFileSync } from "fs";

const router = Router();

let products = JSON.parse(readFileSync("./products.json", "utf-8"));

router.get("/", (req, res) => {
  res.status(200).json(products);
});

router.get("/:pid", (req, res) => {
  const productId = req.params.pid;
  const product = products.find(p => p.id == productId);

  if (!product) {
    return res.status(404).json({ message: "¡Producto no encontrado!" });
  }
  res.status(200).json(product);
});

router.post("/", (req, res) => {
  const newProduct = {
    id: products.length + 1,
    ...req.body
  };

  products.push(newProduct);
  writeFileSync("./products.json", JSON.stringify(products, null, 2), "utf-8");

  res.status(201).json({
    message: "¡Producto creado con éxito!",
    product: newProduct
  });
});

router.put("/:pid", (req, res) => {
  const productId = req.params.pid;
  const product = products.find(p => p.id == productId);

  if (!product) {
    return res.status(404).json({ message: "Not Found" });
  }

  const productoAModificar = { id: product.id, ...req.body };

  const productosModificados = products.map(p =>
    p.id === product.id ? productoAModificar : p
  );

  writeFileSync("./products.json", JSON.stringify(productosModificados, null, 2), "utf-8");

  res.status(201).json({
    message: "¡Producto modificado con éxito!",
    product: productoAModificar
  });
});

router.delete("/:pid", (req, res) => {
  const productId = req.params.pid;
  const product = products.find(p => p.id == productId);

  if (!product) {
    return res.status(404).json({ message: "¡Producto no encontrado!" });
  }

  const productosActualizados = products.filter(p => p.id !== product.id);

  writeFileSync("./products.json", JSON.stringify(productosActualizados, null, 2), "utf-8");

  res.status(200).json({
    message: "¡Producto eliminado con éxito!",
    product
  });
});

export default router;
