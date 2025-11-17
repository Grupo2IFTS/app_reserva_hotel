// Estado del panel de administración
let adminState = {
    currentPanel: 'usersPanel'
};

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
    await initializeAdminPanel();
    setupAdminEventListeners();
});

async function initializeAdminPanel() {
    // Verificar permisos de administrador
    await checkAdminPermissions();
    await loadUsers();
    showPanel('usersPanel');
}

async function checkAdminPermissions() {
    try {
        const response = await fetch('/api/user');
        const data = await response.json();
        
        if (!data.authenticated || data.user.rol !== 'admin') {
            alert('Acceso denegado. Se requieren privilegios de administrador.');
            window.location.href = 'index.html';
            return;
        }
    } catch (error) {
        console.error('Error verificando permisos:', error);
        alert('Error de autenticación');
        window.location.href = 'index.html';
    }
}

function setupAdminEventListeners() {
    // Navegación entre pestañas
    document.getElementById('usersTab').addEventListener('click', (e) => {
        e.preventDefault();
        showPanel('usersPanel');
        loadUsers();
    });
    
    document.getElementById('clientsTab').addEventListener('click', (e) => {
        e.preventDefault();
        showPanel('clientsPanel');
        loadClients();
    });
    
    document.getElementById('reservationsTab').addEventListener('click', (e) => {
        e.preventDefault();
        showPanel('reservationsPanel');
        loadAllReservations();
    });
    
    document.getElementById('hotelsTab').addEventListener('click', (e) => {
        e.preventDefault();
        showPanel('hotelsPanel');
        loadHotelsAdmin();
    });
    
    // Botones de actualización
    document.getElementById('refreshUsers').addEventListener('click', loadUsers);
    document.getElementById('refreshClients').addEventListener('click', loadClients);
    document.getElementById('refreshReservations').addEventListener('click', loadAllReservations);
    document.getElementById('refreshHotels').addEventListener('click', loadHotelsAdmin);
}

function showPanel(panelId) {
    // Ocultar todos los panels
    document.querySelectorAll('[id$="Panel"]').forEach(panel => {
        panel.classList.add('hidden');
    });
    
    // Mostrar panel seleccionado
    const panel = document.getElementById(panelId);
    if (panel) {
        panel.classList.remove('hidden');
        adminState.currentPanel = panelId;
    }
}

// Cargar usuarios
async function loadUsers() {
    try {
        const response = await fetch('/api/admin/usuarios');
        if (!response.ok) throw new Error('Error en la respuesta');
        const usuarios = await response.json();
        displayUsers(usuarios);
    } catch (error) {
        console.error('Error cargando usuarios:', error);
        alert('Error al cargar usuarios');
    }
}

// Cargar clientes
async function loadClients() {
    try {
        const response = await fetch('/api/admin/clientes');
        if (!response.ok) throw new Error('Error en la respuesta');
        const clientes = await response.json();
        displayClients(clientes);
    } catch (error) {
        console.error('Error cargando clientes:', error);
        alert('Error al cargar clientes');
    }
}

// Cargar todas las reservas
async function loadAllReservations() {
    try {
        const response = await fetch('/api/admin/reservas');
        if (!response.ok) throw new Error('Error en la respuesta');
        const reservas = await response.json();
        displayAllReservations(reservas);
    } catch (error) {
        console.error('Error cargando reservas:', error);
        alert('Error al cargar reservas');
    }
}

// Cargar hoteles para administración
async function loadHotelsAdmin() {
    try {
        const response = await fetch('/api/hoteles');
        if (!response.ok) throw new Error('Error en la respuesta');
        const hoteles = await response.json();
        displayHotelsAdmin(hoteles);
    } catch (error) {
        console.error('Error cargando hoteles:', error);
        alert('Error al cargar hoteles');
    }
}

// Funciones de display
function displayUsers(usuarios) {
    const container = document.getElementById('usersList');
    if (!usuarios || usuarios.length === 0) {
        container.innerHTML = '<p>No hay usuarios registrados</p>';
        return;
    }
    
    container.innerHTML = usuarios.map(user => `
        <div class="admin-card">
            <h3>${user.email} <span class="role-badge ${user.rol}">${user.rol}</span></h3>
            <p><strong>ID:</strong> ${user.id_usuario}</p>
            <p><strong>Nombre:</strong> ${user.nombre || 'N/A'} ${user.apellido || ''}</p>
            <p><strong>Fecha registro:</strong> ${formatDateTimeSafe(user.fecha_registro)}</p>
            <p><strong>Activo:</strong> ${user.activo ? 'Sí' : 'No'}</p>
            <div class="admin-actions">
                <button class="delete-btn" onclick="deleteUser(${user.id_usuario})" ${user.rol === 'admin' ? 'disabled' : ''}>
                    <i class="fas fa-trash"></i> Eliminar
                </button>
                ${user.activo ? 
                    `<button class="disable-btn" onclick="toggleUserStatus(${user.id_usuario}, false)">
                        <i class="fas fa-ban"></i> Desactivar
                    </button>` :
                    `<button class="enable-btn" onclick="toggleUserStatus(${user.id_usuario}, true)">
                        <i class="fas fa-check"></i> Activar
                    </button>`
                }
            </div>
        </div>
    `).join('');
}

function displayClients(clientes) {
    const container = document.getElementById('clientsList');
    if (!clientes || clientes.length === 0) {
        container.innerHTML = '<p>No hay clientes registrados</p>';
        return;
    }
    
    container.innerHTML = clientes.map(cliente => `
        <div class="admin-card">
            <h3>${cliente.nombre} ${cliente.apellido}</h3>
            <p><strong>ID:</strong> ${cliente.id_cliente}</p>
            <p><strong>Email:</strong> ${cliente.email}</p>
            <p><strong>DNI:</strong> ${cliente.dni}</p>
            <p><strong>Teléfono:</strong> ${cliente.telefono}</p>
            <p><strong>Activo:</strong> ${cliente.activo ? 'Sí' : 'No'}</p>
            <div class="admin-actions">
                <button class="delete-btn" onclick="deleteClient(${cliente.id_cliente})">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </div>
        </div>
    `).join('');
}

function displayAllReservations(reservas) {
    const container = document.getElementById('reservationsList');
    if (!reservas || reservas.length === 0) {
        container.innerHTML = '<p>No hay reservas registradas</p>';
        return;
    }
    
    container.innerHTML = reservas.map(reserva => `
        <div class="admin-card">
            <h3>Reserva #${reserva.id_reserva}</h3>
            <p><strong>Cliente:</strong> ${reserva.nombre} ${reserva.apellido} (${reserva.email})</p>
            <p><strong>Hotel:</strong> ${reserva.nombre_hotel}</p>
            <p><strong>Habitación:</strong> ${reserva.numero} (${reserva.tipo})</p>
            <p><strong>Check-in:</strong> ${formatDateSafe(reserva.fecha_checkin)}</p>
            <p><strong>Check-out:</strong> ${formatDateSafe(reserva.fecha_checkout)}</p>
            <p><strong>Estado:</strong> <span class="reserva-estado ${reserva.estado.toLowerCase()}">${reserva.estado}</span></p>
            <p><strong>Importe total:</strong> $${reserva.importe_total}</p>
            <p><strong>Fecha reserva:</strong> ${formatDateTimeSafe(reserva.fecha_reserva)}</p>
            <div class="admin-actions">
                <button class="delete-btn" onclick="deleteReservationAdmin(${reserva.id_reserva})">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </div>
        </div>
    `).join('');
}

function displayHotelsAdmin(hoteles) {
    const container = document.getElementById('hotelsList');
    if (!hoteles || hoteles.length === 0) {
        container.innerHTML = '<p>No hay hoteles registrados</p>';
        return;
    }
    
    container.innerHTML = hoteles.map(hotel => `
        <div class="admin-card">
            <h3>${hotel.nombre_hotel}</h3>
            <p><strong>ID:</strong> ${hotel.id_hotel}</p>
            <p><strong>Dirección:</strong> ${hotel.direccion}</p>
            <p><strong>Teléfono:</strong> ${hotel.telefono}</p>
            <p><strong>Habitaciones:</strong> ${hotel.habitaciones ? hotel.habitaciones.length : 0}</p>
        </div>
    `).join('');
}

// Funciones para acciones de administración
async function deleteUser(userId) {
    if (!confirm('¿Está seguro de que desea eliminar este usuario? Esta acción no se puede deshacer.')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/usuarios/${userId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Usuario eliminado correctamente');
            await loadUsers();
        } else {
            alert(result.error);
        }
    } catch (error) {
        console.error('Error eliminando usuario:', error);
        alert('Error al eliminar usuario');
    }
}

async function deleteClient(clientId) {
    if (!confirm('¿Está seguro de que desea eliminar este cliente? Esta acción no se puede deshacer.')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/clientes/${clientId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Cliente eliminado correctamente');
            await loadClients();
        } else {
            alert(result.error);
        }
    } catch (error) {
        console.error('Error eliminando cliente:', error);
        alert('Error al eliminar cliente');
    }
}

async function deleteReservationAdmin(reservationId) {
    if (!confirm('¿Está seguro de que desea eliminar esta reserva? Esta acción no se puede deshacer.')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/reservas/${reservationId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Reserva eliminada correctamente');
            await loadAllReservations();
        } else {
            alert(result.error);
        }
    } catch (error) {
        console.error('Error eliminando reserva:', error);
        alert('Error al eliminar reserva');
    }
}

async function toggleUserStatus(userId, activo) {
    try {
        const response = await fetch(`/api/admin/usuarios/${userId}/estado`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ activo })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(result.message);
            await loadUsers();
        } else {
            alert(result.error);
        }
    } catch (error) {
        console.error('Error actualizando estado de usuario:', error);
        alert('Error al actualizar estado de usuario');
    }
}

// Funciones de formato de fecha (las mismas que en scripts.js)
function formatDateSafe(dateString) {
    if (!dateString) return 'Fecha no disponible';
    
    try {
        const datePart = dateString.split('T')[0].split(' ')[0];
        const [year, month, day] = datePart.split('-').map(Number);
        
        const date = new Date(year, month - 1, day);
        
        if (isNaN(date.getTime())) {
            return 'Fecha no disponible';
        }
        
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric'
        });
    } catch (error) {
        console.error('Error formateando fecha:', error, dateString);
        return 'Fecha no disponible';
    }
}

function formatDateTimeSafe(dateTimeString) {
    if (!dateTimeString) return 'Fecha no disponible';
    
    try {
        let date = new Date(dateTimeString);
        
        if (isNaN(date.getTime())) {
            return 'Fecha no disponible';
        }
        
        return date.toLocaleString('es-ES', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    } catch (error) {
        console.error('Error formateando fecha/hora:', error, dateTimeString);
        return 'Fecha no disponible';
    }
}