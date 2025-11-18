import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import handlebars from "express-handlebars";
import path from "path";
import ProductManager from "./managers/ProductManager.js";

import productsRouter from "./routes/products.routes.js";
import cartsRouter from "./routes/carts.routes.js";
import viewsRouter from "./routes/views.routes.js";
import fs from "fs";

const app = express();
const server = createServer(app);
const io = new Server(server);

export const productManager = new ProductManager("./products.json");

// Handlebars
app.engine("handlebars", handlebars.engine())
app.set('views', path.join(process.cwd(),'src','views'))
app.set('view engine', 'handlebars')

// Middlewares
app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'src','public'))) 

// Rutas
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", viewsRouter);

io.on("connection", socket => {
  console.log("Cliente conectado via WebSocket");

  socket.emit("updateProducts", productManager.getProducts());
});

export const emitUpdatedProducts = () => {
  io.emit("updateProducts", productManager.getProducts());
};

server.listen(8080, () => {
  console.log("Servidor corriendo en el puerto 8080");
});
