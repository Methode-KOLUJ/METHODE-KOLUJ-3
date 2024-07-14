const fs = require("fs");
const path = require("path");

// Chemin vers le fichier Lucasdb.json à la racine du projet
const dbFile = path.resolve(__dirname, "../Lucasdb.json");

// Lire la base de données
function readDB() {
  try {
    const data = fs.readFileSync(dbFile, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Erreur lors de la lecture de la base de données:", error);
    return { users: [], messages: [] }; // Retourne un objet vide en cas d'erreur
  }
}

// Écrire dans la base de données
function writeDB(data) {
  try {
    fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Erreur lors de l'écriture dans la base de données:", error);
  }
}

module.exports = {
  readDB,
  writeDB,
};
