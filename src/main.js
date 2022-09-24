import express from "express";

import { Server as HttpServer } from "http";
import { Server as Socket } from "socket.io";

import ContenedorSQL from "./contenedores/ContenedorSQL.js";

import config from "./config.js";

//--------------------------------------------
// instancio servidor, socket y api

const app = express();
const httpServer = new HttpServer(app);
const io = new Socket(httpServer);

const productosApi = new ContenedorSQL(config.mariaDb, "productos");
const mensajesApi = new ContenedorSQL(config.sqlite3, "mensajes");

//--------------------------------------------
// configuro el socket

io.on("connection", async (socket) => {
  // apenas se genera la conexión tengo que cargar mensajes y productos
  const productos = await productosApi.listarAll();
  io.sockets.emit("productos", productos);
  const mensajes = await mensajesApi.listarAll();
  io.sockets.emit("mensajes", mensajes);

  console.log("Nueva conexion");
  // cuando llega un producto nuevo grabo, obtengo data, hago emit
  socket.on("newProduct", async (data) => {
    await productosApi.guardar(data);
    const productos = await productosApi.listarAll();
    io.sockets.emit("productos", productos);
  });

  // cuando llega un producto nuevo grabo, obtengo data, hago emit
  socket.on("newMessage", async (data) => {
    const message = { dateTime: new Date().toLocaleString("es-AR"), ...data };
    await mensajesApi.guardar(message);
    const mensajes = await mensajesApi.listarAll();
    io.sockets.emit("mensajes", mensajes);
  });
});

//--------------------------------------------
// agrego middlewares

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

//--------------------------------------------
// inicio el servidor

const PORT = 8080;
const connectedServer = httpServer.listen(PORT, () => {
  console.log(`Servidor http escuchando en el puerto ${connectedServer.address().port}`);
});
connectedServer.on("error", (error) => console.log(`Error en servidor ${error}`));
