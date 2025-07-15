// === dbagencia.js ===
import Realm from "realm";

export const coleccionesPermitidas = [
  "Candidato",
  "Vacante",
  "Empresa",
  "Administrador",
  "ProcesoSeleccion",
];

const CandidatoSchema = {
  name: "Candidato",
  primaryKey: "id",
  properties: {
    id: "string",
    nombre: "string",
    edad: "int",
    profesion: "string",
    email: "string",
  },
};

const VacanteSchema = {
  name: "Vacante",
  primaryKey: "id",
  properties: {
    id: "string",
    puesto: "string",
    salario: "double",
    descripcion: "string",
    empresa: "string",
  },
};

const EmpresaSchema = {
  name: "Empresa",
  primaryKey: "id",
  properties: {
    id: "string",
    nombre: "string",
    direccion: "string",
    telefono: "string",
    email: "string",
  },
};

const AdministradorSchema = {
  name: "Administrador",
  primaryKey: "id",
  properties: {
    id: "string",
    nombre: "string",
    usuario: "string",
    contraseña: "string",
    email: "string",
  },
};

const ProcesoSeleccionSchema = {
  name: "ProcesoSeleccion",
  primaryKey: "id",
  properties: {
    id: "string",
    idCandidato: "string",
    idVacante: "string",
    estado: "string",
    fecha: "string",
  },
};

let realm;
export async function abrirRealm() {
  if (realm) return realm;
  realm = await Realm.open({
    path: "occ.realm",
    schema: [
      CandidatoSchema,
      VacanteSchema,
      EmpresaSchema,
      AdministradorSchema,
      ProcesoSeleccionSchema,
    ],
  });
  return realm;
}

export async function listarTodo(col) {
  await abrirRealm();
  return realm.objects(col).toJSON();
}

export async function crearDoc(col, data) {
  await abrirRealm();
  realm.write(() => {
    realm.create(col, data);
  });
}

export async function actualizarDoc(col, id, data) {
  await abrirRealm();
  realm.write(() => {
    const obj = realm.objectForPrimaryKey(col, id);
    if (!obj) throw new Error("No existe");
    Object.assign(obj, data);
  });
}

export async function borrarDoc(col, id) {
  await abrirRealm();
  realm.write(() => {
    const obj = realm.objectForPrimaryKey(col, id);
    if (!obj) throw new Error("No existe");
    realm.delete(obj);
  });
}
