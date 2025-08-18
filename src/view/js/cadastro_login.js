import loginUser from "./user-script/loginUser.js";

// Alternância de telas
const loginBtn = document.querySelector(".login-btn");
const registerBtn = document.querySelector(".register-btn");
const container = document.querySelector(".container");

loginBtn.addEventListener("click", () => {
  container.classList.remove("active");
});

registerBtn.addEventListener("click", () => {
  container.classList.add("active");
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

// Cadastro
const registerForm = document.querySelector(".form-box.register form");
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("registerName").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;

  try {
    const res = await fetch("http://localhost:3000/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      showAlert(data.message || "Cadastro realizado com sucesso!", "success");
      container.classList.remove("active");
    } else {
      showAlert(data.message || "Erro ao cadastrar", "danger");
    }
  } catch (err) {
    showAlert("Erro de conexão com o servidor", "danger");
  }
});

// Login
const loginForm = document.querySelector(".form-box.login form");
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try{
    const data = await loginUser(email, password);
    if (data && data.user.id) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("profileUrl", data.user.profileUrl);
      showAlert("Login realizado com sucesso!", "success");
      window.location.href = "index.html";
    } else {
      showAlert("Senha ou email incorretos");
    }
  } catch (err) {
    showAlert("Erro ao conectar com o servidor", "danger");
  }

});