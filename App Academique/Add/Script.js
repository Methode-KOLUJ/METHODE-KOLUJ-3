document.getElementById("addUserBtn").addEventListener("click", () => {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (!username || !password) {
    document.getElementById("message").textContent =
      "Veuillez remplir tous les champs.";
    return;
  }

  // Envoyer les données au serveur
  fetch("/add-user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  })
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("message").textContent = data.message;
    })
    .catch((error) => {
      console.error("Erreur:", error);
      document.getElementById("message").textContent =
        "Une erreur s'est produite.";
    });
});
