 // === server.js ===
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import {
  abrirRealm,
  coleccionesPermitidas,
  listarTodo,
  crearDoc,
  actualizarDoc,
  borrarDoc,
} from "./dbagencia.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.param("col", (req, res, next, col) => {
  if (!coleccionesPermitidas.includes(col)) {
    return res.status(404).json({ error: "Colección no válida" });
  }
  req.col = col;
  next();
});

app
  .route("/api/:col")
  .get(async (req, res) => res.json(await listarTodo(req.col)))
  .post(async (req, res) => {
    try {
      await crearDoc(req.col, req.body);
      res.status(201).json({ ok: true });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

app
  .route("/api/:col/:id")
  .put(async (req, res) => {
    try {
      await actualizarDoc(req.col, req.params.id, req.body);
      res.json({ ok: true });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  })
  .delete(async (req, res) => {
    try {
      await borrarDoc(req.col, req.params.id);
      res.json({ ok: true });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

const PORT = process.env.PORT || 3000;

abrirRealm().then(() =>
  app.listen(PORT, () =>
    console.log(`🚀 Servidor iniciado en http://localhost:${PORT}`)
  )
);