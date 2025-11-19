// Estado de la aplicación
let appState = {
  user: null,
  currentPage: 'homePage',
  searchResults: [],
  userReservations: []
};

// Elementos DOM
const pages = {
  homePage: document.getElementById('homePage'),
  loginPage: document.getElementById('loginPage'),
  registerPage: document.getElementById('registerPage'),
  reservationsPage: document.getElementById('reservationsPage')
};

const navLinks = {
  homeLink: document.getElementById('homeLink'),
  loginLink: document.getElementById('loginLink'),
  registerLink: document.getElementById('registerLink'),
  reservationsLink: document.getElementById('reservationsLink'),
  logoutLink: document.getElementById('logoutLink')
};

const messageDiv = document.getElementById('message');

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
  await initializeApp();
  setupEventListeners();
});

// Inicializar la aplicación
async function initializeApp() {
  // Cargar hoteles para el selector
  await loadHotels();

  // Verificar si el usuario está autenticado
  await checkAuthStatus();

  // Mostrar página inicial
  showPage('homePage');

  // Establecer fecha mínima para los date inputs (hoy)
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('checkin').min = today;
  document.getElementById('checkout').min = today;
}

// Configurar event listeners
function setupEventListeners() {
  // Navegación
  navLinks.homeLink.addEventListener('click', (e) => {
    e.preventDefault();
    clearSearchResults(); // Limpiar resultados al ir a home
    showPage('homePage');
  });

  navLinks.loginLink.addEventListener('click', (e) => {
    e.preventDefault();
    showPage('loginPage');
  });

  navLinks.registerLink.addEventListener('click', (e) => {
    e.preventDefault();
    showPage('registerPage');
  });

  navLinks.reservationsLink.addEventListener('click', (e) => {
    e.preventDefault();
    showPage('reservationsPage');
    loadUserReservations();
  });

  navLinks.logoutLink.addEventListener('click', (e) => {
    e.preventDefault();
    logout();
  });

  // Formularios
  document.getElementById('searchBtn').addEventListener('click', searchAvailability);
  document.getElementById('loginBtn').addEventListener('click', login);
  document.getElementById('registerBtn').addEventListener('click', register);

  // Enlaces entre formularios
  document.getElementById('showRegister').addEventListener('click', (e) => {
    e.preventDefault();
    showPage('registerPage');
  });

  document.getElementById('showLogin').addEventListener('click', (e) => {
    e.preventDefault();
    showPage('loginPage');
  });

  // Actualizar fecha mínima de checkout cuando cambia checkin
  document.getElementById('checkin').addEventListener('change', function () {
    const checkinDate = this.value;
    if (checkinDate) {
      const nextDay = new Date(checkinDate);
      nextDay.setDate(nextDay.getDate() + 1);
      document.getElementById('checkout').min = nextDay.toISOString().split('T')[0];

      // Si checkout es anterior al nuevo mínimo, resetearlo
      const checkoutDate = document.getElementById('checkout').value;
      if (checkoutDate && new Date(checkoutDate) <= new Date(checkinDate)) {
        document.getElementById('checkout').value = '';
      }
    }
  });
}

// Verificar estado de autenticación
async function checkAuthStatus() {
  try {
    console.log('FRONTEND: Verificando autenticación...');
    const response = await fetch('/api/user');
    const data = await response.json();

    console.log('FRONTEND: Estado autenticación:', data);

    if (data.authenticated) {
      appState.user = data.user;
      updateUIForAuthenticatedUser();
    } else {
      appState.user = null;
      updateUIForGuest();
    }
  } catch (error) {
    console.error('FRONTEND: Error verificando autenticación:', error);
    showMessage('Error de conexión', 'error');
  }
}

// Actualizar UI para usuario autenticado

function updateUIForAuthenticatedUser() {
  console.log('🔍 Actualizando UI para usuario autenticado:', appState.user);

  if (!navLinks) {
    console.error('ERROR: navLinks no está definido');
    return;
  }

  // Mostrar/ocultar elementos de navegación
  if (navLinks.loginLink) navLinks.loginLink.classList.add('hidden');
  if (navLinks.registerLink) navLinks.registerLink.classList.add('hidden');
  if (navLinks.reservationsLink) navLinks.reservationsLink.classList.remove('hidden');
  if (navLinks.logoutLink) navLinks.logoutLink.classList.remove('hidden');

  // Enlace de administración
  let adminLink = document.getElementById('adminLink');
  if (!adminLink) {
    console.log('Creando enlace de administración...');
    adminLink = document.createElement('a');
    adminLink.id = 'adminLink';
    adminLink.href = 'admin-panel.html';
    adminLink.innerHTML = '<i class="fas fa-cog"></i> Administración';
    adminLink.className = 'hidden';
    document.querySelector('.nav').appendChild(adminLink);
  }

  if (appState.user && appState.user.rol === 'admin') {
    adminLink.classList.remove('hidden');
    console.log('✅ Mostrando enlace de administración');
  } else {
    adminLink.classList.add('hidden');
  }

  // Saludo de usuario
  let userGreeting = document.getElementById('userGreeting');
  if (!userGreeting) {
    userGreeting = document.createElement('span');
    userGreeting.id = 'userGreeting';
    userGreeting.className = 'user-greeting';
    document.querySelector('.nav').appendChild(userGreeting);
  }

  // MOSTRAR NOMBRE CORRECTO
  const nombreUsuario = appState.user.nombre || appState.user.email;
  userGreeting.textContent = `Hola, ${nombreUsuario}`;
  console.log('Saludo actualizado:', userGreeting.textContent);

  console.log('UI actualizada correctamente');
}

// Actualizar UI para usuario invitado
function updateUIForGuest() {
  console.log('Actualizando UI para invitado');

  if (!navLinks) {
    console.error('ERROR: navLinks no está definido');
    return;
  }

  if (navLinks.loginLink) navLinks.loginLink.classList.remove('hidden');
  if (navLinks.registerLink) navLinks.registerLink.classList.remove('hidden');
  if (navLinks.reservationsLink) navLinks.reservationsLink.classList.add('hidden');
  if (navLinks.logoutLink) navLinks.logoutLink.classList.add('hidden');

  // Eliminar saludo de usuario si existe
  const userGreeting = document.getElementById('userGreeting');
  if (userGreeting) {
    userGreeting.remove();
  }

  // Ocultar enlace de administración
  const adminLink = document.getElementById('adminLink');
  if (adminLink) {
    adminLink.classList.add('hidden');
  }
}


// Mostrar página específica
function showPage(pageId) {
  // Ocultar todas las páginas
  Object.values(pages).forEach(page => {
    if (page) page.classList.add('hidden');
  });

  // Si vamos a la página de inicio, limpiar resultados de búsqueda
  if (pageId === 'homePage') {
    clearSearchResults();
  }

  // Mostrar página seleccionada
  if (pages[pageId]) {
    pages[pageId].classList.remove('hidden');
    appState.currentPage = pageId;
  }
}

// Función para limpiar resultados de búsqueda
function clearSearchResults() {
  const searchResultsSection = document.getElementById('searchResults');
  const hotelsResults = document.getElementById('hotelsResults');

  if (searchResultsSection) {
    searchResultsSection.classList.add('hidden');
  }

  if (hotelsResults) {
    hotelsResults.innerHTML = '';
  }

  // Limpiar el estado de búsqueda
  appState.searchResults = [];
}

// Función para limpiar formularios
function clearForms() {
  // Limpiar formulario de búsqueda
  const checkin = document.getElementById('checkin');
  const checkout = document.getElementById('checkout');
  const hotel = document.getElementById('hotel');

  if (checkin) checkin.value = '';
  if (checkout) checkout.value = '';
  if (hotel) hotel.selectedIndex = 0;

  // Limpiar formularios de login/registro
  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');
  const registerName = document.getElementById('registerName');
  const registerEmail = document.getElementById('registerEmail');
  const registerPassword = document.getElementById('registerPassword');
  const registerConfirmPassword = document.getElementById('registerConfirmPassword');

  if (loginEmail) loginEmail.value = '';
  if (loginPassword) loginPassword.value = '';
  if (registerName) registerName.value = '';
  if (registerEmail) registerEmail.value = '';
  if (registerPassword) registerPassword.value = '';
  if (registerConfirmPassword) registerConfirmPassword.value = '';
}

// Cargar hoteles para el selector
async function loadHotels() {
  try {
    const response = await fetch('/api/hoteles');

    if (!response.ok) {
      throw new Error('Error en la respuesta del servidor');
    }

    const hoteles = await response.json();

    const hotelSelect = document.getElementById('hotel');

    if (!hotelSelect) return;

    // Limpiar opciones excepto la primera
    while (hotelSelect.children.length > 1) {
      hotelSelect.removeChild(hotelSelect.lastChild);
    }

    // Agregar hoteles al selector
    hoteles.forEach(hotel => {
      const option = document.createElement('option');
      option.value = hotel.id_hotel;
      option.textContent = hotel.nombre_hotel;
      hotelSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error cargando hoteles:', error);
    showMessage('Error cargando la lista de hoteles', 'error');
  }
}

// Buscar disponibilidad
async function searchAvailability() {
  const checkin = document.getElementById('checkin').value;
  const checkout = document.getElementById('checkout').value;
  const hotel = document.getElementById('hotel').value;

  if (!checkin || !checkout) {
    showMessage('Por favor, complete las fechas de entrada y salida', 'error');
    return;
  }

  if (new Date(checkin) >= new Date(checkout)) {
    showMessage('La fecha de salida debe ser posterior a la fecha de entrada', 'error');
    return;
  }

  try {
    showMessage('Buscando disponibilidad...', 'success');

    const response = await fetch('/api/buscar-disponibilidad', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ checkin, checkout, hotel })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error en la búsqueda');
    }

    const resultados = await response.json();

    appState.searchResults = resultados;
    displaySearchResults(resultados);

    if (resultados.length === 0) {
      showMessage('No se encontraron habitaciones disponibles para los criterios seleccionados', 'error');
    } else {
      showMessage(`Se encontraron ${resultados.length} hotel(es) con disponibilidad`, 'success');
    }

  } catch (error) {
    console.error('Error en búsqueda:', error);
    showMessage(error.message || 'Error en la búsqueda de disponibilidad', 'error');
  }
}

// Mostrar resultados de búsqueda
function displaySearchResults(resultados) {
  const resultsContainer = document.getElementById('hotelsResults');
  const searchResultsSection = document.getElementById('searchResults');

  if (!resultsContainer || !searchResultsSection) return;

  if (resultados.length === 0) {
    resultsContainer.innerHTML = `
      <div class="hotel-card">
        <h3>No hay resultados</h3>
        <p>No se encontraron habitaciones disponibles para los criterios seleccionados.</p>
        <p>Intente con otras fechas o seleccione otro hotel.</p>
      </div>
    `;
  } else {
    resultsContainer.innerHTML = resultados.map(hotel => `
      <div class="hotel-card">
        <h3>${hotel.nombre_hotel}</h3>
        <p><strong><i class=" fa-solid fa-map-pin"></i> Dirección:</strong> ${hotel.direccion}</p>
        <p><strong><i class=" fa-solid fa-phone"></i> Teléfono:</strong> ${hotel.telefono}</p>
        <div class="room-list">
          ${hotel.habitaciones.map(habitacion => `
            <div class="room-card">
              <h4><i class=" fa-solid fa-bed"></i> Habitación ${habitacion.numero} - ${habitacion.tipo}</h4>
              <p><strong><i class=" fa-solid fa-people-group"></i> Capacidad:</strong> ${habitacion.capacidad} persona(s)</p>
              <p><strong><i class=" fa-solid fa-money-bill-1-wave"></i> Precio por noche:</strong> $${habitacion.precio_noche}</p>
              <p><strong><i class=" fa-solid fa-money-bill-1-wave"></i> Total estimado:</strong> $${calculateTotal(habitacion.precio_noche)}</p>
              <button class="reserve-btn" data-habitacion-id="${habitacion.id_habitacion}">
                ${appState.user ? '<i class=" fa-solid fa-bookmark"></i> Reservar Ahora' : '<i class=" fa-solid fa-key"></i> Iniciar sesión para reservar'}
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');

    // Agregar event listeners a los botones de reserva
    document.querySelectorAll('.reserve-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const habitacionId = e.target.getAttribute('data-habitacion-id');
        handleReservation(habitacionId);
      });
    });
  }

  searchResultsSection.classList.remove('hidden');
}

// En la función displaySearchResults, actualizar el cálculo de fechas
function calculateTotal(precioNoche) {
  const checkin = document.getElementById('checkin').value;
  const checkout = document.getElementById('checkout').value;

  if (!checkin || !checkout) return '0.00';

  try {
    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);

    if (isNaN(checkinDate.getTime()) || isNaN(checkoutDate.getTime())) {
      return '0.00';
    }

    const dias = Math.ceil(
      (checkoutDate - checkinDate) / (1000 * 60 * 60 * 24)
    );

    return (precioNoche * dias).toFixed(2);
  } catch (error) {
    console.error('Error calculando total:', error);
    return '0.00';
  }
}

// Calcular total estimado
function calculateTotal(precioNoche) {
  const checkin = document.getElementById('checkin').value;
  const checkout = document.getElementById('checkout').value;

  if (!checkin || !checkout) return '0.00';

  const dias = Math.ceil(
    (new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24)
  );

  return (precioNoche * dias).toFixed(2);
}

// Manejar reserva
function handleReservation(habitacionId) {
  if (!appState.user) {
    showMessage('Debe iniciar sesión para realizar una reserva', 'error');
    showPage('loginPage');
    return;
  }

  const checkin = document.getElementById('checkin').value;
  const checkout = document.getElementById('checkout').value;

  if (!checkin || !checkout) {
    showMessage('Por favor, complete las fechas de entrada y salida', 'error');
    return;
  }

  createReservation(habitacionId, checkin, checkout);
}

// Crear reserva
async function createReservation(habitacionId, checkin, checkout) {
  try {
    const response = await fetch('/api/reservas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fecha_checkin: checkin,
        fecha_checkout: checkout,
        id_habitacion: habitacionId
      })
    });

    const result = await response.json();

    if (result.success) {
      showMessage(`Reserva creada exitosamente! ID de reserva: ${result.id_reserva}. Total: $${result.importe_total}`, 'success');

      // Actualizar resultados de búsqueda después de 2 segundos
      setTimeout(async () => {
        await searchAvailability();
      }, 2000);

      // Si estamos en la página de reservas, actualizarlas
      if (appState.currentPage === 'reservationsPage') {
        await loadUserReservations();
      }
    } else {
      showMessage(result.error, 'error');
    }
  } catch (error) {
    console.error('Error creando reserva:', error);
    showMessage('Error al crear la reserva', 'error');
  }
}

// Iniciar sesión
async function login() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  console.log('🟡 FRONTEND: Intentando login...', { email, password });

  if (!email || !password) {
    showMessage('Por favor, complete todos los campos', 'error');
    return;
  }

  try {
    console.log('FRONTEND: Haciendo fetch a /api/login...');

    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    console.log('FRONTEND: Response status:', response.status);

    const result = await response.json();
    console.log('FRONTEND: Response data:', result);

    if (result.success) {
      console.log('FRONTEND: Login exitoso');
      showMessage('Inicio de sesión exitoso', 'success');
      appState.user = result.user;
      updateUIForAuthenticatedUser();
      showPage('homePage');

      // Limpiar formulario
      document.getElementById('loginEmail').value = '';
      document.getElementById('loginPassword').value = '';
    } else {
      console.log('FRONTEND: Error del servidor:', result.error);
      showMessage(result.error, 'error');
    }
  } catch (error) {
    console.error('FRONTEND: Error en login:', error);
    showMessage('Error al iniciar sesión', 'error');
  }
}

// Registrar usuario
async function register() {
  const name = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('registerConfirmPassword').value;

  if (!name || !email || !password || !confirmPassword) {
    showMessage('Por favor, complete todos los campos', 'error');
    return;
  }

  if (password !== confirmPassword) {
    showMessage('Las contraseñas no coinciden', 'error');
    return;
  }

  if (password.length < 6) {
    showMessage('La contraseña debe tener al menos 6 caracteres', 'error');
    return;
  }

  // Validar formato de email básico
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showMessage('Por favor, ingrese un email válido', 'error');
    return;
  }

  try {
    const response = await fetch('/api/registro', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nombre: name, email, password })
    });

    const result = await response.json();

    if (result.success) {
      showMessage(result.message, 'success');
      showPage('loginPage');

      // Limpiar formulario
      document.getElementById('registerName').value = '';
      document.getElementById('registerEmail').value = '';
      document.getElementById('registerPassword').value = '';
      document.getElementById('registerConfirmPassword').value = '';
    } else {
      showMessage(result.error, 'error');
    }
  } catch (error) {
    console.error('Error en registro:', error);
    showMessage('Error al registrar usuario', 'error');
  }
}

// Cerrar sesión
async function logout() {
  try {
    const response = await fetch('/api/logout', {
      method: 'POST'
    });

    const result = await response.json();

    if (result.success) {
      showMessage('Sesión cerrada correctamente', 'success');
      appState.user = null;
      updateUIForGuest();
      showPage('homePage');

      // LIMPIAR RESULTADOS DE BÚSQUEDA Y FORMULARIOS
      clearSearchResults();
      clearForms();
    }
  } catch (error) {
    console.error('Error en logout:', error);
    showMessage('Error al cerrar sesión', 'error');
  }
}

// Cargar reservas del usuario
async function loadUserReservations() {
  if (!appState.user) {
    showMessage('Debe iniciar sesión para ver sus reservas', 'error');
    showPage('loginPage');
    return;
  }

  try {
    const response = await fetch('/api/reservas');

    if (!response.ok) {
      throw new Error('Error al cargar las reservas');
    }

    const reservas = await response.json();

    appState.userReservations = reservas;
    displayUserReservations(reservas);
  } catch (error) {
    console.error('Error cargando reservas:', error);
    showMessage('Error al cargar las reservas', 'error');
  }
}

// Función para formatear fechas de manera segura

function formatDateSafe(dateString) {
  if (!dateString) return 'Fecha no disponible';

  try {
    // Si ya es un objeto Date
    if (dateString instanceof Date) {
      return dateString.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }

    // Si es string, manejar diferentes formatos
    if (typeof dateString === 'string') {
      // Para formato MySQL (YYYY-MM-DD)
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const [year, month, day] = dateString.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }

      // Para formato MySQL datetime (YYYY-MM-DD HH:MM:SS)
      if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateString)) {
        const [datePart, timePart] = dateString.split(' ');
        const [year, month, day] = datePart.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }

      // Para formato ISO
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
    }

    return 'Fecha no disponible';
  } catch (error) {
    console.error('Error formateando fecha:', error, dateString);
    return 'Fecha no disponible';
  }
}

// Función para formatear fecha y hora de manera segura
function formatDateTimeSafe(dateTimeString) {
  if (!dateTimeString) return 'Fecha no disponible';

  try {
    let date;

    // Para formato MySQL datetime
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateTimeString)) {
      const [datePart, timePart] = dateTimeString.split(' ');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hours, minutes, seconds] = timePart.split(':').map(Number);
      date = new Date(year, month - 1, day, hours, minutes, seconds);
    } else {
      // Para otros formatos
      date = new Date(dateTimeString);
    }

    if (isNaN(date.getTime())) {
      return 'Fecha no disponible';
    }

    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formateando fecha/hora:', error, dateTimeString);
    return 'Fecha no disponible';
  }
}

// Mostrar reservas del usuario
function displayUserReservations(reservas) {
  const reservationsContainer = document.getElementById('userReservations');

  if (!reservas || !Array.isArray(reservas)) {
    reservationsContainer.innerHTML = `
      <div class="reservation-card">
        <h3>Error al cargar reservas</h3>
        <p>No se pudieron cargar las reservas. Intente nuevamente.</p>
      </div>
    `;
    return;
  }

  if (reservas.length === 0) {
    reservationsContainer.innerHTML = `
      <div class="reservation-card">
        <h3>No tienes reservas</h3>
        <p>No has realizado ninguna reserva todavía.</p>
        <p>¡Busca habitaciones disponibles y haz tu primera reserva!</p>
        <button onclick="showPage('homePage')" class="reserve-btn">🔍 Buscar Habitaciones</button>
      </div>
    `;
  } else {
    reservationsContainer.innerHTML = reservas.map(reserva => {
      // Formatear fechas de manera segura
      const fechaCheckin = formatDateSafe(reserva.fecha_checkin);
      const fechaCheckout = formatDateSafe(reserva.fecha_checkout);
      const fechaReserva = formatDateTimeSafe(reserva.fecha_reserva);

      // Determinar si se puede pagar (solo reservas pendientes o confirmadas)
      const puedePagar = reserva.estado === 'pendiente' || reserva.estado === 'Confirmada';
      // Determinar si se puede cancelar (solo reservas no pagadas)
      const puedeCancelar = reserva.estado !== 'Pagada';

      return `
        <div class="reservation-card">
          <h3>Reserva #${reserva.id_reserva} - ${reserva.nombre_hotel}</h3>
          <p><strong>Habitación:</strong> ${reserva.numero} (${reserva.tipo})</p>
          <p><strong>Check-in:</strong> ${fechaCheckin}</p>
          <p><strong>Check-out:</strong> ${fechaCheckout}</p>
          <p><strong>Estado:</strong> <span class="reserva-estado ${reserva.estado.toLowerCase()}">${reserva.estado}</span></p>
          <p><strong>Importe total:</strong> $${reserva.importe_total}</p>
          <p><strong>Fecha de reserva:</strong> ${fechaReserva}</p>
          <div class="reservation-actions">
            ${puedePagar ? `<button class="pay-btn" onclick="payReservation(${reserva.id_reserva})">
              <i class="fas fa-credit-card"></i> Pagar Reserva
            </button>` : ''}
            ${puedeCancelar ? `<button class="cancel-btn" onclick="cancelReservation(${reserva.id_reserva})">
              <i class="fas fa-trash"></i> Cancelar Reserva
            </button>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }
}

// Función para pagar reserva
async function payReservation(reservaId) {
  if (!confirm('¿Está seguro de que desea proceder con el pago de esta reserva?')) {
    return;
  }

  try {
    const response = await fetch(`/api/reservas/${reservaId}/pagar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();

    if (result.success) {
      showMessage('Pago procesado correctamente', 'success');
      // Recargar las reservas
      await loadUserReservations();
    } else {
      showMessage(result.error, 'error');
    }
  } catch (error) {
    console.error('Error procesando pago:', error);
    showMessage('Error al procesar el pago', 'error');
  }
}

// Función para cancelar reserva
async function cancelReservation(reservaId) {
  if (!confirm('¿Está seguro de que desea cancelar esta reserva? Esta acción no se puede deshacer.')) {
    return;
  }

  try {
    const response = await fetch(`/api/reservas/${reservaId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();

    if (result.success) {
      showMessage('Reserva cancelada correctamente', 'success');
      // Recargar las reservas
      await loadUserReservations();
    } else {
      showMessage(result.error, 'error');
    }
  } catch (error) {
    console.error('Error cancelando reserva:', error);
    showMessage('Error al cancelar la reserva', 'error');
  }
}

// Mostrar mensajes
function showMessage(message, type) {
  if (!messageDiv) return;

  messageDiv.textContent = message;
  messageDiv.className = type;
  messageDiv.classList.remove('hidden');

  // Scroll to message
  messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  // Auto-ocultar después de 5 segundos (excepto para errores importantes)
  if (type !== 'error' || !message.includes('Error')) {
    setTimeout(() => {
      messageDiv.classList.add('hidden');
    }, 5000);
  }
}

// Función temporal para debuggear las fechas
function debugDates(reservas) {
  console.log('=== DEBUG FECHAS ===');
  reservas.forEach((reserva, index) => {
    console.log(`Reserva ${index + 1}:`, {
      id: reserva.id_reserva,
      checkin: reserva.fecha_checkin,
      checkout: reserva.fecha_checkout,
      fecha_reserva: reserva.fecha_reserva,
      checkinRaw: reserva.fecha_checkin,
      checkoutRaw: reserva.fecha_checkout,
      fechaReservaRaw: reserva.fecha_reserva
    });

    // Intentar diferentes formas de parsear
    console.log('Check-in parsing attempts:');
    console.log('  new Date():', new Date(reserva.fecha_checkin));
    console.log('  Date.parse():', Date.parse(reserva.fecha_checkin));
  });
  console.log('=== FIN DEBUG ===');
}

// Función global para navegación desde HTML
window.showPage = showPage;
window.clearSearchResults = clearSearchResults;