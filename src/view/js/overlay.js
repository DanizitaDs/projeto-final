import getProfile from "./user-script/getProfile.js";

const overlayMenu = document.getElementById("overlay-menu");
const overlayBusca = document.getElementById("overlay");
const configModal = document.getElementById("config-modal");

// === Regras do menu ===
const user = await getProfile()

if (user.role === "student") {
  const btns = ["btnEditar", "btnCriarCurso", "btnCriarAula", "btnAdmin"];
  btns.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });
}

// === Configura imagem de perfil ===
async function loadProfileImg () {
  const profileBolinhaElement = document.querySelector(".perfil-bolinha");

  if (!profileBolinhaElement) {
    console.error("No .perfil-bolinha element found on page");
    return;
  }
  
  const profileUrl = user.profileUrl;

  try {
    if (profileUrl && profileUrl !== "null" && profileUrl.trim() !== "") {
      const imgElement = document.createElement("img");
      imgElement.classList.add("foto-perfil");

      imgElement.src = profileUrl.startsWith("http")
        ? profileUrl
        : `http://localhost:3000${profileUrl}`;

      imgElement.onerror = () => {
        profileBolinhaElement.innerHTML = '<i class="fas fa-user"></i>';
      };

      profileBolinhaElement.innerHTML = "";
      profileBolinhaElement.appendChild(imgElement);
    } else {
      profileBolinhaElement.innerHTML = '<i class="fas fa-user"></i>';
    }
  } catch (error) {
    console.error("Erro ao configurar imagem de perfil:", error);
    profileBolinhaElement.innerHTML = '<i class="fas fa-user"></i>';
  }
}

loadProfileImg();

// === Abrir overlay do menu ===
document.querySelector(".perfil-bolinha").addEventListener("click", () => {
  overlayMenu.classList.add("show");
});

// === Fechar overlays ao clicar fora ===
document.addEventListener("click", (e) => {
  const contentMenu = document.getElementById("overlay-content-menu");
  if (
    overlayMenu &&
    contentMenu &&
    !contentMenu.contains(e.target) &&
    !e.target.closest(".perfil-bolinha")
  ) {
    overlayMenu.classList.remove("show");
  }

  const contentBusca = document.getElementById("overlay-content-busca");
  if (
    overlayBusca &&
    contentBusca &&
    !contentBusca.contains(e.target) &&
    !e.target.closest("#form-search")
  ) {
    overlayBusca.classList.remove("show");
  }
});

// === Fechar menu ao clicar em links ===
document.querySelectorAll("#overlay-menu a").forEach((link) => {
  link.addEventListener("click", () => {
    overlayMenu.classList.remove("show");
  });
});

// === Excluir conta com confirmação ===
function excluirConta() {
  showConfirm("Tem certeza que deseja excluir sua conta?", async () => {
    const userId = await getProfile()

    if (!userId) {
      showAlert("Usuário não encontrado.", "danger");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/users`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir conta.");
      }

      showAlert("Conta excluída com sucesso!", "success");
      localStorage.removeItem("userId");
      localStorage.removeItem("profileUrl");

      setTimeout(() => {
        window.location.href = "cadastro_login.html";
      }, 2000);
    } catch (error) {
      console.error("Erro ao excluir conta:", error);
      showAlert("Erro ao excluir conta. Tente novamente mais tarde.", "danger");
    }
  });
}

const btnExcluir = document.getElementById("btnDelete")
btnExcluir.addEventListener(("click"), () => {
  excluirConta()
})

// === Sair com confirmação ===
function sair() {
  showConfirm("Tem certeza que deseja sair da sua conta?", () => {
    localStorage.removeItem("token");
    window.location.href = "cadastro_login.html";
  });
}

const btnSair = document.getElementById("btnSair")
btnSair.addEventListener(("click"), () =>{
  sair()
})

// === Busca de cursos ===
document.getElementById("form-search").addEventListener("submit", async (e) => {
  e.preventDefault();

  const searchTerm = document.getElementById("search-input").value.trim();
  const resultsContainer = document.getElementById("search-results");

  if (!searchTerm) {
    showAlert("Digite algo para buscar.", "warning");
    if (overlayBusca) overlayBusca.classList.add("show");
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:3000/cursos?search=${encodeURIComponent(searchTerm)}`
    );

    if (!response.ok) {
      throw new Error("Erro na resposta do servidor");
    }

    const cursos = await response.json();

    if (!Array.isArray(cursos) || cursos.length === 0) {
      resultsContainer.innerHTML = "<p>Nenhum curso encontrado.</p>";
    } else {
      resultsContainer.innerHTML = cursos
        .map(
          (curso) => `
        <div class="card mb-3 position-relative" style="max-width: 540px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <button class="btn-close position-absolute end-0 top-0 m-2" onclick="fecharResultado(this)"></button>
          <div class="row g-0 align-items-center">
            <div class="col-auto">
              <img src="${curso.imageUrl}" alt="Imagem do curso" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px 0 0 8px;">
            </div>
            <div class="col">
              <div class="card-body">
                <h5 class="card-title mb-1">${curso.title}</h5>
                <p class="card-text small text-muted">${curso.description}</p>
                <a href="CriarCurso.html?id=${curso.id}" class="btn btn-outline-primary btn-sm mb-2">Ver Curso</a>
              </div>
            </div>
          </div>
        </div>
      `
        )
        .join("");
    }

    if (overlayBusca) overlayBusca.classList.add("show");
  } catch (err) {
    console.error("Erro ao buscar cursos:", err);
    showAlert("Erro ao buscar cursos. Tente novamente mais tarde.", "danger");
    if (overlayBusca) overlayBusca.classList.add("show");
  }
});

// === Fechar resultado individual da busca ===
function fecharResultado(btn) {
  const card = btn.closest(".card");
  if (card) {
    card.remove();
  }
}

// === Alerta bonito com Bootstrap ===
function showAlert(message, type = "success", timeout = 3000) {
  const alertContainer = document.getElementById("alert-container");

  const wrapper = document.createElement("div");
  wrapper.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
    </div>
  `;

  const alertElement = wrapper.firstElementChild;
  alertContainer.appendChild(alertElement);

  setTimeout(() => {
    const alertInstance = bootstrap.Alert.getOrCreateInstance(alertElement);
    alertInstance.close();
  }, timeout);
}

// === Confirmação bonita com modal Bootstrap ===
function showConfirm(message, onConfirm) {
  const confirmModal = new bootstrap.Modal(document.getElementById("confirmModal"));
  const confirmMessage = document.getElementById("confirmModalMessage");
  const confirmYesBtn = document.getElementById("confirmModalYes");

  confirmMessage.textContent = message;

  const newButton = confirmYesBtn.cloneNode(true);
  confirmYesBtn.parentNode.replaceChild(newButton, confirmYesBtn);

  newButton.addEventListener("click", () => {
    confirmModal.hide();
    onConfirm();
  });

  confirmModal.show();
}

/* ============================================================
   LIKE / DISLIKE (exclusivos e com contagem)
============================================================ */
async function toggleReaction(userId, classId, reaction) {
  await fetch("http://localhost:3000/reactions", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, classId, reaction })
  });
}

async function updateReactionCounts() {
  const response = await fetch("http://localhost:3000/reactions");
  const reactions = await response.json();

  document.querySelectorAll(".course-card").forEach(card => {
    const classId = card.querySelector(".like-btn").dataset.classeId;
    const likes = reactions.filter(r => r.classId == classId && r.reaction === "like").length;
    const dislikes = reactions.filter(r => r.classId == classId && r.reaction === "dislike").length;

    card.querySelector(".like-count").textContent = likes;
    card.querySelector(".dislike-count").textContent = dislikes;
  });
}

function setupReactions(userId) {
  document.querySelectorAll(".like-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.classeId;
      await toggleReaction(userId, id, "like");

      btn.classList.toggle("fas");
      btn.classList.toggle("far");

      // Se clicou em like, tira dislike
      const dislikeBtn = btn.closest(".course-card").querySelector(".dislike-btn");
      dislikeBtn.classList.remove("fas");
      dislikeBtn.classList.add("far");

      updateReactionCounts();
    });
  });

  document.querySelectorAll(".dislike-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.classeId;
      await toggleReaction(userId, id, "dislike");

      btn.classList.toggle("fas");
      btn.classList.toggle("far");

      // Se clicou em dislike, tira like
      const likeBtn = btn.closest(".course-card").querySelector(".like-btn");
      likeBtn.classList.remove("fas");
      likeBtn.classList.add("far");

      updateReactionCounts();
    });
  });
}

// Chama quando carregar cursos (usa user.id já do getProfile)
if (user) {
  setupReactions(user.id);
  updateReactionCounts();
}
