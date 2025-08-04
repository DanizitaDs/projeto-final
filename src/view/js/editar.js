const selectCurso = document.getElementById("select-curso");
const selectAula = document.getElementById("select-aula");

const formCurso = document.getElementById("form-curso");
const inputCursoTitulo = document.getElementById("curso-titulo");
const inputCursoDescricao = document.getElementById("curso-descricao");
const inputCursoImagem = document.getElementById("curso-imagem");
const btnExcluirCurso = document.getElementById("btn-excluir-curso");

const formAula = document.getElementById("form-aula");
const inputAulaTitulo = document.getElementById("aula-titulo");
const inputAulaDescricao = document.getElementById("aula-descricao");
const inputAulaUrl = document.getElementById("aula-url");
const btnExcluirAula = document.getElementById("btn-excluir-aula");

// === Início: estado inicial ===
desabilitarFormularioCurso();
desabilitarFormularioAula();

// === Funções utilitárias ===
function desabilitarFormularioCurso() {
  formCurso.querySelectorAll("input, textarea, button").forEach(el => el.disabled = true);
}
function habilitarFormularioCurso() {
  formCurso.querySelectorAll("input, textarea, button").forEach(el => el.disabled = false);
}
function limparFormularioCurso() {
  inputCursoTitulo.value = "";
  inputCursoDescricao.value = "";
  inputCursoImagem.value = "";
}

function desabilitarFormularioAula() {
  formAula.querySelectorAll("input, textarea, button").forEach(el => el.disabled = true);
}
function habilitarFormularioAula() {
  formAula.querySelectorAll("input, textarea, button").forEach(el => el.disabled = false);
}
function limparFormularioAula() {
  inputAulaTitulo.value = "";
  inputAulaDescricao.value = "";
  inputAulaUrl.value = "";
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

// Modal de confirmação com promise
function showConfirm(message) {
  return new Promise(resolve => {
    const modalElement = document.getElementById("confirmModal");
    const modal = new bootstrap.Modal(modalElement);
    const modalMessage = document.getElementById("confirmModalMessage");
    const confirmBtn = document.getElementById("confirmModalYes");

    modalMessage.textContent = message;

    const newButton = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newButton, confirmBtn);

    newButton.addEventListener("click", () => {
      resolve(true);
      modal.hide();
    });

    modalElement.addEventListener("hidden.bs.modal", () => {
      resolve(false);
    }, { once: true });

    modal.show();
  });
}

// === Carregar cursos no select ===
async function carregarCursos() {
  try {
    const res = await fetch("http://localhost:3000/cursos");
    const cursos = await res.json();

    selectCurso.innerHTML = '<option value="">-- Selecione um curso --</option>';
    cursos.forEach(curso => {
      const option = document.createElement("option");
      option.value = curso.id;
      option.textContent = curso.title;
      selectCurso.appendChild(option);
    });
  } catch (error) {
    showAlert("Erro ao carregar cursos", "danger");
    console.error(error);
  }
}

// === Quando muda o curso selecionado ===
selectCurso.addEventListener("change", async () => {
  const cursoId = selectCurso.value;
  if (!cursoId) {
    limparFormularioCurso();
    desabilitarFormularioCurso();
    limparFormularioAula();
    desabilitarFormularioAula();
    selectAula.innerHTML = '<option value="">-- Selecione uma aula --</option>';
    selectAula.disabled = true;
    return;
  }

  habilitarFormularioCurso();
  try {
    const res = await fetch(`http://localhost:3000/cursos/${cursoId}`);
    if (!res.ok) throw new Error("Curso não encontrado");
    const curso = await res.json();

    inputCursoTitulo.value = curso.title || "";
    inputCursoDescricao.value = curso.description || "";
    inputCursoImagem.value = curso.imageUrl || "";

    // Carregar aulas
    if (curso.classes && curso.classes.length > 0) {
      selectAula.disabled = false;
      selectAula.innerHTML = '<option value="">-- Selecione uma aula --</option>';
      curso.classes.forEach(aula => {
        const option = document.createElement("option");
        option.value = aula.id;
        option.textContent = aula.title;
        selectAula.appendChild(option);
      });
    } else {
      selectAula.disabled = true;
      selectAula.innerHTML = '<option value="">-- Nenhuma aula cadastrada --</option>';
    }

    limparFormularioAula();
    desabilitarFormularioAula();
  } catch (error) {
    showAlert("Erro ao carregar curso", "danger");
    console.error(error);
  }
});

// === Quando muda a aula selecionada ===
selectAula.addEventListener("change", async () => {
  const aulaId = selectAula.value;
  if (!aulaId) {
    limparFormularioAula();
    desabilitarFormularioAula();
    return;
  }

  habilitarFormularioAula();
  try {
    const res = await fetch(`http://localhost:3000/aulas/${aulaId}`);
    if (!res.ok) throw new Error("Aula não encontrada");
    const aula = await res.json();

    inputAulaTitulo.value = aula.title || "";
    inputAulaDescricao.value = aula.description || "";
    inputAulaUrl.value = aula.url || aula.videoUrl || "";
  } catch (error) {
    showAlert("Erro ao carregar aula", "danger");
    console.error(error);
  }
});

// === Atualizar curso ===
formCurso.addEventListener("submit", async (e) => {
  e.preventDefault();
  const cursoId = selectCurso.value;
  if (!cursoId) return;

  const updatedCurso = {
    title: inputCursoTitulo.value,
    description: inputCursoDescricao.value,
    imageUrl: inputCursoImagem.value
  };

  try {
    const res = await fetch(`http://localhost:3000/cursos/${cursoId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedCurso)
    });
    if (!res.ok) throw new Error("Erro ao atualizar curso");

    showAlert("Curso atualizado com sucesso");
    await carregarCursos();
    selectCurso.value = cursoId;
  } catch (error) {
    showAlert(error.message, "danger");
    console.error(error);
  }
});

// === Excluir curso ===
btnExcluirCurso.addEventListener("click", async () => {
  const cursoId = selectCurso.value;
  if (!cursoId) {
    showAlert("Selecione um curso para excluir", "danger");
    return;
  }

  const confirmado = await showConfirm("Tem certeza que deseja excluir este curso?");
  if (!confirmado) return;

  try {
    const res = await fetch(`http://localhost:3000/cursos/${cursoId}`, {
      method: "DELETE"
    });
    if (!res.ok) throw new Error("Erro ao excluir curso");

    showAlert("Curso excluído com sucesso");
    await carregarCursos();
    selectCurso.value = "";
    limparFormularioCurso();
    desabilitarFormularioCurso();

    limparFormularioAula();
    desabilitarFormularioAula();
    selectAula.disabled = true;
    selectAula.innerHTML = '<option value="">-- Selecione uma aula --</option>';
  } catch (error) {
    showAlert(error.message, "danger");
    console.error(error);
  }
});

// === Atualizar aula ===
formAula.addEventListener("submit", async (e) => {
  e.preventDefault();
  const aulaId = selectAula.value;
  if (!aulaId) return;

  const updatedAula = {
    title: inputAulaTitulo.value,
    description: inputAulaDescricao.value,
    url: inputAulaUrl.value,
    courseId: selectCurso.value
  };

  try {
    const res = await fetch(`http://localhost:3000/aulas/${aulaId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedAula)
    });
    if (!res.ok) throw new Error("Erro ao atualizar aula");

    showAlert("Aula atualizada com sucesso");
  } catch (error) {
    showAlert(error.message, "danger");
    console.error(error);
  }
});

// === Excluir aula ===
btnExcluirAula.addEventListener("click", async () => {
  const aulaId = selectAula.value;
  if (!aulaId) {
    showAlert("Selecione uma aula para excluir", "danger");
    return;
  }

  const confirmado = await showConfirm("Tem certeza que deseja excluir esta aula?");
  if (!confirmado) return;

  try {
    const res = await fetch(`http://localhost:3000/aulas/${aulaId}`, {
      method: "DELETE"
    });
    if (!res.ok) throw new Error("Erro ao excluir aula");

    showAlert("Aula excluída com sucesso");

    // Atualiza lista de aulas
    const cursoId = selectCurso.value;
    if (cursoId) {
      const resCurso = await fetch(`http://localhost:3000/cursos/${cursoId}`);
      const curso = await resCurso.json();

      if (curso.classes && curso.classes.length > 0) {
        selectAula.innerHTML = '<option value="">-- Selecione uma aula --</option>';
        curso.classes.forEach(aula => {
          const option = document.createElement("option");
          option.value = aula.id;
          option.textContent = aula.title;
          selectAula.appendChild(option);
        });
        selectAula.disabled = false;
      } else {
        selectAula.innerHTML = '<option value="">-- Nenhuma aula cadastrada --</option>';
        selectAula.disabled = true;
      }
    }

    limparFormularioAula();
    desabilitarFormularioAula();
  } catch (error) {
    showAlert(error.message, "danger");
    console.error(error);
  }
});

// === Inicializa ===
carregarCursos();