const API_BASE_URL = 'http://localhost:3000/api';
let currentMenu = [];
let selectedPlatos = {};

function getToken() {
    return localStorage.getItem('token');
}

function setToken(token) {
    if (token) {
        localStorage.setItem('token', token);
    } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
    updateUI(!!token);
}

function scrollToAuth(mode) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (mode === 'login') showLogin();
    else showRegister();
}

function updateUI(isLoggedIn) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = user && user.admin;

    document.getElementById('auth-controls').style.display = isLoggedIn ? 'none' : 'flex';
    document.getElementById('user-controls').style.display = isLoggedIn ? 'flex' : 'none';
    document.getElementById('auth-section').style.display = isLoggedIn ? 'none' : 'block';

    // Solo usuario ve carrito y pedidos
    document.getElementById('menu-section').style.display = (isLoggedIn && !isAdmin) ? 'block' : 'none';
    document.getElementById('order-section').style.display = (isLoggedIn && !isAdmin) ? 'block' : 'none';
    document.getElementById('user-info').style.display = (isLoggedIn && !isAdmin) ? 'block' : 'none';

    // Admin ve el panel admin
    document.getElementById('admin-section').style.display = (isLoggedIn && isAdmin) ? 'block' : 'none';

    if (isLoggedIn) {
        updateUserAvatar(user, isAdmin);
        
        if (isAdmin) {
            fetchAdminPlatos();
            fetchAdminPedidos();
            fetchAdminMenuView();
        } else {
            const displayName = user.nombre && user.apellido ? `${user.nombre} ${user.apellido}` : user.email;
            document.getElementById('user-email').textContent = displayName || '';
            fetchPedidos();
        }
    }
}

function updateUserAvatar(user, isAdmin) {
    const avatarDiv = document.getElementById('user-avatar');
    
    if (isAdmin) {
        // Avatar de admin con herramientas
        avatarDiv.innerHTML = '🛠️';
        avatarDiv.className = 'user-avatar admin-avatar';
        document.getElementById('user-email').textContent = 'Administrador';
    } else {
        // Avatar de usuario con emoji de gaseosa
        avatarDiv.innerHTML = '🥤';
        avatarDiv.className = 'user-avatar user-avatar-cliente';
        const displayName = user.nombre && user.apellido ? `${user.nombre} ${user.apellido}` : user.email;
        document.getElementById('user-email').textContent = displayName || '';
    }
}

function getIniciales(nombre, apellido) {
    if (!nombre || !apellido) return '🥤';
    return `${nombre.charAt(0).toUpperCase()}${apellido.charAt(0).toUpperCase()}`;
}

async function fetchMenu() {
    try {
        const response = await fetch(`${API_BASE_URL}/platos`);
        currentMenu = await response.json();
        renderMenu(currentMenu);
    } catch (error) {
        document.getElementById('menu-list').innerHTML = '<p class="loading">❌ Error al cargar el menú.</p>';
    }
}

function renderMenu(platos) {
    const list = document.getElementById('menu-list');
    list.innerHTML = '';
    
    // Agrupar por tipo
    const agrupadosPorTipo = {
        principal: platos.filter(p => p.tipo === 'principal'),
        combo: platos.filter(p => p.tipo === 'combo'),
        postre: platos.filter(p => p.tipo === 'postre')
    };

    // Configuración de títulos e iconos
    const config = {
        principal: { titulo: 'Hamburguesas', icono: '🍔' },
        combo: { titulo: 'Combos', icono: '🍟' },
        postre: { titulo: 'Postres', icono: '🍰' }
    };

    // Renderizar cada tipo
    ['principal', 'combo', 'postre'].forEach(tipo => {
        if (agrupadosPorTipo[tipo].length > 0) {
            // Header de tipo
            const tipoSection = document.createElement('div');
            tipoSection.className = 'tipo-section';
            tipoSection.innerHTML = `<h3 class="tipo-title">${config[tipo].icono} ${config[tipo].titulo}</h3>`;
            list.appendChild(tipoSection);

            // Grid de platos
            const grid = document.createElement('div');
            grid.className = 'platos-grid';

            agrupadosPorTipo[tipo].forEach(plato => {
                const card = document.createElement('div');
                card.className = 'plato-card';
                card.innerHTML = `
                    <span class="plato-tipo tipo-${plato.tipo}">${plato.tipo}</span>
                    <div class="plato-card-content">
                        <h4>${plato.nombre}</h4>
                        <p>${plato.descripcion}</p>
                        <div class="plato-price">$${plato.precio}</div>
                        <button onclick="addPlato(${plato.id}, '${plato.nombre}', ${plato.precio})" class="btn btn-primary">
                            ➕ Agregar
                        </button>
                    </div>
                `;
                grid.appendChild(card);
            });

            list.appendChild(grid);
        }
    });
}

function addPlato(id, nombre, precio) {
    const token = getToken();
    
    console.log('Token:', token); // Debug
    console.log('Usuario:', localStorage.getItem('user')); // Debug
    
    if (!token) {
        alert('⚠️ Debes iniciar sesión para agregar platos al carrito.');
        showLogin();
        return;
    }
    
    selectedPlatos[id] = (selectedPlatos[id] || 0) + 1;
    updateOrderSummary();
    
    // Feedback visual
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
        if (btn.textContent.includes('Agregar') && btn.onclick && btn.onclick.toString().includes(`addPlato(${id}`)) {
            const originalText = btn.innerHTML;
            btn.innerHTML = '✅ Agregado';
            btn.style.background = '#4CAF50';
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = '';
            }, 1000);
        }
    });
}

function updateOrderSummary() {
    const summaryDiv = document.getElementById('selected-platos');
    let total = 0;
    summaryDiv.innerHTML = '';

    const itemsCount = Object.keys(selectedPlatos).filter(id => selectedPlatos[id] > 0).length;
    
    if (itemsCount === 0) {
        summaryDiv.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
        document.getElementById('order-total').textContent = '0.00';
        return;
    }

    for (const id in selectedPlatos) {
        const count = selectedPlatos[id];
        if (count > 0) {
            const plato = currentMenu.find(p => p.id == id);
            if (plato) {
                const subtotal = count * plato.precio;
                total += subtotal;
                const item = document.createElement('div');
                item.className = 'cart-item';
                item.innerHTML = `
                    <div class="cart-item-info">
                        <div class="cart-item-name">${count} x ${plato.nombre}</div>
                        <div class="cart-item-price">$${subtotal}</div>
                    </div>
                    <button onclick="removePlato(${id})" class="btn btn-danger btn-sm">🗑️</button>
                `;
                summaryDiv.appendChild(item);
            }
        }
    }

    document.getElementById('order-total').textContent = total.toFixed(0);
}

function removePlato(id) {
    if (selectedPlatos[id]) {
        selectedPlatos[id]--;
        if (selectedPlatos[id] <= 0) {
            delete selectedPlatos[id];
        }
        updateOrderSummary();
    }
}

async function fetchPedidos() {
    const token = getToken();
    if (!token) return;

    const list = document.getElementById('pedidos-list');
    list.innerHTML = '<li class="loading">Cargando pedidos...</li>';

    try {
        const response = await fetch(`${API_BASE_URL}/pedidos/usuario`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Error al obtener pedidos.');

        const pedidos = await response.json();
        list.innerHTML = '';
        
        if (pedidos.length === 0) {
            list.innerHTML = '<li class="empty-cart" style="text-align: center; padding: 40px;">No tienes pedidos aún. ¡Haz tu primer pedido!</li>';
            return;
        }

        pedidos.forEach(p => {
            const item = document.createElement('li');
            const fecha = new Date(p.fecha).toLocaleDateString('es-AR');
            const estadoClass = `status-${p.estado.toLowerCase().replace(' ', '-')}`;
            
            item.className = 'order-card';
            item.innerHTML = `
                <div class="order-header">
                    <span class="order-id">Pedido #${p.id}</span>
                    <span class="order-status ${estadoClass}">${p.estado}</span>
                </div>
                <div class="order-details">
                    <strong>Fecha:</strong> ${fecha}
                </div>
                <div class="order-items">
                    <strong>Items:</strong>
                    <ul>
                        ${p.platos.map(pl => `<li>🍔 ${pl.cantidad}x Plato #${pl.id}</li>`).join('')}
                    </ul>
                </div>
            `;
            list.appendChild(item);
        });

    } catch (error) {
        console.error(error);
        list.innerHTML = '<li class="loading">❌ Error al cargar tus pedidos.</li>';
    }
}

async function handleRegister(event) {
    event.preventDefault();
    const nombre = document.getElementById('reg-nombre').value;
    const apellido = document.getElementById('reg-apellido').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const msg = document.getElementById('reg-message');
    msg.textContent = '⏳ Registrando...';
    msg.style.background = '#FFF3CD';
    msg.style.color = '#856404';

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, apellido, email, password })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Fallo en el registro');

        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        setToken(data.token);
        
        msg.textContent = '✅ ¡Registro exitoso! Bienvenido a BurgerTIC';
        msg.style.background = '#D4EDDA';
        msg.style.color = '#155724';
        
        document.getElementById('register-form').reset();
    } catch (error) {
        msg.textContent = `❌ ${error.message}`;
        msg.style.background = '#F8D7DA';
        msg.style.color = '#721C24';
    }
}

async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const msg = document.getElementById('login-message');
    msg.textContent = '⏳ Iniciando sesión...';
    msg.style.background = '#FFF3CD';
    msg.style.color = '#856404';

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Fallo en el login');

        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        setToken(data.token);
        
        msg.textContent = '✅ ¡Bienvenido de vuelta!';
        msg.style.background = '#D4EDDA';
        msg.style.color = '#155724';
        
        document.getElementById('login-form').reset();
    } catch (error) {
        msg.textContent = `❌ ${error.message}`;
        msg.style.background = '#F8D7DA';
        msg.style.color = '#721C24';
    }
}

async function confirmarPedido() {
    const token = getToken();
    if (!token) {
        alert('⚠️ Debes iniciar sesión para hacer un pedido.');
        return;
    }
    
    const lineasPedido = Object.keys(selectedPlatos)
        .filter(id => selectedPlatos[id] > 0)
        .map(platoId => ({
            id: parseInt(platoId),
            cantidad: selectedPlatos[platoId],
        }));

    if (lineasPedido.length === 0) {
        alert('⚠️ Debes seleccionar al menos un plato.');
        return;
    }

    const msg = document.getElementById('order-message');
    msg.textContent = '⏳ Enviando pedido...';
    msg.style.background = '#FFF3CD';
    msg.style.color = '#856404';

    try {
        const response = await fetch(`${API_BASE_URL}/pedidos`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ platos: lineasPedido })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Fallo al crear el pedido');

        msg.textContent = `✅ ¡Pedido #${data.id} confirmado! Lo estamos preparando 🍔`;
        msg.style.background = '#D4EDDA';
        msg.style.color = '#155724';
        selectedPlatos = {};
        updateOrderSummary();
        fetchPedidos();
        
        setTimeout(() => {
            msg.textContent = '';
        }, 5000);
    } catch (error) {
        msg.textContent = `❌ ${error.message}`;
        msg.style.background = '#F8D7DA';
        msg.style.color = '#721C24';
    }
}

async function logout() {
    setToken(null);
    selectedPlatos = {};
    updateOrderSummary();
    document.getElementById('login-form').reset();
    document.getElementById('register-form').reset();
    document.getElementById('login-message').textContent = '';
    document.getElementById('reg-message').textContent = '';
}

function showRegister() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
    document.getElementById('login-message').textContent = '';
    document.getElementById('reg-message').textContent = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showLogin() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-message').textContent = '';
    document.getElementById('reg-message').textContent = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- ADMIN PLATOS ---
async function fetchAdminPlatos() {
    const token = getToken();
    if (!token) return;
    try {
        const response = await fetch(`${API_BASE_URL}/platos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const platos = await response.json();
        renderAdminPlatos(platos);
    } catch (error) {
        document.getElementById('admin-platos-list').innerHTML = 'Error al cargar platos.';
    }
}

function renderAdminPlatos(platos) {
    const list = document.getElementById('admin-platos-list');
    list.innerHTML = '';
    platos.forEach(plato => {
        const div = document.createElement('div');
        div.className = 'plato-card';
        div.innerHTML = `
            <b>${plato.nombre}</b> (${plato.tipo}) - $${plato.precio}
            <br><small>${plato.descripcion}</small>
            <div class="admin-actions">
                <button onclick="showEditPlatoForm(${plato.id})" class="btn-edit"><span>✏️</span>Editar</button>
                <button onclick="deletePlato(${plato.id})" class="btn btn-danger btn-sm"><span>🗑️</span>Borrar</button>
            </div>
            <div id="edit-plato-form-${plato.id}" style="display:none; margin-top:10px;"></div>
        `;
        list.appendChild(div);
    });
}

function showEditPlatoForm(id) {
    const token = getToken();
    const formDiv = document.getElementById(`edit-plato-form-${id}`);
    formDiv.style.display = 'block';
    formDiv.innerHTML = `
        <form onsubmit="handleEditPlato(event, ${id})">
            <input type="text" id="edit-nombre-${id}" placeholder="Nuevo nombre">
            <input type="text" id="edit-descripcion-${id}" placeholder="Nueva descripción">
            <input type="number" id="edit-precio-${id}" placeholder="Nuevo precio">
            <select id="edit-tipo-${id}">
                <option value="">Tipo</option>
                <option value="principal">Principal</option>
                <option value="combo">Combo</option>
                <option value="postre">Postre</option>
            </select>
            <div class="admin-actions">
                <button type="submit" class="btn-save"><span>💾</span>Guardar</button>
                <button type="button" onclick="hideEditPlatoForm(${id})" class="btn-cancel"><span>❌</span>Cancelar</button>
            </div>
        </form>
        <p id="edit-plato-message-${id}" class="message"></p>
    `;
}

function hideEditPlatoForm(id) {
    document.getElementById(`edit-plato-form-${id}`).style.display = 'none';
}

function showAddPlatoForm() {
    document.getElementById('add-plato-form').style.display = 'block';
}

function hideAddPlatoForm() {
    document.getElementById('add-plato-form').style.display = 'none';
    document.getElementById('add-plato-form').querySelector('form').reset();
    document.getElementById('add-plato-message').textContent = '';
}

async function handleAddPlato(event) {
    event.preventDefault();
    const nombre = document.getElementById('plato-nombre').value;
    const descripcion = document.getElementById('plato-descripcion').value;
    const precio = parseInt(document.getElementById('plato-precio').value);
    const tipo = document.getElementById('plato-tipo').value;
    const token = getToken();
    const msg = document.getElementById('add-plato-message');
    msg.textContent = '⏳ Agregando plato...';
    msg.style.background = '#FFF3CD';
    msg.style.color = '#856404';

    try {
        const response = await fetch(`${API_BASE_URL}/platos`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ nombre, descripcion, precio, tipo })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || data.error || 'Error al agregar plato');
        
        msg.textContent = '✅ Plato agregado exitosamente!';
        msg.style.background = '#D4EDDA';
        msg.style.color = '#155724';
        
        fetchAdminPlatos();
        fetchMenu(); // Actualizar el menú general también
        
        setTimeout(() => {
            hideAddPlatoForm();
        }, 2000);
    } catch (error) {
        msg.textContent = `❌ ${error.message}`;
        msg.style.background = '#F8D7DA';
        msg.style.color = '#721C24';
    }
}

// --- ADMIN PEDIDOS ---
async function fetchAdminPedidos() {
    const token = getToken();
    if (!token) return;
    try {
        const response = await fetch(`${API_BASE_URL}/pedidos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const pedidos = await response.json();
        renderAdminPedidos(pedidos);
    } catch (error) {
        document.getElementById('admin-pedidos-list').innerHTML = 'Error al cargar pedidos.';
    }
}

function renderAdminPedidos(pedidos) {
    const list = document.getElementById('admin-pedidos-list');
    list.innerHTML = '';
    pedidos.forEach(p => {
        const item = document.createElement('li');
        const fecha = new Date(p.fecha).toLocaleDateString('es-AR');
        const estadoClass = `status-${p.estado.toLowerCase().replace(' ', '-')}`;
        item.className = 'order-card';
        item.innerHTML = `
            <div class="order-header">
                <span class="order-id">Pedido #${p.id}</span>
                <span class="order-status ${estadoClass}">${p.estado}</span>
            </div>
            <div class="order-details">
                <strong>Usuario:</strong> ${p.id_usuario}
                <br><strong>Fecha:</strong> ${fecha}
            </div>
            <div class="order-items">
                <strong>Items:</strong>
                <ul>
                    ${p.platos.map(pl => `<li>🍔 ${pl.cantidad}x Plato #${pl.id}</li>`).join('')}
                </ul>
            </div>
            <div class="admin-actions">
                ${p.estado === 'pendiente' ? `<button onclick="aceptarAdminPedido(${p.id})" class="btn-save"><span>✅</span>Aceptar</button>` : ''}
                ${p.estado === 'aceptado' ? `<button onclick="comenzarAdminPedido(${p.id})" class="btn-edit"><span>🚚</span>En Camino</button>` : ''}
                ${p.estado === 'en camino' ? `<button onclick="entregarAdminPedido(${p.id})" class="btn-save"><span>📦</span>Entregar</button>` : ''}
                ${p.estado !== 'cancelado' && p.estado !== 'entregado' ? `<button onclick="cancelarAdminPedido(${p.id})" class="btn-cancel"><span>❌</span>Cancelar</button>` : ''}
                <button onclick="eliminarAdminPedido(${p.id})" class="btn-delete"><span>🗑️</span>Eliminar</button>
            </div>
        `;
        list.appendChild(item);
    });
}

async function aceptarAdminPedido(id) {
    const token = getToken();
    try {
        const response = await fetch(`${API_BASE_URL}/pedidos/${id}/aceptar`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Error');
        fetchAdminPedidos();
    } catch (error) {
        alert(error.message);
    }
}

async function comenzarAdminPedido(id) {
    const token = getToken();
    try {
        const response = await fetch(`${API_BASE_URL}/pedidos/${id}/comenzar`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Error');
        fetchAdminPedidos();
    } catch (error) {
        alert(error.message);
    }
}

async function entregarAdminPedido(id) {
    const token = getToken();
    try {
        const response = await fetch(`${API_BASE_URL}/pedidos/${id}/entregar`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Error');
        fetchAdminPedidos();
    } catch (error) {
        alert(error.message);
    }
}

async function cancelarAdminPedido(id) {
    const token = getToken();
    if (!confirm('¿Seguro que deseas cancelar este pedido?')) return;
    try {
        const response = await fetch(`${API_BASE_URL}/pedidos/${id}/cancelar`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Error');
        fetchAdminPedidos();
    } catch (error) {
        alert(error.message);
    }
}

async function eliminarAdminPedido(id) {
    const token = getToken();
    if (!confirm('¿Seguro que deseas eliminar este pedido permanentemente?')) return;
    try {
        const response = await fetch(`${API_BASE_URL}/pedidos/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Error');
        fetchAdminPedidos();
    } catch (error) {
        alert(error.message);
    }
}

// Nueva función para mostrar el menú en modo lectura para admin
async function fetchAdminMenuView() {
    try {
        const response = await fetch(`${API_BASE_URL}/platos`);
        const platos = await response.json();
        renderAdminMenuView(platos);
    } catch (error) {
        document.getElementById('admin-menu-view').innerHTML = '<p>Error al cargar el menú.</p>';
    }
}

function renderAdminMenuView(platos) {
    const container = document.getElementById('admin-menu-view');
    container.innerHTML = '';
    
    const agrupadosPorTipo = {
        principal: platos.filter(p => p.tipo === 'principal'),
        combo: platos.filter(p => p.tipo === 'combo'),
        postre: platos.filter(p => p.tipo === 'postre')
    };

    const config = {
        principal: { titulo: 'Hamburguesas', icono: '🍔' },
        combo: { titulo: 'Combos', icono: '🍟' },
        postre: { titulo: 'Postres', icono: '🍰' }
    };

    ['principal', 'combo', 'postre'].forEach(tipo => {
        if (agrupadosPorTipo[tipo].length > 0) {
            const tipoSection = document.createElement('div');
            tipoSection.className = 'tipo-section';
            tipoSection.innerHTML = `<h4 class="tipo-title-small">${config[tipo].icono} ${config[tipo].titulo}</h4>`;
            container.appendChild(tipoSection);

            const grid = document.createElement('div');
            grid.className = 'platos-grid-small';

            agrupadosPorTipo[tipo].forEach(plato => {
                const card = document.createElement('div');
                card.className = 'plato-card-small';
                card.innerHTML = `
                    <span class="plato-tipo tipo-${plato.tipo}">${plato.tipo}</span>
                    <h5>${plato.nombre}</h5>
                    <p>${plato.descripcion}</p>
                    <div class="plato-price">$${plato.precio}</div>
                `;
                grid.appendChild(card);
            });

            container.appendChild(grid);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    fetchMenu();
    updateUI(!!getToken());
});
