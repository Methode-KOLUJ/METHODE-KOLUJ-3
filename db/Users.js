const { readDB, writeDB } = require("./db");

function addUser(username) {
  const db = readDB();

  // Vérifier si l'utilisateur existe déjà
  if (db.users.includes(username)) {
    return false; // L'utilisateur existe déjà
  }

  // Ajouter l'utilisateur à la base de données
  db.users.push(username);
  writeDB(db);
  return true; // Utilisateur ajouté avec succès
}

module.exports = { addUser };
