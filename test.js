import ContenedorSQL from "./src/contenedores/ContenedorSQL.js";
import config from "./src/config.js";

const prodApi = new ContenedorSQL(config.mariaDb, "productos");

const articulos = [
  { title: "Leche", price: 23.6, thumbnail: "foto 1" },
  { title: "Harina", price: 12.8, thumbnail: "foto 2" },
  { title: "DDL", price: 32.3, thumbnail: "foto 3" },
  { title: "Fideos", price: 42.7, thumbnail: "foto 4" },
  { title: "Crema", price: 67.9, thumbnail: "foto 5" },
];

(async () => {
  console.log("### Cargando articulos en tabla tabla");
  const savedProds = await prodApi.guardar(articulos);
  console.log("savedProds", savedProds);
  console.log("### Listando productos");
  let allProds = await prodApi.listarAll();
  console.log("allProds", allProds);
  console.log("### Obteniendo producto 1");
  const oneProd = await prodApi.listar(1);
  console.log("oneProd", oneProd);
  console.log("### Borro producto 1");
  await prodApi.borrar(1);
  const producto = {
    title: "Dulce de leche",
    thumbnail: "foto 6",
  };
  console.log("### Actualizo producto 3");
  await prodApi.actualizar(producto, 3);
  console.log("### Listando productos nuevamente");
  allProds = await prodApi.listarAll();
  console.log("allProds", allProds);
  console.log("### Borrando tabla");
  await prodApi.borrarAll();
  console.log("### Desconectando");
  await prodApi.desconectar();
})();
