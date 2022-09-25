import express from "express";
import { Server as HttpServer } from "http";
import { Server as Socket } from "socket.io";
import ContenedorSQL from "./contenedores/ContenedorSQL.js";
import config from "./config.js";
import * as fakeProdApi from "./api/fakeProds.js";
import MongoDbContainer from "./contenedores/ContenedorMongoDB.js";
import * as msgsConfig from "./config/msgs.js";
//--------------------------------------------
// instancio servidor, socket y api

const app = express();
const httpServer = new HttpServer(app);
const io = new Socket(httpServer);

const productosApi = new ContenedorSQL(config.mariaDb, "productos");
const mensajesApi = new MongoDbContainer(msgsConfig.msgsCollection, msgsConfig.msgsSchema);

//--------------------------------------------
// configuro el socket

io.on("connection", async (socket) => {
  // apenas se genera la conexión tengo que cargar mensajes y productos
  const productos = await productosApi.listarAll();
  io.sockets.emit("productos", productos);
  const msgData = await mensajesApi.getAll();
  const mensajes = msgData.map((msg) => {
    const dateTime = new Date(parseInt(msg.id.substring(0, 8), 16) * 1000);
    msg = { ...msg, dateTime };
    return msg;
  });
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
    await mensajesApi.createNew(data);
    const msgData = await mensajesApi.getAll();
    const mensajes = msgData.map((msg) => {
      const dateTime = new Date(parseInt(msg.id.substring(0, 8), 16) * 1000);
      msg = { ...msg, dateTime };
      return msg;
    });
    io.sockets.emit("mensajes", mensajes);
  });
});

//--------------------------------------------
// agrego middlewares

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// agrego una ruta get

app.get("/api/productos-test", (req, res) => {
  const fakeProds = fakeProdApi.generateMany(5);
  res.send(fakeProds);
});

//--------------------------------------------
// inicio el servidor

const PORT = 8080;
const connectedServer = httpServer.listen(PORT, () => {
  console.log(`Servidor http escuchando en el puerto ${connectedServer.address().port}`);
});
connectedServer.on("error", (error) => console.log(`Error en servidor ${error}`));
