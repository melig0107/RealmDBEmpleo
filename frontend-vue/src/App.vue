<template>
  <div>
    <header>
      <h1>OCC – Agencia de Empleos</h1>
      <select v-model="coleccion" @change="cargarDatos">
        <option disabled value="">Elige colección…</option>
        <option v-for="(campos, col) in esquemas" :key="col">{{ col }}</option>
      </select>
    </header>

    <section v-if="coleccion">
      <h2>{{ modoEdicion ? 'Editar' : 'Nuevo' }} {{ coleccion }}</h2>
      <form @submit.prevent="modoEdicion ? confirmarEdicion() : guardar()">
        <input
          v-for="campo in esquemas[coleccion]"
          :key="campo"
          v-model="formulario[campo]"
          :placeholder="campo"
          :disabled="modoEdicion && campo === 'id'"
          :type="['edad','salario'].includes(campo) ? 'number' : 'text'"
          required
        />
        <button type="submit">{{ modoEdicion ? 'Confirmar' : 'Guardar' }}</button>
        <button type="button" v-if="modoEdicion" @click="cancelar">Cancelar</button>
      </form>
    </section>

    <section v-if="coleccion">
      <h2>Lista de {{ coleccion }}s</h2>
      <table>
        <thead>
          <tr>
            <th v-for="campo in esquemas[coleccion]" :key="campo">{{ campo }}</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="doc in datos" :key="doc.id">
            <td v-for="campo in esquemas[coleccion]" :key="campo">{{ doc[campo] }}</td>
            <td>
              <a @click="editar(doc)">Editar</a> |
              <a @click="eliminar(doc.id)">Eliminar</a>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const coleccion = ref('')
const esquemas = {
  Candidato: ["id", "nombre", "edad", "profesion", "email"],
  Vacante: ["id", "puesto", "salario", "descripcion", "empresa"],
  Empresa: ["id", "nombre", "direccion", "telefono", "email"],
  Administrador: ["id", "nombre", "usuario", "contraseña", "email"],
  ProcesoSeleccion: ["id", "idCandidato", "idVacante", "estado", "fecha"]
}
const formulario = reactive({})
const datos = ref([])
const modoEdicion = ref(false)
const idEditando = ref(null)

const cargarDatos = async () => {
  if (!coleccion.value) return
  const res = await fetch(`http://localhost:3000/api/${coleccion.value}`)
  datos.value = await res.json()
  resetFormulario()
}

const resetFormulario = () => {
  esquemas[coleccion.value].forEach(c => formulario[c] = '')
}

const guardar = async () => {
  await fetch(`http://localhost:3000/api/${coleccion.value}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formulario)
  })
  cargarDatos()
}

const editar = (doc) => {
  modoEdicion.value = true
  idEditando.value = doc.id
  esquemas[coleccion.value].forEach(c => formulario[c] = doc[c])
}

const confirmarEdicion = async () => {
  await fetch(`http://localhost:3000/api/${coleccion.value}/${idEditando.value}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formulario)
  })
  modoEdicion.value = false
  idEditando.value = null
  cargarDatos()
}

const eliminar = async (id) => {
  if (!confirm('¿Eliminar registro?')) return
  await fetch(`http://localhost:3000/api/${coleccion.value}/${id}`, { method: 'DELETE' })
  cargarDatos()
}

const cancelar = () => {
  modoEdicion.value = false
  idEditando.value = null
  resetFormulario()
}
</script>