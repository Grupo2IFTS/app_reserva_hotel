const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware básico
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Configuración de sesiones
app.use(session({
  secret: 'hotel-reservation-secret-key-2025',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 horas
}));

// Middleware para convertir BigInt en respuestas JSON
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function (data) {
    const convertedData = convertBigInt(data);
    originalJson.call(this, convertedData);
  };
  next();
});

// Middleware para verificar autenticación
const requireAuth = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ error: 'No autorizado. Debe iniciar sesión.' });
  }
};

// Middleware para verificar rol de administrador
function requireAdmin(req, res, next) {
  console.log('Usuario en sesión:', req.session.user); // Para debug

  if (!req.session.user) {
    return res.status(401).json({
      success: false,
      error: 'No autenticado'
    });
  }

  if (req.session.user.rol !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado. Se requieren privilegios de administrador.'
    });
  }

  next();
}

// APLICAR MIDDLEWARE DE ADMIN AQUÍ - después de definir requireAdmin
app.use('/api/admin', requireAdmin);

// Función para convertir BigInt a Number
function convertBigInt(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'bigint') {
    return Number(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => convertBigInt(item));
  }

  if (typeof obj === 'object') {
    const newObj = {};
    for (const [key, value] of Object.entries(obj)) {
      newObj[key] = convertBigInt(value);
    }
    return newObj;
  }

  return obj;
}

// Función auxiliar para ejecutar consultas (reemplaza executeQuery)
async function executeQuery(query, params = []) {
  let conn;
  try {
    conn = await db.getConnection();
    const results = await conn.query(query, params);
    return db.processResults(results);
  } catch (error) {
    console.error('Error en consulta:', error);
    throw error;
  } finally {
    if (conn) await conn.release();
  }
}

// ===== RUTAS PÚBLICAS =====

// Obtener todos los hoteles
app.get('/api/hoteles', async (req, res) => {
  try {
    const conn = await db.getConnection();
    const hoteles = await conn.query(`
      SELECT h.*, hab.id_habitacion, hab.numero, hab.tipo, hab.precio_noche, 
             hab.estado, hab.capacidad
      FROM Hotel h
      LEFT JOIN Habitacion hab ON h.id_hotel = hab.id_hotel
      ORDER BY h.id_hotel, hab.numero
    `);

    const processedHoteles = db.processResults(hoteles);
    const hotelesAgrupados = {};

    processedHoteles.forEach(row => {
      if (!hotelesAgrupados[row.id_hotel]) {
        hotelesAgrupados[row.id_hotel] = {
          id_hotel: Number(row.id_hotel),
          nombre_hotel: row.nombre_hotel,
          direccion: row.direccion,
          telefono: row.telefono,
          habitaciones: []
        };
      }

      if (row.id_habitacion) {
        hotelesAgrupados[row.id_hotel].habitaciones.push({
          id_habitacion: Number(row.id_habitacion),
          numero: row.numero,
          tipo: row.tipo,
          precio_noche: Number(row.precio_noche),
          estado: row.estado,
          capacidad: Number(row.capacidad)
        });
      }
    });

    await conn.release();
    res.json(Object.values(hotelesAgrupados));
  } catch (error) {
    console.error('Error obteniendo hoteles:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Buscar disponibilidad
app.post('/api/buscar-disponibilidad', async (req, res) => {
  try {
    const { checkin, checkout, hotel } = req.body;

    if (!checkin || !checkout) {
      return res.status(400).json({ error: 'Las fechas son obligatorias' });
    }

    if (new Date(checkin) >= new Date(checkout)) {
      return res.status(400).json({ error: 'La fecha de salida debe ser posterior a la fecha de entrada' });
    }

    const conn = await db.getConnection();

    let query = `
      SELECT h.*, hab.id_habitacion, hab.numero, hab.tipo, hab.precio_noche, 
             hab.estado, hab.capacidad
      FROM Hotel h
      JOIN Habitacion hab ON h.id_hotel = hab.id_hotel
      WHERE hab.estado = 'D' 
        AND hab.id_habitacion NOT IN (
          SELECT r.id_habitacion 
          FROM Reserva r 
          WHERE (r.fecha_checkin <= ? AND r.fecha_checkout >= ?)
             OR (r.fecha_checkin <= ? AND r.fecha_checkout >= ?)
             OR (r.fecha_checkin >= ? AND r.fecha_checkout <= ?)
        )
    `;

    const params = [checkout, checkin, checkin, checkout, checkin, checkout];

    if (hotel) {
      query += ' AND h.id_hotel = ?';
      params.push(hotel);
    }

    query += ' ORDER BY h.id_hotel, hab.precio_noche';

    const resultados = await conn.query(query, params);
    const processedResultados = db.processResults(resultados);
    const hotelesDisponibles = {};

    processedResultados.forEach(row => {
      if (!hotelesDisponibles[row.id_hotel]) {
        hotelesDisponibles[row.id_hotel] = {
          id_hotel: Number(row.id_hotel),
          nombre_hotel: row.nombre_hotel,
          direccion: row.direccion,
          telefono: row.telefono,
          habitaciones: []
        };
      }

      hotelesDisponibles[row.id_hotel].habitaciones.push({
        id_habitacion: Number(row.id_habitacion),
        numero: row.numero,
        tipo: row.tipo,
        precio_noche: Number(row.precio_noche),
        estado: row.estado,
        capacidad: Number(row.capacidad)
      });
    });

    await conn.release();
    res.json(Object.values(hotelesDisponibles));
  } catch (error) {
    console.error('Error en búsqueda de disponibilidad:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Registro de usuario
app.post('/api/registro', async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const conn = await db.getConnection();

    // Verificar si el email ya existe
    const usuarioExistente = await conn.query(
      'SELECT id_usuario FROM Usuario WHERE email = ?',
      [email]
    );

    if (usuarioExistente.length > 0) {
      await conn.release();
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const resultadoUsuario = await conn.query(
      'INSERT INTO Usuario (email, password, fecha_registro, activo, rol) VALUES (?, ?, NOW(), 1, "cliente")',
      [email, hashedPassword]
    );

    const idUsuario = Number(resultadoUsuario.insertId);

    // Crear cliente
    const nombreCompleto = nombre.split(' ');
    const primerNombre = nombreCompleto[0];
    const apellido = nombreCompleto.slice(1).join(' ') || 'Usuario';
    const dniTemporal = Math.random().toString().substr(2, 8);

    await conn.query(
      'INSERT INTO Cliente (nombre, apellido, dni, email, telefono, id_usuario) VALUES (?, ?, ?, ?, ?, ?)',
      [primerNombre, apellido, dniTemporal, email, '000000000', idUsuario]
    );

    await conn.release();

    res.json({
      success: true,
      message: 'Usuario registrado correctamente. Ahora puede iniciar sesión.'
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Login de usuario
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔐 === DEBUG LOGIN INICIADO ===');
    console.log('📧 Email recibido:', email);
    console.log('🔑 Contraseña recibida:', password);
    
    const conn = await db.getConnection();

    // CONSULTA CON DEBUG
    const query = `SELECT 
      u.id_usuario, 
      u.email, 
      u.password, 
      u.fecha_registro, 
      u.activo, 
      u.rol, 
      u.id_cliente as usuario_id_cliente,
      c.id_cliente as cliente_id_cliente,
      c.nombre, 
      c.apellido 
     FROM Usuario u 
     LEFT JOIN Cliente c ON u.id_cliente = c.id_cliente 
     WHERE u.email = ? AND u.activo = 1`;
    
    console.log('📝 Ejecutando query...');
    
    const usuarios = await conn.query(query, [email]);
    
    console.log('👥 Usuarios encontrados:', usuarios.length);
    
    if (usuarios.length === 0) {
      console.log('❌ ERROR: No se encontró usuario con ese email');
      await conn.release();
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const usuario = db.processResults(usuarios)[0];
    
    console.log('✅ Usuario encontrado:', {
      id: usuario.id_usuario,
      email: usuario.email,
      rol: usuario.rol,
      activo: usuario.activo,
      password: usuario.password ? `[HASH: ${usuario.password.substring(0, 20)}...]` : 'NULL'
    });

    // VERIFICAR CONTRASEÑA
    console.log('🔍 Comparando contraseñas...');
    console.log('   Contraseña ingresada:', password);
    console.log('   Hash en BD:', usuario.password);
    
    const passwordValido = await bcrypt.compare(password, usuario.password);
    console.log('🔐 Resultado comparación:', passwordValido);

    if (!passwordValido) {
      console.log('❌ ERROR: Contraseña incorrecta');
      await conn.release();
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // CREAR SESIÓN
    req.session.user = {
      id_usuario: Number(usuario.id_usuario),
      id_cliente: usuario.usuario_id_cliente ? Number(usuario.usuario_id_cliente) : null,
      email: usuario.email,
      nombre: usuario.nombre || 'Administrador',
      apellido: usuario.apellido || 'Sistema',
      rol: usuario.rol
    };
    
    console.log('🎉 SESIÓN CREADA:', req.session.user);
    await conn.release();

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      user: req.session.user
    });
    
  } catch (error) {
    console.error('💥 ERROR en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Cerrar sesión
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Error al cerrar sesión' });
    }
    res.json({ success: true, message: 'Sesión cerrada correctamente' });
  });
});

// Verificar estado de autenticación
app.get('/api/user', (req, res) => {
  if (req.session.user) {
    res.json({ authenticated: true, user: req.session.user });
  } else {
    res.json({ authenticated: false });
  }
});

// ===== RUTAS DE USUARIO AUTENTICADO =====

// Obtener reservas del usuario
app.get('/api/reservas', requireAuth, async (req, res) => {
  try {
    const idCliente = req.session.user.id_cliente;

    const conn = await db.getConnection();
    const reservas = await conn.query(`
      SELECT r.*, h.nombre_hotel, hab.numero, hab.tipo
      FROM Reserva r
      JOIN Habitacion hab ON r.id_habitacion = hab.id_habitacion
      JOIN Hotel h ON hab.id_hotel = h.id_hotel
      WHERE r.id_cliente = ?
      ORDER BY r.fecha_reserva DESC
    `, [idCliente]);

    const processedReservas = db.processResults(reservas).map(reserva => ({
      ...reserva,
      id_reserva: Number(reserva.id_reserva),
      id_habitacion: Number(reserva.id_habitacion),
      id_cliente: Number(reserva.id_cliente),
      importe_total: Number(reserva.importe_total)
    }));

    await conn.release();
    res.json(processedReservas);
  } catch (error) {
    console.error('Error obteniendo reservas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear reserva
app.post('/api/reservas', requireAuth, async (req, res) => {
  try {
    const { fecha_checkin, fecha_checkout, id_habitacion } = req.body;
    const idCliente = req.session.user.id_cliente;

    if (!fecha_checkin || !fecha_checkout || !id_habitacion) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    const conn = await db.getConnection();

    // Verificar disponibilidad
    const habitacionDisponible = await conn.query(`
      SELECT hab.*, h.nombre_hotel
      FROM Habitacion hab
      JOIN Hotel h ON hab.id_hotel = h.id_hotel
      WHERE hab.id_habitacion = ? 
        AND hab.estado = 'D'
        AND hab.id_habitacion NOT IN (
          SELECT r.id_habitacion 
          FROM Reserva r 
          WHERE (r.fecha_checkin <= ? AND r.fecha_checkout >= ?)
             OR (r.fecha_checkin <= ? AND r.fecha_checkout >= ?)
             OR (r.fecha_checkin >= ? AND r.fecha_checkout <= ?)
        )
    `, [id_habitacion, fecha_checkout, fecha_checkin, fecha_checkin, fecha_checkout, fecha_checkin, fecha_checkout]);

    if (habitacionDisponible.length === 0) {
      await conn.release();
      return res.status(400).json({ error: 'La habitación no está disponible para las fechas seleccionadas' });
    }

    // Calcular importe total
    const dias = Math.ceil(
      (new Date(fecha_checkout) - new Date(fecha_checkin)) / (1000 * 60 * 60 * 24)
    );

    const importe_total = habitacionDisponible[0].precio_noche * dias;

    // Crear reserva
    const resultadoReserva = await conn.query(`
      INSERT INTO Reserva (fecha_checkin, fecha_checkout, estado, id_habitacion, id_cliente, importe_total, fecha_reserva)
      VALUES (?, ?, 'Confirmada', ?, ?, ?, NOW())
    `, [fecha_checkin, fecha_checkout, id_habitacion, idCliente, importe_total]);

    const idReserva = Number(resultadoReserva.insertId);

    // Actualizar estado de la habitación
    await conn.query(
      'UPDATE Habitacion SET estado = "R" WHERE id_habitacion = ?',
      [id_habitacion]
    );

    await conn.release();

    res.json({
      success: true,
      message: 'Reserva creada correctamente',
      id_reserva: idReserva,
      importe_total: importe_total
    });
  } catch (error) {
    console.error('Error creando reserva:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Pagar reserva
app.post('/api/reservas/:id/pagar', requireAuth, async (req, res) => {
  try {
    const reservaId = req.params.id;
    const idCliente = req.session.user.id_cliente;

    const conn = await db.getConnection();

    // Verificar que la reserva existe y pertenece al usuario
    const reserva = await conn.query(
      'SELECT * FROM Reserva WHERE id_reserva = ? AND id_cliente = ?',
      [reservaId, idCliente]
    );

    if (reserva.length === 0) {
      await conn.release();
      return res.json({ success: false, error: 'Reserva no encontrada' });
    }

    // Actualizar estado a "Pagada"
    await conn.query(
      'UPDATE Reserva SET estado = "Pagada" WHERE id_reserva = ?',
      [reservaId]
    );

    await conn.release();

    res.json({ success: true, message: 'Reserva pagada correctamente' });
  } catch (error) {
    console.error('Error pagando reserva:', error);
    res.json({ success: false, error: 'Error al procesar el pago' });
  }
});

// Cancelar reserva
app.delete('/api/reservas/:id', requireAuth, async (req, res) => {
  try {
    const reservaId = req.params.id;
    const idCliente = req.session.user.id_cliente;

    const conn = await db.getConnection();

    // Verificar que la reserva existe y pertenece al usuario
    const reserva = await conn.query(
      'SELECT * FROM Reserva WHERE id_reserva = ? AND id_cliente = ?',
      [reservaId, idCliente]
    );

    if (reserva.length === 0) {
      await conn.release();
      return res.json({ success: false, error: 'Reserva no encontrada' });
    }

    // Obtener id_habitacion para liberarla
    const idHabitacion = reserva[0].id_habitacion;

    // Eliminar la reserva
    await conn.query(
      'DELETE FROM Reserva WHERE id_reserva = ?',
      [reservaId]
    );

    // Liberar la habitación
    await conn.query(
      'UPDATE Habitacion SET estado = "D" WHERE id_habitacion = ?',
      [idHabitacion]
    );

    await conn.release();

    res.json({ success: true, message: 'Reserva cancelada correctamente' });
  } catch (error) {
    console.error('Error cancelando reserva:', error);
    res.json({ success: false, error: 'Error al cancelar la reserva' });
  }
});

// ===== RUTAS DE ADMINISTRACIÓN =====

// Obtener todos los usuarios
app.get('/api/admin/usuarios', async (req, res) => {
  try {
    const usuarios = await executeQuery(`
            SELECT u.*, c.nombre, c.apellido 
            FROM Usuario u 
            LEFT JOIN Cliente c ON u.id_usuario = c.id_usuario
        `);
    res.json(usuarios);
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Obtener todos los clientes
app.get('/api/admin/clientes', async (req, res) => {
  try {
    const clientes = await executeQuery('SELECT * FROM Cliente');
    res.json(clientes);
  } catch (error) {
    console.error('Error obteniendo clientes:', error);
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
});

// Obtener todas las reservas
app.get('/api/admin/reservas', async (req, res) => {
  try {
    const reservas = await executeQuery(`
            SELECT r.*, c.nombre, c.apellido, c.email, h.nombre_hotel, hab.numero, hab.tipo
            FROM Reserva r
            JOIN Cliente c ON r.id_cliente = c.id_cliente
            JOIN Habitacion hab ON r.id_habitacion = hab.id_habitacion
            JOIN Hotel h ON hab.id_hotel = h.id_hotel
            ORDER BY r.fecha_reserva DESC
        `);
    res.json(reservas);
  } catch (error) {
    console.error('Error obteniendo reservas:', error);
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
});

// Eliminar usuario
app.delete('/api/admin/usuarios/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    await executeQuery('DELETE FROM Usuario WHERE id_usuario = ?', [userId]);
    res.json({ success: true, message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.json({ success: false, error: 'Error al eliminar usuario' });
  }
});

// Eliminar cliente
app.delete('/api/admin/clientes/:id', async (req, res) => {
  try {
    const clientId = req.params.id;
    await executeQuery('DELETE FROM Cliente WHERE id_cliente = ?', [clientId]);
    res.json({ success: true, message: 'Cliente eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando cliente:', error);
    res.json({ success: false, error: 'Error al eliminar cliente' });
  }
});

// Eliminar reserva (admin)
app.delete('/api/admin/reservas/:id', async (req, res) => {
  try {
    const reservaId = req.params.id;
    await executeQuery('DELETE FROM Reserva WHERE id_reserva = ?', [reservaId]);
    res.json({ success: true, message: 'Reserva eliminada correctamente' });
  } catch (error) {
    console.error('Error eliminando reserva:', error);
    res.json({ success: false, error: 'Error al eliminar reserva' });
  }
});

// Cambiar estado de usuario
app.put('/api/admin/usuarios/:id/estado', async (req, res) => {
  try {
    const userId = req.params.id;
    const { activo } = req.body;

    await executeQuery(
      'UPDATE Usuario SET activo = ? WHERE id_usuario = ?',
      [activo, userId]
    );

    res.json({
      success: true,
      message: activo ? 'Usuario activado correctamente' : 'Usuario desactivado correctamente'
    });
  } catch (error) {
    console.error('Error actualizando estado de usuario:', error);
    res.json({ success: false, error: 'Error al actualizar estado de usuario' });
  }
});

// Ruta para servir la aplicación principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`Directorio público: ${path.join(__dirname, '../public')}`);
});


/* // Ruta temporal para debug de admin
app.get('/api/debug/admin', (req, res) => {
    res.json({
        sessionUser: req.session.user,
        isAdmin: req.session.user && req.session.user.rol === 'admin',
        sessionId: req.sessionID
    });
}); */