const express = require("express");

const bcrypt = require("bcrypt");

const Usuario = require("../models/usuario");

var jwt = require("jsonwebtoken");

const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.CLIENT_ID);

const app = express();

app.post("/login", (req, res) => {
  let body = req.body;

  Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err,
      });
    }
    if (!usuarioDB) {
      return res.status(400).json({
        ok: false,
        err: {
          message: "(Usuario) o contraseña incorrectos",
        },
      });
    }

    if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
      return res.status(400).json({
        ok: false,
        err: {
          message: "Usuario o (contraseña) incorrectos",
        },
      });
    }

    let token = jwt.sign({ usuario: usuarioDB }, process.env.SEED, {
      expiresIn: process.env.CADUCIDAD_TOKEN,
    });
    res.json({
      ok: true,
      usuario: usuarioDB,
      token: token,
    });
  });
});

// Configuraciones de google
async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
    // Or, if multiple clients access the backend:
    //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });

  const payload = ticket.getPayload();
  return {
    nombre: payload.name,
    email: payload.email,
    img: payload.picture,
    google: true,
  };
}

app.post("/google", async (req, res) => {
  let token = req.body.idtoken;
  if (!token) {
    return res.status(500).json({
      ok: false,
      err: { message: "El token no es valido" },
    });
  }
  let googleUser = {};
  try {
    googleUser = await verify(token);
  } catch (err) {
    return res.status(403).json({
      ok: false,
      err: {
        message: "Token invalido, intenta nuevamente por favor.",
      },
    });
  }

  Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err,
      });
    }

    if (usuarioDB) {
      if (usuarioDB.google === false) {
        return res.status(500).json({
          ok: false,
          err: {
            message: "Debe de usar su autentificacion normal",
          },
        });
      } else {
        let token = jwt.sign({ usuario: usuarioDB }, process.env.SEED, {
          expiresIn: process.env.CADUCIDAD_TOKEN,
        });
        res.json({
          ok: true,
          usuario: usuarioDB,
          token: token,
        });
      }
    } else {
      //si el usuario no existe en nuestra base de datos
      let usuario = new Usuario();

      usuario.nombre = googleUser.nombre;
      usuario.email = googleUser.email;
      usuario.img = googleUser.img;
      usuario.google = false;
      usuario.password = ":)";

      usuario.save((err, usuarioDB) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            err,
          });
        }

        let token = jwt.sign({ usuario: usuarioDB }, process.env.SEED, {
          expiresIn: process.env.CADUCIDAD_TOKEN,
        });

        res.json({
          ok: true,
          usuario: usuarioDB,
          token: token,
        });
      });
    }
  });
});

module.exports = app;
