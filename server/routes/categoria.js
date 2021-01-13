const express = require("express");

let {
  verificaToken,
  verificaAdmin_Role,
} = require("../middlewares/autenticacion");

let app = express();

let Categoria = require("../models/categoria");

/**
 * Obetener todas las categorias
 */

app.get("/categoria", (req, res) => {
  Categoria.find({})
    .sort("nombre")
    .populate("usuario", "nombre")
    .exec((err, categoriaDB) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }

      res.json({
        ok: true,
        categorias: categoriaDB,
      });
    });
});

/**
 * Obtener una categoria
 */
app.get("/categoria/:id", (req, res) => {
  const id = req.params.id;
  Categoria.findById(id, (err, categoriaDB) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err: {
          message: "no se encontro la categoria que intentas buscar;",
        },
      });
    }
    res.json({
      ok: true,
      categorias: categoriaDB,
    });
  });
});
/**
 * crear nueva categoria
 */

app.post("/categoria", verificaToken, (req, res) => {
  let body = req.body;

  let categoria = new Categoria({
    nombre: body.nombre,
    descripcion: body.descripcion,
    usuario: req.usuario._id,
  });
  categoria.save((err, categoriaDB) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }
    res.json({
      ok: true,
      categoriaDB,
    });
  });
});

/**
 * Actualizar categoria
 */

app.put("/categoria/:id", [verificaToken, verificaAdmin_Role], (req, res) => {
  let id = req.params.id;
  let body = req.body;

  Categoria.findByIdAndUpdate(
    id,
    body,
    { new: true, runValidators: true },
    (err, categoriaDB) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }

      res.json({
        ok: true,
        categoriaDB,
      });
    }
  );
});

/**
 * borrar categoria solo siendo administrador
 */

app.delete(
  "/categoria/:id",
  [verificaToken, verificaAdmin_Role],
  (req, res) => {
    let id = req.params.id;

    Categoria.findByIdAndUpdate(
      id,
      { estado: false },
      { new: true, runValidators: true },
      (err, categoriaDB) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            err: {
              message: "No se encontro la categoria",
            },
          });
        }

        res.json({
          ok: true,
          categoriaDB,
        });
      }
    );
  }
);

module.exports = app;
