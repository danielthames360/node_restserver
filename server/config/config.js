/**
 * Puerto
 */

process.env.PORT = process.env.PORT || 3000;

/**
 * Entrono
 */

process.env.NODE_ENV = process.env.NODE_ENV || "dev";

/**
 * Vencimiento del token
 */
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;

/**
 * Seed o Semilla de autentificacion
 */
process.env.SEED = process.env.SEED  || 'este-es-el-seed-desarrollo';

/**
 * BASE DE DATOS
 */

let urlDB;

if (process.env.NODE_ENV === "dev") {
  urlDB = "mongodb://localhost:27017/cafe";
} else {
  urlDB = process.env.MONGO_URI;
}
process.env.URLDB = urlDB;


/**
 * Google Cliente ID
 * 
 */

process.env.CLIENT_ID = process.env.CLIENT_ID || '579919783883-uqan7hr70hsv8v85dus5mfddvfs6cbge.apps.googleusercontent.com';