import getProfile from "./user-script/getProfile.js";

// Redireciona se não estiver logado
document.addEventListener("DOMContentLoaded", async () => {
  const user = await getProfile();
  if (!user) {
    showAlert("Você precisa estar logado para acessar esta página.");
    window.location.href = "cadastro_login.html";
    return;
  }
  window.currentUser = user; // guardo globalmente
  loadCourses();
});

async function loadCourses() {
  try {
    const response = await fetch("http://localhost:3000/cursos");
    const courses = await response.json();

    const carouselContainer = $("#carousel-container");
    const coursesContainer = document.getElementById("courses-container");

    // Reset do carrossel
    carouselContainer.trigger("destroy.owl.carousel");
    carouselContainer.html("");

    // Preenche carrossel
    courses.forEach((course) => {
      const item = `
        <div class="item">
          <a href="./detalhes_curso.html?id=${course.id}">
            <img src="${course.imageUrl}" alt="${course.title}"
              style="width: 100%; height: 250px; object-fit: cover; border-radius: 10px;">
          </a>
        </div>`;
      carouselContainer.append(item);
    });

    carouselContainer.owlCarousel({
      loop: true,
      margin: 10,
      nav: false,
      responsive: { 0: { items: 1 }, 600: { items: 2 }, 1000: { items: 3 } }
    });

    $(".carousel-prev").click(() => carouselContainer.trigger("prev.owl.carousel"));
    $(".carousel-next").click(() => carouselContainer.trigger("next.owl.carousel"));

    // Render cards dos cursos
    coursesContainer.innerHTML = "";
    courses.forEach((course) => {
      const courseCard = document.createElement("div");
      courseCard.className = "course-card bg-white p-3 rounded shadow-sm d-flex gap-3";
      courseCard.innerHTML = `
        <div class="course-image"
          style="width: 100px; height: 100px; background-image: url('${course.imageUrl}');
                 background-size: cover; border-radius: 8px;"></div>
        <div class="flex-grow-1">
          <h5 class="mb-1">${course.title}</h5>
          <p class="small text-muted">${course.description}</p>

          <div class="d-flex align-items-center gap-3">
            <a href="./detalhes_curso.html?id=${course.id}" class="btn btn-outline-primary btn-sm">Ver Curso</a>
            
            <span class="reaction-buttons d-flex align-items-center gap-2">
              <i class="far fa-thumbs-up reaction-icon btn-like" data-id="${course.id}" style="cursor:pointer;"></i>
              <span class="like-count">0</span>

              <i class="far fa-thumbs-down reaction-icon btn-dislike" data-id="${course.id}" style="cursor:pointer;"></i>
              <span class="dislike-count">0</span>
            </span>
          </div>
        </div>
      `;
      coursesContainer.appendChild(courseCard);
    });

    // Reações
    setupReactionButtons();
    updateReactionCounts();

  } catch (error) {
    console.error("Erro ao carregar cursos:", error);
  }
}

function setupReactionButtons() {
  document.querySelectorAll(".btn-like").forEach(icon => {
    icon.addEventListener("click", async () => {
      const courseId = icon.dataset.id;
      await toggleReaction(courseId, "like");
      updateReactionCounts();
    });
  });

  document.querySelectorAll(".btn-dislike").forEach(icon => {
    icon.addEventListener("click", async () => {
      const courseId = icon.dataset.id;
      await toggleReaction(courseId, "dislike");
      updateReactionCounts();
    });
  });
}

async function toggleReaction(courseId, reaction) {
  try {
    await fetch("http://localhost:3000/reactions", {
      method: "PUT", // usa seu toggleReaction do controller
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: window.currentUser.id,
        courseId,
        reaction
      })
    });
  } catch (err) {
    console.error("Erro ao registrar reação:", err);
  }
}

async function updateReactionCounts() {
  try {
    const response = await fetch("http://localhost:3000/reactions");
    if (!response.ok) throw new Error("Erro ao buscar reações");
    const reactions = await response.json();

    document.querySelectorAll(".course-card").forEach(card => {
      const courseId = card.querySelector(".btn-like").dataset.id;
      const likes = reactions.filter(r => r.courseId == courseId && r.reaction === "like").length;
      const dislikes = reactions.filter(r => r.courseId == courseId && r.reaction === "dislike").length;

      const btnLike = card.querySelector(".btn-like");
      const btnDislike = card.querySelector(".btn-dislike");

      // resetar para borda (far)
      btnLike.className = "far fa-thumbs-up reaction-icon btn-like";
      btnDislike.className = "far fa-thumbs-down reaction-icon btn-dislike";

      card.querySelector(".like-count").textContent = likes;
      card.querySelector(".dislike-count").textContent = dislikes;

      // se o usuário reagiu, marcar preenchido (fas)
      const userReaction = reactions.find(r => r.courseId == courseId && r.userId == window.currentUser.id);
      if (userReaction) {
        if (userReaction.reaction === "like") {
          btnLike.className = "fas fa-thumbs-up reaction-icon btn-like";
        } else if (userReaction.reaction === "dislike") {
          btnDislike.className = "fas fa-thumbs-down reaction-icon btn-dislike";
        }
      }
    });
  } catch (err) {
    console.error("Erro ao atualizar contadores:", err);
  }
}

// Alerta visual com Bootstrap
function showAlert(message, type = "success", timeout = 3000) {
  const alertContainer = document.getElementById("alert-container");
  if (!alertContainer) return;
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
