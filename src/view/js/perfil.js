document.addEventListener("DOMContentLoaded", async () => {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    showNotification("Usuário não está logado.", "error");
    setTimeout(() => {
      window.location.href = "cadastro_login.html";
    }, 2000);
    return;
  }

  const profileForm = document.getElementById("profile-form");
  const fileInput = document.getElementById("profileImage");
  const avatarContainer = document.getElementById("avatar-container");
  const editButton = document.getElementById("editProfile");
  const saveButton = document.getElementById("saveProfile");
  const cancelButton = document.getElementById("cancelEdit");
  const editFields = document.querySelectorAll(".edit-fields");
  const progressBar = document.getElementById("uploadProgress");
  const progressFill = document.querySelector(".progress-fill");

  let userData = {
    name: "",
    email: "",
    bio: "",
    profileUrl: "",
  };

  function renderProfileImage(url) {
    avatarContainer.innerHTML = "";
    const img = document.createElement("img");
    img.src = url;
    img.alt = "Foto de perfil";
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "cover";
    img.classList.add("foto-perfil");
    avatarContainer.appendChild(img);
  }

  try {
    const response = await fetch(`http://localhost:3000/users/${userId}`);
    if (!response.ok) throw new Error("Erro ao buscar usuário");

    userData = await response.json();

     // Update display elements immediately
     document.getElementById("user-name-display").textContent =
     userData.name || "Usuário";
   document.getElementById("user-email-display").textContent =
     userData.email || "email@exemplo.com";

     document.getElementById("name").value = userData.name || "";
     document.getElementById("email").value = userData.email || "";

    if (userData.profileUrl) {
      const fullUrl = userData.profileUrl.startsWith("http")
        ? userData.profileUrl
        : `http://localhost:3000${userData.profileUrl}`;
      renderProfileImage(fullUrl);
    }
  } catch (error) {
    console.error("Erro ao carregar dados do usuário:", error);
    showNotification("Erro ao carregar perfil do usuário.", "error");
  }

  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        renderProfileImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  });

  editButton.addEventListener("click", () => {
    editFields.forEach((field) => (field.style.display = "block"));
    editButton.style.display = "none";
    saveButton.style.display = "block";
    cancelButton.style.display = "block";
  });

  cancelButton.addEventListener("click", () => {
    editFields.forEach((field) => (field.style.display = "none"));
    editButton.style.display = "block";
    saveButton.style.display = "none";
    cancelButton.style.display = "none";

    document.getElementById("name").value = userData.name || "";
    document.getElementById("email").value = userData.email || "";
    document.getElementById("password").value = "";

    if (userData.profileUrl) {
      const fullUrl = userData.profileUrl.startsWith("http")
        ? userData.profileUrl
        : `http://localhost:3000${userData.profileUrl}`;
      renderProfileImage(fullUrl);
    } else {
      avatarContainer.innerHTML = "<i class='fas fa-user fa-3x text-white'></i>";
    }

    fileInput.value = "";
  });

  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      progressBar.style.display = "block";
      progressFill.style.width = "0%";

      // Create FormData
      const formData = new FormData();
      formData.append("name", document.getElementById("name").value);
      formData.append("email", document.getElementById("email").value);

      // Only append password if it's not empty
      const password = document.getElementById("password").value;
      if (password) {
        formData.append("password", password);
      } else {
        // If password is not provided, use existing password
        formData.append("password", userData.password);
      }

      const file = fileInput.files[0];
      if (file) {
        formData.append("profileImage", file);
      }

       // Simulate upload progress
       let progress = 0;
       const progressInterval = setInterval(() => {
         progress += 10;
         if (progress <= 90) {
           progressFill.style.width = `${progress}%`;
         }
       }, 200);

      const response = await fetch(`http://localhost:3000/users/${userId}`, {
        method: "PUT",
        body: formData,
      });
      clearInterval(progressInterval);
      progressFill.style.width = "100%";

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao atualizar perfil");
      }

      // Update user data with response
      const updatedUser = await response.json();
      userData = updatedUser;
      localStorage.setItem("profileUrl", userData.profileUrl);

      // Update display
      document.getElementById("user-name-display").textContent = userData.name;
      document.getElementById("user-email-display").textContent =
        userData.email;

      // Exit edit mode
      editFields.forEach((field) => (field.style.display = "none"));
      editButton.style.display = "block";
      saveButton.style.display = "none";
      cancelButton.style.display = "none";

      showNotification("Perfil atualizado com sucesso!", "success");

      // Hide progress after 1 second
      setTimeout(() => {
        progressBar.style.display = "none";
      }, 1000);
      window.location.reload();
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      showNotification(error.message || "Erro ao atualizar perfil.", "error");
      progressBar.style.display = "none";
    }
  });

  // Account deletion
  document
    .getElementById("btn-excluir")
    ?.addEventListener("click", async () => {
      if (
        confirm(
          "Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita."
        )
      ) {
        try {
          const response = await fetch(
            `http://localhost:3000/users/${userId}`,
            {
              method: "DELETE",
            }
          );

          if (!response.ok) {
            throw new Error("Erro ao excluir conta");
          }

          showNotification("Conta excluída com sucesso!", "success");

          setTimeout(() => {
            localStorage.removeItem("userId");
            window.location.href = "cadastro_login.html";
          }, 2000);
        } catch (error) {
          console.error("Erro ao excluir conta:", error);
          showNotification("Erro ao excluir conta.", "error");
        }
      }
    });

  // Logout
  document.getElementById("btn-sair")?.addEventListener("click", () => {
    if (confirm("Tem certeza que deseja sair?")) {
      localStorage.removeItem("userId");
      window.location.href = "cadastro_login.html";
    }
  });

  // Helper function for notifications
  function showNotification(message, type) {
    const notification = document.getElementById("notification");
    const notificationText = document.querySelector(".notification-text");

    notification.style.display = "block";
    notification.className = `alert ${
      type === "error" ? "alert-danger" : "alert-success"
    } mt-3`;
    notificationText.textContent = message;

    setTimeout(() => {
      notification.style.display = "none";
    }, 5000);
  }
});