const cursoSelect = document.getElementById("curso-select");
    const btnCriarAula = document.getElementById("btn-criar-aula");

    async function carregarCursos() {
      try {
        const response = await fetch("http://localhost:3000/cursos");
        const cursos = await response.json();

        if (cursos.length === 0) {
          showAlert("Nenhum curso cadastrado. Crie um curso antes de adicionar aulas.");
          window.location.href = "CriarCurso.html";
          return;
        }

        cursos.forEach(curso => {
          const option = document.createElement("option");
          option.value = curso.id;
          option.textContent = curso.title;
          cursoSelect.appendChild(option);
        });
      } catch (error) {
        console.error("Erro ao carregar cursos", error);
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

    btnCriarAula.addEventListener("click", async () => {
      const cursoId = cursoSelect.value;
      const titulo = document.getElementById("aula-titulo").value.trim();
      const descricao = document.getElementById("aula-descricao").value.trim();
      const url = document.getElementById("aula-url").value.trim();

      if (!cursoId || !titulo || !descricao || !url) {
        showAlert("Preencha todos os campos.");
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
            courseId: cursoId
          })
        });

        if (!response.ok) throw new Error("Erro ao criar aula");

        showAlert("Aula criada com sucesso!");
        window.location.reload();
      } catch (error) {
        showAlert("Erro ao criar a aula.");
        console.error(error);
      }
    });

    document.addEventListener("DOMContentLoaded", carregarCursos);