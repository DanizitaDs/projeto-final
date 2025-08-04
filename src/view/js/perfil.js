document.addEventListener("DOMContentLoaded", async () => {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    alertShow("Usuário não está logado.", "error");
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

    document.getElementById("user-name-display").textContent = userData.name || "Usuário";
    document.getElementById("user-email-display").textContent = userData.email || "email@exemplo.com";
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
    alertShow("Erro ao carregar perfil do usuário.", "error");
  }

  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => renderProfileImage(e.target.result);
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

      const formData = new FormData();
      formData.append("name", document.getElementById("name").value);
      formData.append("email", document.getElementById("email").value);

      const password = document.getElementById("password").value;
      if (password) {
        formData.append("password", password);
      } else {
        formData.append("password", userData.password);
      }

      const file = fileInput.files[0];
      if (file) {
        formData.append("profileImage", file);
      }

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

      const updatedUser = await response.json();
      userData = updatedUser;
      localStorage.setItem("profileUrl", userData.profileUrl);

      document.getElementById("user-name-display").textContent = userData.name;
      document.getElementById("user-email-display").textContent = userData.email;

      editFields.forEach((field) => (field.style.display = "none"));
      editButton.style.display = "block";
      saveButton.style.display = "none";
      cancelButton.style.display = "none";

      alertShow("Perfil atualizado com sucesso!", "success");

      setTimeout(() => {
        progressBar.style.display = "none";
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      alertShow(error.message || "Erro ao atualizar perfil.", "error");
      progressBar.style.display = "none";
    }
  });

  // Excluir conta
  document.getElementById("btn-excluir")?.addEventListener("click", async () => {
    const confirmed = await showConfirm("Tem certeza que deseja excluir sua conta?");
    if (!confirmed) return;

    try {
      const response = await fetch(`http://localhost:3000/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Erro ao excluir conta");

      alertShow("Conta excluída com sucesso!", "success");

      setTimeout(() => {
        localStorage.removeItem("userId");
        window.location.href = "cadastro_login.html";
      }, 2000);
    } catch (error) {
      console.error("Erro ao excluir conta:", error);
      alertShow("Erro ao excluir conta.", "error");
    }
  });

  // Logout
  document.getElementById("btn-sair")?.addEventListener("click", async () => {
    const confirmed = await showConfirm("Tem certeza que deseja sair?");
    if (!confirmed) return;

    localStorage.removeItem("userId");
    window.location.href = "cadastro_login.html";
  });

  // Função de alerta visual
  function alertShow(message, type = "success") {
    const alertContainer = document.getElementById("alert-container");
    const alert = document.createElement("div");
    alert.className = `alert alert-${type === "error" ? "danger" : "success"} alert-dismissible fade show`;
    alert.role = "alert";
    alert.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    alertContainer.appendChild(alert);
    setTimeout(() => {
      alert.remove();
    }, 4000);
  }

  // Função de confirmação visual com Promise
  function showConfirm(message) {
    return new Promise((resolve) => {
      const confirmModal = document.createElement("div");
      confirmModal.className = "modal fade";
      confirmModal.tabIndex = -1;
      confirmModal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Confirmação</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <p>${message}</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button type="button" class="btn btn-danger" id="confirm-yes">Confirmar</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(confirmModal);

      const modal = new bootstrap.Modal(confirmModal);
      modal.show();

      confirmModal.querySelector("#confirm-yes").addEventListener("click", () => {
        modal.hide();
        resolve(true);
      });

      confirmModal.addEventListener("hidden.bs.modal", () => {
        confirmModal.remove();
        resolve(false);
      });
    });
  }
});