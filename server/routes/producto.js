const express = require("express");

const {
  verificaToken,
  verificaAdmin_Role,
} = require("../middlewares/autenticacion");
let app = express();
let Producto = require("../models/producto");

/**
 * Obtener Productos
 */
app.get("/producto", (req, res) => {
  //trae los productos
  // populate: usuario categoria
  //paginado
  let desde = Number(req.query.desde) || 0;
  let hasta = Number(req.query.hasta) || 5;

  Producto.find({})
    .skip(desde)
    .limit(hasta)
    .populate("categoria", "nombre")
    .populate("usuario", "nombre")
    .exec((err, productoDB) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }

      res.json({
        ok: false,
        productos: productoDB,
      });
    });
});

/**
 * Obtener producto por id
 */
app.get("/producto/:id", (req, res) => {
  // populate: usuario categoria
  let id = req.params.id;

  Producto.find({ _id: id })
    .populate("categoria", "nombre")
    .populate("usuario", "nombre")
    .exec((err, productoDB) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err: {
            message: "Producto no encontrado",
          },
        });
      }

      res.json({
        ok: false,
        productos: productoDB,
      });
    });
});

/**
 * Buscar producto por nombre
 */
app.get("/producto/buscar/:termino", (req, res) => {
  // populate: usuario categoria
  let termino = req.params.termino;
  let regex = new RegExp(termino, "i");
  Producto.find({ nombre: regex })
    .populate("categoria", "nombre")
    .populate("usuario", "nombre")
    .exec((err, productoDB) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err: {
            message: "Producto no encontrado",
          },
        });
      }

      res.json({
        ok: false,
        productos: productoDB,
      });
    });
});

/**
 * Crear un nuevo producto
 */
app.post("/producto", verificaToken, (req, res) => {
  //grabar el usuario, grabar una categoria del listado
  let body = req.body;

  let producto = new Producto({
    nombre: body.nombre,
    precioUni: body.precioUni,
    descripcion: body.descripcion,
    categoria: body.idCategoria,
    usuario: req.usuario._id,
  });

  producto.save((err, productoDB) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }

    res.json({
      ok: false,
      producto: productoDB,
    });
  });
});

/**
 * Actualizar el producto
 */
app.put("/producto/:id", [verificaToken, verificaAdmin_Role], (req, res) => {
  let id = req.params.id;
  let body = req.body;

  Producto.findByIdAndUpdate(
    id,
    body,
    { new: true, runValidators: true },
    (err, productoDB) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }

      if (!productoDB) {
        return res.status(400).json({
          ok: false,
          err: { message: "El producto que intentas busar no se encontro" },
        });
      }

      res.json({
        ok: false,
        producto: productoDB,
      });
    }
  );
});

/**
 * Deshabilitar el producto
 */

app.delete("/producto/:id", [verificaToken, verificaAdmin_Role], (req, res) => {
  let id = req.params.id;

  Producto.findByIdAndUpdate(
    id,
    { disponible: false },
    { new: true, runValidators: true },
    (err, productoDB) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }

      if (!productoDB) {
        return res.status(400).json({
          ok: false,
          err: { message: "El producto que intentas busar no se encontro" },
        });
      }

      res.json({
        ok: false,
        producto: productoDB,
      });
    }
  );
});

module.exports = app;
