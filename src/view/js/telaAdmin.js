// Configuração da API
const API_BASE_URL = 'http://localhost:3001/api';

// Estado da aplicação
let currentUser = null;
let authToken = null;

// Elementos do DOM
const elements = {
    // Navegação
    loginBtn: document.getElementById('loginBtn'),
    registerBtn: document.getElementById('registerBtn'),
    logoutBtn: document.getElementById('logoutBtn'),
    userMenu: document.getElementById('userMenu'),
    userName: document.getElementById('userName'),
    
    // Páginas
    homePage: document.getElementById('homePage'),
    loginPage: document.getElementById('loginPage'),
    registerPage: document.getElementById('registerPage'),
    userDashboard: document.getElementById('userDashboard'),
    adminDashboard: document.getElementById('adminDashboard'),
    
    // Formulários
    loginForm: document.getElementById('loginForm'),
    registerForm: document.getElementById('registerForm'),
    
    // Links
    showRegister: document.getElementById('showRegister'),
    showLogin: document.getElementById('showLogin'),
    
    // Dashboard elementos
    dashboardUserName: document.getElementById('dashboardUserName'),
    adminUserName: document.getElementById('adminUserName'),
    lastLogin: document.getElementById('lastLogin'),
    notifications: document.getElementById('notifications'),
    totalUsers: document.getElementById('totalUsers'),
    regularUsers: document.getElementById('regularUsers'),
    adminUsers: document.getElementById('adminUsers'),
    loadUsersBtn: document.getElementById('loadUsersBtn'),
    usersList: document.getElementById('usersList'),
    
    // Alertas
    alertContainer: document.getElementById('alertContainer')
};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    checkAuthStatus();
});

// Configurar event listeners
function setupEventListeners() {
    // Navegação
    elements.loginBtn.addEventListener('click', () => showPage('login'));
    elements.registerBtn.addEventListener('click', () => showPage('register'));
    elements.logoutBtn.addEventListener('click', logout);
    
    // Links entre formulários
    elements.showRegister.addEventListener('click', (e) => {
        e.preventDefault();
        showPage('register');
    });
    
    elements.showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        showPage('login');
    });
    
    // Formulários
    elements.loginForm.addEventListener('submit', handleLogin);
    elements.registerForm.addEventListener('submit', handleRegister);
    
    // Admin actions
    elements.loadUsersBtn.addEventListener('click', loadUsersList);
}

// Inicializar aplicação
function initializeApp() {
    // Verificar se há token salvo
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('currentUser');
    
    if (savedToken && savedUser) {
        authToken = savedToken;
        currentUser = JSON.parse(savedUser);
        updateUIForLoggedUser();
    } else {
        showPage('home');
    }
}

// Verificar status de autenticação
async function checkAuthStatus() {
    if (!authToken) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/me`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            currentUser = data.usuario;
            updateUIForLoggedUser();
        } else {
            // Token inválido
            logout();
        }
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        showAlert('Erro de conexão com o servidor', 'error');
    }
}

// Mostrar página
function showPage(pageName) {
    // Esconder todas as páginas
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Mostrar página específica
    switch(pageName) {
        case 'home':
            elements.homePage.classList.add('active');
            break;
        case 'login':
            elements.loginPage.classList.add('active');
            break;
        case 'register':
            elements.registerPage.classList.add('active');
            break;
        case 'userDashboard':
            elements.userDashboard.classList.add('active');
            loadDashboardData();
            break;
        case 'adminDashboard':
            elements.adminDashboard.classList.add('active');
            loadAdminData();
            break;
    }
}

// Atualizar UI para usuário logado
function updateUIForLoggedUser() {
    if (!currentUser) return;
    
    // Esconder botões de login/registro
    elements.loginBtn.style.display = 'none';
    elements.registerBtn.style.display = 'none';
    
    // Mostrar menu do usuário
    elements.userMenu.style.display = 'flex';
    elements.userName.textContent = currentUser.nome;
    
    // Redirecionar para dashboard apropriado
    if (currentUser.funcao === 'ADMINISTRADOR') {
        showPage('adminDashboard');
    } else {
        showPage('userDashboard');
    }
}

// Atualizar UI para usuário deslogado
function updateUIForLoggedOut() {
    // Mostrar botões de login/registro
    elements.loginBtn.style.display = 'inline-block';
    elements.registerBtn.style.display = 'inline-block';
    
    // Esconder menu do usuário
    elements.userMenu.style.display = 'none';
    
    // Mostrar página inicial
    showPage('home');
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const senha = document.getElementById('loginPassword').value;
    
    if (!email || !senha) {
        showAlert('Por favor, preencha todos os campos', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, senha })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Login bem-sucedido
            authToken = data.token;
            currentUser = data.usuario;
            
            // Salvar no localStorage
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            showAlert(`Bem-vindo, ${currentUser.nome}!`, 'success');
            updateUIForLoggedUser();
            
            // Limpar formulário
            elements.loginForm.reset();
            
        } else {
            showAlert(data.erro || 'Erro no login', 'error');
        }
        
    } catch (error) {
        console.error('Erro no login:', error);
        showAlert('Erro de conexão com o servidor', 'error');
    }
}

// Handle registro
async function handleRegister(e) {
    e.preventDefault();
    
    const nome = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const senha = document.getElementById('registerPassword').value;
    
    if (!nome || !email || !senha) {
        showAlert('Por favor, preencha todos os campos', 'error');
        return;
    }
    
    if (senha.length < 6) {
        showAlert('A senha deve ter pelo menos 6 caracteres', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/registro`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nome, email, senha })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showAlert('Conta criada com sucesso! Faça login para continuar.', 'success');
            showPage('login');
            elements.registerForm.reset();
        } else {
            showAlert(data.erro || 'Erro no registro', 'error');
        }
        
    } catch (error) {
        console.error('Erro no registro:', error);
        showAlert('Erro de conexão com o servidor', 'error');
    }
}

// Logout
function logout() {
    authToken = null;
    currentUser = null;
    
    // Remover do localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    
    updateUIForLoggedOut();
    showAlert('Logout realizado com sucesso', 'info');
}

// Carregar dados do dashboard
async function loadDashboardData() {
    if (!authToken) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // Atualizar elementos do dashboard
            elements.dashboardUserName.textContent = data.usuario.nome;
            elements.lastLogin.textContent = new Date(data.dados.ultimoLogin).toLocaleString('pt-BR');
            elements.notifications.textContent = data.dados.notificacoes;
            
        } else {
            showAlert('Erro ao carregar dados do dashboard', 'error');
        }
        
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        showAlert('Erro de conexão com o servidor', 'error');
    }
}

// Carregar dados do admin
async function loadAdminData() {
    if (!authToken || currentUser.funcao !== 'ADMINISTRADOR') return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/painel`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            
            // Atualizar elementos do painel admin
            elements.adminUserName.textContent = currentUser.nome;
            elements.totalUsers.textContent = data.estatisticas.totalUsuarios;
            elements.regularUsers.textContent = data.estatisticas.usuariosComuns;
            elements.adminUsers.textContent = data.estatisticas.administradores;
            
        } else {
            showAlert('Erro ao carregar dados administrativos', 'error');
        }
        
    } catch (error) {
        console.error('Erro ao carregar dados admin:', error);
        showAlert('Erro de conexão com o servidor', 'error');
    }
}

// Carregar lista de usuários
async function loadUsersList() {
    if (!authToken || currentUser.funcao !== 'ADMINISTRADOR') return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/usuarios`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayUsersList(data.usuarios);
        } else {
            showAlert('Erro ao carregar lista de usuários', 'error');
        }
        
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        showAlert('Erro de conexão com o servidor', 'error');
    }
}

// Exibir lista de usuários
function displayUsersList(usuarios) {
    elements.usersList.innerHTML = '';
    
    if (usuarios.length === 0) {
        elements.usersList.innerHTML = '<p>Nenhum usuário encontrado.</p>';
        return;
    }
    
    usuarios.forEach(usuario => {
        const userDiv = document.createElement('div');
        userDiv.className = 'user-item';
        
        // Não mostrar botões para o próprio usuário logado
        const isCurrentUser = usuario.id === currentUser.id;
        
        userDiv.innerHTML = `
            <div class="user-info">
                <h5>${usuario.nome}</h5>
                <p>${usuario.email}</p>
            </div>
            <div class="user-actions">
                <span class="user-role ${usuario.funcao === 'ADMINISTRADOR' ? 'role-admin' : 'role-user'}">
                    ${usuario.funcao}
                </span>
                ${!isCurrentUser ? 
                    (usuario.funcao === 'USUARIO' ? 
                        `<button class="btn btn-primary" onclick="promoteUser(${usuario.id})">Promover</button>` : 
                        `<button class="btn btn-secondary" onclick="demoteUser(${usuario.id})">Rebaixar</button>`
                    ) : 
                    '<span class="current-user-indicator">(Você)</span>'
                }
            </div>
        `;
        
        elements.usersList.appendChild(userDiv);
    });
}

// Promover usuário para admin
async function promoteUser(userId) {
    if (!authToken || currentUser.funcao !== 'ADMINISTRADOR') return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/usuarios/${userId}/promover`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            showAlert(data.mensagem, 'success');
            loadUsersList(); // Recarregar lista
            loadAdminData(); // Atualizar estatísticas
        } else {
            const data = await response.json();
            showAlert(data.erro || 'Erro ao promover usuário', 'error');
        }
        
    } catch (error) {
        console.error('Erro ao promover usuário:', error);
        showAlert('Erro de conexão com o servidor', 'error');
    }
}

// Mostrar alerta
function showAlert(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    elements.alertContainer.appendChild(alert);
    
    // Remover alerta após 5 segundos
    setTimeout(() => {
        if (alert.parentNode) {
            alert.parentNode.removeChild(alert);
        }
    }, 5000);
}

// Tornar função global para uso no HTML
window.promoteUser = promoteUser;

