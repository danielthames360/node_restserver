/**
 * Puerto
 */

process.env.PORT = process.env.PORT || 3000;

/**
 * Entrono
 */

process.env.NODE_ENV = process.env.NODE_ENV || "prod";

/**
 * BASE DE DATOS
 */

let urlDB;

if (process.env.NODE_ENV === "dev") {
  urlDB = "mongodb://localhost:27017/cafe";
} else {
  urlDB =
    "mongodb+srv://admin:tnq7Mq2ttj7BRGAY@cluster0.hscdt.mongodb.net/cafe?retryWrites=true&w=majority";
}
process.env.URLDB = urlDB;
