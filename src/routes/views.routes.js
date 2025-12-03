import { Router } from "express";
import ProductModel from "../model/products.model.js";
import CartModel from "../model/carts.model.js";

const router = Router();

router.get("/products", async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const products = await ProductModel.paginate({}, { page, limit });

  const plainProducts = products.docs.map(p => p.toObject());

  res.render("products", {
    products: plainProducts,
    hasPrevPage: products.hasPrevPage,
    hasNextPage: products.hasNextPage,
    prevPage: products.prevPage,
    nextPage: products.nextPage,
    currentPage: products.page,
  });
});

router.get("/products/:pid", async (req, res) => {
  const product = await ProductModel.findOne({ id: Number(req.params.pid) });

  if (!product) {
    return res.status(404).send("Producto no encontrado");
  }

  res.render("productDetail", { product: product.toObject() });
});

router.get("/carts/:cid", async (req, res) => {
  const cart = await CartModel.findOne({ id: Number(req.params.cid) }).populate("products.product")

  if (!cart) return res.status(404).send("Carrito no encontrado");

  res.render("carts", { cart: cart.toObject() });
});

export default router;
