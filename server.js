const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
require("dotenv").config();

const { readDB, writeDB } = require("./db/db");
const { addUser } = require("./db/Users");

const app = express();
app.use(bodyParser.json());
const server = require("http").createServer(app);
const io = require("socket.io")(server);

let connectedUsers = new Set();

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, "App Academique")));
app.use(express.static(path.join(__dirname, "db/public")));

// Route principale
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "App Academique/index.html"));
});

// Route pour ajouter un utilisateur
// Route pour ajouter un utilisateur
app.post("/add-user", (req, res) => {
  const { username, password } = req.body;

  if (password !== process.env.ADMIN) {
    return res.status(403).json({ message: "Mot de passe incorrect !" });
  }

  if (addUser(username)) {
    return res
      .status(200)
      .json({ message: "Utilisateur ajouté avec succès !" });
  } else {
    return res.status(400).json({ message: "L'utilisateur existe déjà !" });
  }
});

// Gestion des connexions avec Socket.IO
io.on("connection", function (socket) {
  socket.on("newuser", function ({ username, password }) {
    const db = readDB();

    if (connectedUsers.has(username)) {
      socket.emit("username-taken", "Ce nom d'utilisateur est déjà connecté");
      return;
    }

    if (password !== process.env.MOT_DE_PASSE) {
      socket.emit("auth-error", "Mot de passe incorrect");
      return;
    }

    // Vérifier si l'utilisateur est déjà inscrit
    if (!db.users.includes(username)) {
      socket.emit("auth-error", "Vous n'êtes pas inscrit(e) !");
      return;
    }

    // Connexion réussie
    connectedUsers.add(username);
    socket.username = username;

    socket.emit("auth-success");
    socket.broadcast.emit(
      "update",
      `<p class="signal">${username} est actuellement connecté(e)</p>`
    );

    // Envoyer l'historique des messages
    socket.emit("load-messages", db.messages);
  });

  socket.on("exituser", function (username) {
    connectedUsers.delete(username);
    socket.broadcast.emit(
      "update",
      `<p class="signal">${username} s'est déconnecté(e)</p>`
    );
  });

  socket.on("disconnect", function () {
    if (socket.username) {
      connectedUsers.delete(socket.username);
    }
  });

  socket.on("chat", function (message) {
    const db = readDB();
    db.messages.push(message);
    writeDB(db);
    socket.broadcast.emit("chat", message);
  });

  socket.on("delete-message", function (messageId) {
    const db = readDB();
    const messageIndex = db.messages.findIndex((msg) => msg.id === messageId);

    if (
      messageIndex !== -1 &&
      db.messages[messageIndex].username === socket.username
    ) {
      db.messages.splice(messageIndex, 1);
      writeDB(db);
      io.emit("delete-message", messageId);
    }
  });

  socket.on("edit-message", function ({ messageId, newText }) {
    const db = readDB();
    const message = db.messages.find((msg) => msg.id === messageId);

    if (message && message.username === socket.username) {
      message.text = newText;
      writeDB(db);
      io.emit("edit-message", { messageId, newText });
    }
  });
});

// Vérification du mot de passe
app.post("/validate-password", (req, res) => {
  const { password } = req.body;

  if (password === process.env.MOT_DE_PASSE) {
    res.json({ valid: true });
  } else {
    res.json({ valid: false });
  }
});

// Démarrage du serveur
server.listen(5000, () => {
  console.log(`Le serveur marche au port 5000 !`);
});
