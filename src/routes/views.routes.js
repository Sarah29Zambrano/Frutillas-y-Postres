import { Router } from "express";
import fs from "fs";

const router = Router();

router.get("/", (req, res) => {
  const products = JSON.parse(fs.readFileSync("./products.json", "utf-8"));
  res.render("home", { products });
});

router.get("/realtimeproducts", (req, res) => {
  res.render("realTimeProducts");
});

export default router;
