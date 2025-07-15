const coleccionSelect = document.getElementById("coleccionSelect");
const formSec = document.getElementById("formularioSection");
const tablaSec = document.getElementById("tablaSection");
const form = document.getElementById("docForm");
const guardarBtn = document.getElementById("guardarBtn");
const confirmarBtn = document.getElementById("confirmarBtn");
const cancelarBtn = document.getElementById("cancelarBtn");
let modoEdicion = false;
let idEditando = null;

const esquemas = {
  Candidato: ["id", "nombre", "edad", "profesion", "email"],
  Vacante: ["id", "puesto", "salario", "descripcion", "empresa"],
  Empresa: ["id", "nombre", "direccion", "telefono", "email"],
  Administrador: ["id", "nombre", "usuario", "contraseña", "email"],
  ProcesoSeleccion: ["id", "idCandidato", "idVacante", "estado", "fecha"],
};

coleccionSelect.addEventListener("change", () => {
  const col = coleccionSelect.value;
  if (!col) return;
  construirFormulario(col);
  cargarTabla(col);
  formSec.classList.remove("oculto");
  tablaSec.classList.remove("oculto");
  document.getElementById("formTitulo").textContent = `Nuevo ${col}`;
  document.getElementById("tablaTitulo").textContent = `Lista de ${col}s`;
  form.reset();
});

function construirFormulario(col) {
  form.innerHTML = "";
  esquemas[col].forEach((campo) => {
    const input = document.createElement("input");
    input.placeholder = campo;
    input.name = campo;
    input.required = true;
    if (["edad", "salario"].includes(campo)) input.type = "number";
    if (modoEdicion && campo === "id") input.disabled = true; // ← desactiva ID al editar
    form.appendChild(input);
  });
}

function datosFormulario() {
  const data = {};
  [...form.elements].forEach((el) => {
    if (!el.disabled) {
      data[el.name] = el.type === "number" ? Number(el.value) : el.value.trim();
    }
  });
  return data;
}

guardarBtn.addEventListener("click", async () => {
  const col = coleccionSelect.value;
  const datos = datosFormulario();
  if (modoEdicion) {
    confirmarBtn.classList.remove("oculto");
    cancelarBtn.classList.remove("oculto");
    guardarBtn.classList.add("oculto");
  } else {
    await fetch(`/api/${col}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
    form.reset();
    cargarTabla(col);
  }
});

confirmarBtn.addEventListener("click", async () => {
  const col = coleccionSelect.value;
  const datos = datosFormulario();
  console.log("Confirmando edición:", idEditando, datos);
  await fetch(`/api/${col}/${idEditando}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  modoEdicion = false;
  idEditando = null;
  form.reset();
  resetBotones();
  [...form.elements].forEach(el => el.disabled = false); // reactiva todos
  cargarTabla(col);
});

cancelarBtn.addEventListener("click", () => {
  modoEdicion = false;
  idEditando = null;
  form.reset();
  resetBotones();
  [...form.elements].forEach(el => el.disabled = false); // reactiva todos
});

function resetBotones() {
  confirmarBtn.classList.add("oculto");
  cancelarBtn.classList.add("oculto");
  guardarBtn.classList.remove("oculto");
}

async function cargarTabla(col) {
  const res = await fetch(`/api/${col}`);
  const lista = await res.json();
  const tabla = document.getElementById("resultadoTabla");
  tabla.innerHTML = "";

  const thead = document.createElement("thead");
  const trh = document.createElement("tr");
  esquemas[col].forEach((c) => {
    const th = document.createElement("th");
    th.textContent = c;
    trh.appendChild(th);
  });
  const thAcc = document.createElement("th");
  thAcc.textContent = "Acciones";
  trh.appendChild(thAcc);
  thead.appendChild(trh);
  tabla.appendChild(thead);

  const tbody = document.createElement("tbody");
  lista.forEach((doc) => {
    const tr = document.createElement("tr");
    esquemas[col].forEach((c) => {
      const td = document.createElement("td");
      td.textContent = doc[c];
      tr.appendChild(td);
    });
    const tdAcc = document.createElement("td");
    tdAcc.innerHTML = `
      <a class="btn" onclick="editar('${col}','${doc.id}')">Editar</a> |
      <a class="btn" onclick="eliminar('${col}','${doc.id}')">Eliminar</a>`;
    tr.appendChild(tdAcc);
    tbody.appendChild(tr);
  });
  tabla.appendChild(tbody);
}

window.editar = async (col, id) => {
  const res = await fetch(`/api/${col}`);
  const lista = await res.json();
  const doc = lista.find((d) => d.id === id);
  if (!doc) return;
  modoEdicion = true;
  idEditando = id;
  construirFormulario(col); // ← reconstruye inputs con ID desactivado
  [...form.elements].forEach((el) => {
    el.value = doc[el.name];
  });
  guardarBtn.click();
};

window.eliminar = async (col, id) => {
  if (!confirm("¿Eliminar registro?")) return;
  await fetch(`/api/${col}/${id}`, { method: "DELETE" });
  cargarTabla(col);
};