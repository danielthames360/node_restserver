const express = require("express");
const fileUpload = require("express-fileupload");

const app = express();
const fs = require("fs");
const path = require("path");

app.use(fileUpload({ useTempFiles: true }));

const Usuario = require("../models/usuario");
const Producto = require("../models/producto");

app.put("/upload/:tipo/:id", (req, res) => {
  let tipo = req.params.tipo;
  let id = req.params.id;

  if (!req.files) {
    return res.status(400).json({
      ok: false,
      err: {
        message: "No se ha seleccionado ningun archivo",
      },
    });
  }

  //Valida tipo
  let tiposValidos = ["producto", "usuario"];
  if (tiposValidos.indexOf(tipo) < 0) {
    return res.status(400).json({
      ok: false,
      err: {
        message: "Los tipos permitidas son " + tiposValidos.join(","),
        tipo,
      },
    });
  }

  let archivo = req.files.archivo;
  let nombreCortado = archivo.name.split(".");
  let extension = nombreCortado[nombreCortado.length - 1];

  // Extensiones permitidas
  let extensionesValidas = ["png", "jpg", "gif", "jpeg"];

  if (extensionesValidas.indexOf(extension) < 0) {
    return res.status(400).json({
      ok: false,
      err: {
        message:
          "Las extensiones permitidas son " + extensionesValidas.join(","),
        extension,
      },
    });
  }

  //cambiar nombre al archivo
  let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

  let uploadPath = `uploads/${tipo}/${nombreArchivo}`;

  // Use the mv() method to place the file somewhere on your server
  archivo.mv(uploadPath, (err) => {
    if (err) return res.status(500).json({ ok: false, err });

    //Aqui la imagen ya se cargo
    if (tipo === "usuario") {
      imagenUsuario(id, res, nombreArchivo);
    } else {
      imagenProducto(id, res , nombreArchivo);
    }
    // res.json({ ok: true, message: "Imagen subida correctamente!" });
  });
});

function imagenUsuario(id, res, nombreArchivo) {
  Usuario.findById(id, (err, usuarioDB) => {
    if (err) {
      borrarArchivo(nombreArchivo, "usuario");
      return res.status(500).json({
        ok: false,
        err,
      });
    }

    if (!usuarioDB) {
      borrarArchivo(nombreArchivo, "usuario");
      return res.status(400).json({
        ok: false,
        err: {
          message: "Usuario no existe",
        },
      });
    }
    borrarArchivo(usuarioDB.img, "usuario");
    usuarioDB.img = nombreArchivo;
    usuarioDB.save((err, usuarioGuardado) => {
      res.json({
        ok: true,
        usuario: usuarioGuardado,
        img: nombreArchivo,
      });
    });
  });
}

function imagenProducto(id, res, nombreArchivo) {
  Producto.findById(id, (err, productoDB) => {
    if (err) {
      borrarArchivo(nombreArchivo, "producto");
      return res.status(500).json({
        ok: false,
        err,
      });
    }

    if (!productoDB) {
      borrarArchivo(nombreArchivo, "producto");
      return res.status(400).json({
        ok: false,
        err: {
          message: "Producto no existe",
        },
      });
    }
    borrarArchivo(productoDB.img, "producto");
    productoDB.img = nombreArchivo;
    productoDB.save((err, productoGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err: {
            err,
            message: "Producto no existe",
          },
        });
      }
      res.json({
        ok: true,
        producto: productoGuardado,
        img: nombreArchivo,
      });
    });
  });
}

function borrarArchivo(nombreImagen, tipo) {
  let pathImagen = path.resolve(
    __dirname,
    `../../uploads/${tipo}/${nombreImagen}`
  );
  if (fs.existsSync(pathImagen)) {
    fs.unlinkSync(pathImagen);
  }
}

module.exports = app;
