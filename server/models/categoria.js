const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

let Usuario = require("./usuario");

let Schema = mongoose.Schema;

let categoriaSchema = new Schema({
  nombre: {
    type: String,
    required: [true, "El nombre es requerido"],
    unique: true,
  },
  descripcion: {
    type: String,
  },
  estado: {
    type: Boolean,
    default: true,
  },
  usuario: {
    type: String,
    ref: Usuario,
  },
});

categoriaSchema.plugin(uniqueValidator, {
  message: "{PATH} ya existe en la base de datos",
});

module.exports = mongoose.model("categoria", categoriaSchema);
