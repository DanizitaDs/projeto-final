import getProfile from "./user-script/getProfile.js";

// Redireciona se não estiver logado
document.addEventListener("DOMContentLoaded", async () => {
  const user = await getProfile()
  if (!user) {
    showAlert("Você precisa estar logado para acessar esta página.");
    window.location.href = "cadastro_login.html";
    return;
  }

  loadCourses();
});

async function loadCourses() {
  try {
    const response = await fetch("http://localhost:3000/cursos");
    const courses = await response.json();

    const carouselContainer = $("#carousel-container");
    const coursesContainer = document.getElementById("courses-container");

    carouselContainer.trigger("destroy.owl.carousel");
    carouselContainer.html("");

    courses.forEach((course) => {
      const item = `
        <div class="item">
          <a href="./detalhes_curso.html?id=${course.id}">
            <img src="${course.imageUrl}" alt="${course.title}" style="width: 100%; height: 250px; object-fit: cover; border-radius: 10px;">
          </a>
        </div>
      `;
      carouselContainer.append(item);
    });

    carouselContainer.owlCarousel({
      loop: true,
      margin: 10,
      nav: false,
      responsive: {
        0: { items: 1 },
        600: { items: 2 },
        1000: { items: 3 },
      },
    });

    $(".carousel-prev").click(() =>
      carouselContainer.trigger("prev.owl.carousel")
    );
    $(".carousel-next").click(() =>
      carouselContainer.trigger("next.owl.carousel")
    );

    coursesContainer.innerHTML = "";
    courses.forEach((course) => {
      const courseCard = document.createElement("div");
      courseCard.className =
        "course-card bg-white p-3 rounded shadow-sm d-flex gap-3";
      courseCard.innerHTML = `
        <div class="course-image" style="width: 100px; height: 100px; background-image: url('${course.imageUrl}'); background-size: cover; border-radius: 8px;"></div>
        <div class="flex-grow-1">
          <h5 class="mb-1">${course.title}</h5>
          <p class="small text-muted">${course.description}</p>
          <a href="./detalhes_curso.html?id=${course.id}" class="btn btn-outline-primary btn-sm">Ver Curso</a>
        </div>
      `;
      coursesContainer.appendChild(courseCard);
    });
  } catch (error) {
    console.error("Erro ao carregar cursos:", error);
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