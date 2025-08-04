const nomeTextarea = document.getElementById("curso-nome");
const descricaoTextarea = document.getElementById("curso-descricao");
const imagemInput = document.getElementById("curso-imagem");
const enviarBtn = document.getElementById("btn-enviar");
const aulaOverlay = document.getElementById("aula-overlay");
const aulaTitulo = document.getElementById("aula-titulo");
const aulaDescricao = document.getElementById("aula-descricao");
const aulaUrl = document.getElementById("aula-url");
const salvarAulaBtn = document.getElementById("btn-salvar-aula");

let cursoIdCriado = null;

enviarBtn.addEventListener("click", async () => {
  const nome = nomeTextarea.value.trim();
  const descricao = descricaoTextarea.value.trim();
  const imagem = imagemInput.value.trim();

  if (!nome || !descricao || !imagem) {
    showAlert("Preencha todos os campos.");
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/cursos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: nome,
        description: descricao,
        imageUrl: imagem,
        linkExterno: ""
      })
    });

    if (!response.ok) throw new Error("Erro ao criar curso");

    const novoCurso = await response.json();
    cursoIdCriado = novoCurso.id;

    aulaOverlay.style.display = "flex";
  } catch (error) {
    showAlert("Erro ao criar o curso.");
    console.error(error);
  }
});

salvarAulaBtn.addEventListener("click", async () => {
  const titulo = aulaTitulo.value.trim();
  const descricao = aulaDescricao.value.trim();
  const url = aulaUrl.value.trim();

  if (!titulo || !descricao || !url || !cursoIdCriado) {
    showAlert("Preencha todos os campos da aula.");
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/aulas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: titulo,
        description: descricao,
        url: url,
        courseId: cursoIdCriado
      })
    });

    if (!response.ok) throw new Error("Erro ao criar aula");

    showAlert("Aula criada com sucesso!");
    aulaOverlay.style.display = "none";
    window.location.reload();
  } catch (error) {
    showAlert("Erro ao criar a aula.");
    console.error(error);
  }
});

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

async function carregarCursos() {
  try {
    const response = await fetch("http://localhost:3000/cursos");
    const cursos = await response.json();

    const container = document.getElementById("lista-cursos");
    container.innerHTML = "";

    cursos.forEach(curso => {
      const card = document.createElement("div");
      card.className = "course-card bg-white p-3 rounded shadow-sm d-flex gap-3 position-relative mb-3";
      card.innerHTML = `
        <img src="${curso.imageUrl}" alt="Imagem do curso" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;">
        <div class="flex-grow-1">
          <h5 class="mb-1">${curso.title}</h5>
          <p class="small text-muted">${curso.description}</p>
          <a href="CriarCurso.html?id=${curso.id}" class="btn btn-outline-primary btn-sm">Ver Curso</a>
          <div class="mt-2 d-flex align-items-center gap-3">
            <div class="like-counter d-flex align-items-center gap-1">
              <i class="fas fa-thumbs-up like-btn"></i>
              <span class="like-count">0</span>
            </div>
            <div class="dislike-counter d-flex align-items-center gap-1">
              <i class="fas fa-thumbs-down dislike-btn"></i>
              <span class="dislike-count">0</span>
            </div>
          </div>
        </div>
        <a href="editarCurso.html?id=${curso.id}" class="align-self-start ms-auto">
          <i class="fas fa-pen fa-sm text-black"></i>
        </a>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error("Erro ao carregar cursos", err);
  }
}

document.addEventListener("DOMContentLoaded", carregarCursos);