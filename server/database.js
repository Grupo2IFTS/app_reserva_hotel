const mariadb = require('mariadb');

// Configuración de la conexión a la base de datos
const pool = mariadb.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Admin12345',
  database: 'sistema_hoteles',
  connectionLimit: 5,
  acquireTimeout: 60000,
  reconnect: true,
  // Configuración para manejar BigInt
  bigIntAsNumber: true, // Convierte BIGINT a number en lugar de BigInt
  insertIdAsNumber: true, // Convierte el último ID insertado a number
  decimalAsNumber: false, // Mantiene DECIMAL como string para precisión
});

// Función para procesar resultados y convertir BigInt
function processResults(rows) {
  if (Array.isArray(rows)) {
    return rows.map(row => processRow(row));
  } else if (rows && typeof rows === 'object') {
    return processRow(rows);
  }
  return rows;
}

// Función para procesar una fila individual
function processRow(row) {
  const processed = {};
  for (const [key, value] of Object.entries(row)) {
    if (typeof value === 'bigint') {
      processed[key] = Number(value);
    } else {
      processed[key] = value;
    }
  }
  return processed;
}

// Función para obtener conexión
async function getConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Conexión a la base de datos establecida');
    return connection;
  } catch (error) {
    console.error('Error conectando a la base de datos:', error);
    throw error;
  }
}

// Función para ejecutar consultas con procesamiento de resultados
async function executeQuery(query, params = []) {
  let conn;
  try {
    conn = await getConnection();
    const results = await conn.query(query, params);
    return processResults(results);
  } catch (error) {
    console.error('Error en consulta:', error);
    throw error;
  } finally {
    if (conn) await conn.release();
  }
}

// Probar la conexión al iniciar
async function testConnection() {
  try {
    const conn = await getConnection();
    console.log('Base de datos conectada correctamente');
    await conn.release();
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error.message);
  }
}

// Ejecutar prueba de conexión
testConnection();

module.exports = { 
  getConnection, 
  pool, 
  executeQuery,
  processResults 
};