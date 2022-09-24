const socket = io.connect();

//------------------------------------------------------------------------------------

const formAgregarProducto = document.getElementById("formAgregarProducto");
formAgregarProducto.addEventListener("submit", (e) => {
  e.preventDefault();
  //Armar objeto producto y emitir mensaje a evento update
  // Creo el objeto que voy a enviar por socket
  const title = document.getElementById("nombre").value;
  const price = parseFloat(document.getElementById("precio").value);
  const thumbnail = document.getElementById("foto").value;
  const product = { title, price, thumbnail };
  // envio por socket
  socket.emit("newProduct", product);
  // resetteo el formulario para que aparezca vacio
  formAgregarProducto.reset();
});

socket.on("productos", async (productos) => {
  //generar el html y colocarlo en el tag productos llamando al funcion makeHtmlTable
  // Corro makeHtmlTable para generar el html
  const html = await makeHtmlTable(productos);
  // pongo el html generado dentro del div productos
  document.getElementById("productos").innerHTML = html;
});

async function makeHtmlTable(productos) {
  return fetch("plantillas/tabla-productos.hbs")
    .then((respuesta) => respuesta.text())
    .then((plantilla) => {
      const template = Handlebars.compile(plantilla);
      const html = template({ productos });
      return html;
    });
}

//-------------------------------------------------------------------------------------

const inputUsername = document.getElementById("inputUsername");
const inputMensaje = document.getElementById("inputMensaje");
const btnEnviar = document.getElementById("btnEnviar");

const formPublicarMensaje = document.getElementById("formPublicarMensaje");
formPublicarMensaje.addEventListener("submit", (e) => {
  e.preventDefault();
  // creo el objeto y lo envio
  const message = {
    email: inputUsername.value,
    text: inputMensaje.value,
  };
  socket.emit("newMessage", message);
  //Armar el objeto de mensaje y luego emitir mensaje al evento nuevoMensaje con sockets
  formPublicarMensaje.reset();
  inputMensaje.focus();
});

socket.on("mensajes", async (mensajes) => {
  //generar el html y colocarlo en el tag productos llamando al funcion makeHtmlTable
  // en este caso cree otra funcion para hacer los mensajes con el formato que pide la consigna
  const html = await makeHtmlMessages(mensajes);
  // cargo ese html generado en el div mensajes
  document.getElementById("mensajes").innerHTML = html;
});

async function makeHtmlMessages(mensajes) {
  // es la misma funcion que htmlTables, solo que le cambio la plantilla
  return fetch("plantillas/mensajes.hbs")
    .then((respuesta) => respuesta.text())
    .then((plantilla) => {
      const template = Handlebars.compile(plantilla);
      const html = template({ mensajes });
      return html;
    });
}
inputUsername.addEventListener("input", () => {
  const hayEmail = inputUsername.value.length;
  const hayTexto = inputMensaje.value.length;
  inputMensaje.disabled = !hayEmail;
  btnEnviar.disabled = !hayEmail || !hayTexto;
});

inputMensaje.addEventListener("input", () => {
  const hayTexto = inputMensaje.value.length;
  btnEnviar.disabled = !hayTexto;
});
