import express from "express";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";
import handlebars from "express-handlebars";
import path from "path";
import ProductManager from "./managers/ProductManager.js";

import productsRouter from "./routes/products.routes.js";
import cartsRouter from "./routes/carts.routes.js";
import viewsRouter from "./routes/views.routes.js";

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

mongoose.connect('mongodb+srv://sarahzambrano29_db_user:Nx5jOEzXlXLaMRcn@cluster0.2qzmdko.mongodb.net/productos_carritos').then(() => {
  console.log("Conectado")
}).catch(e => console.log(e))

server.listen(8080, () => {
  console.log("Servidor corriendo en el puerto 8080");
});
