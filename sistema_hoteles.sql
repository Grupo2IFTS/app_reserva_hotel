-- phpMyAdmin SQL Dump
-- version 5.2.1deb3
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost:3306
-- Tiempo de generación: 19-11-2025 a las 22:34:44
-- Versión del servidor: 10.11.13-MariaDB-0ubuntu0.24.04.1
-- Versión de PHP: 8.3.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `sistema_hoteles`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Cliente`
--

CREATE TABLE `Cliente` (
  `id_cliente` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `apellido` varchar(50) NOT NULL,
  `dni` varchar(20) NOT NULL,
  `email` varchar(100) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `id_usuario` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `Cliente`
--

INSERT INTO `Cliente` (`id_cliente`, `nombre`, `apellido`, `dni`, `email`, `telefono`, `id_usuario`) VALUES
(6, 'Pablo', 'Calderon', '70488719', 'pablo@calderon.com.ar', '000000000', 10),
(7, 'Roberto', 'Perfumo', '41626768', 'roberto@perfumo.com', '000000000', 11),
(8, 'Carlos', 'López', '11222333C', 'cliente3@email.com', '+34 600 555 666', 12),
(9, 'Ana', 'Martínez', '44555666D', 'cliente4@email.com', '+34 600 777 888', 13),
(10, 'David', 'García', '77888999E', 'cliente5@email.com', '+34 600 999 000', 14),
(11, 'Laura', 'Fernández', '33444555F', 'viajero@email.com', '+34 611 222 333', 15),
(13, 'Diego', 'Maradona', '08937062', 'diego@maradona.com', '000000000', 17),
(14, 'Jose', 'de San Martin', '42796166', 'pepesanmartin@email.com', '000000000', 18),
(15, 'Manuel', 'Belgrano', '61315634', 'mbelgrano@email.com', '000000000', 19),
(16, 'Diego', 'Maradona', '98731429', 'dmaradona@email.com', '000000000', 20),
(20, 'Admin', 'Sistema', '00000000', 'admin@hotel.com', '000000000', 29),
(23, 'Lionel', 'Messi', '44687929', 'lmessi@email.com', '000000000', 34),
(24, 'Leo', 'Messi', '87708253', 'leomessi@gmail.com', '000000000', 35),
(25, 'Pablo', 'Aimar', 'TEMP_24810', 'paimar@gmail.com', '000000000', 36),
(26, 'Jose', 'de San Martin', 'TEMP_08417', 'jose@sanmartin.com', '000000000', 37);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Habitacion`
--

CREATE TABLE `Habitacion` (
  `id_habitacion` int(11) NOT NULL,
  `numero` varchar(10) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `precio_noche` decimal(10,2) NOT NULL,
  `capacidad` int(11) NOT NULL,
  `estado` char(1) NOT NULL COMMENT 'R - Reservada O - Ocupada  D - Disponible',
  `id_hotel` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `Habitacion`
--

INSERT INTO `Habitacion` (`id_habitacion`, `numero`, `tipo`, `precio_noche`, `capacidad`, `estado`, `id_hotel`) VALUES
(1, '101', 'Individual', 80.00, 1, 'R', 1),
(2, '102', 'Doble', 120.00, 2, 'O', 1),
(3, '201', 'Suite', 200.00, 4, 'D', 1),
(4, '101', 'Doble', 110.00, 2, 'D', 2),
(5, '102', 'Familiar', 180.00, 5, 'R', 2),
(6, '103', 'Individual', 75.00, 1, 'D', 1),
(7, '104', 'Doble', 115.00, 2, 'D', 1),
(8, '202', 'Suite Ejecutiva', 250.00, 3, 'O', 1),
(9, '203', 'Familiar', 180.00, 4, 'D', 1),
(10, '301', 'Presidencial', 400.00, 2, 'D', 1),
(11, '302', 'Doble con Vista', 140.00, 2, 'D', 1),
(12, '103', 'Individual con Vista al Mar', 95.00, 1, 'D', 2),
(13, '201', 'Suite Familiar', 220.00, 5, 'R', 2),
(14, '202', 'Doble Standard', 125.00, 2, 'D', 2),
(15, '203', 'Triple', 160.00, 3, 'O', 2),
(16, '301', 'Junior Suite', 190.00, 3, 'R', 2),
(17, '101', 'Individual Business', 120.00, 1, 'D', 3),
(18, '102', 'Doble Business', 160.00, 2, 'D', 3),
(19, '103', 'Triple Ejecutiva', 210.00, 3, 'R', 3),
(20, '201', 'Suite Conferencia', 280.00, 4, 'D', 3),
(21, '202', 'Presidencial', 450.00, 2, 'O', 3),
(22, '301', 'Estudio', 90.00, 2, 'D', 3),
(23, 'Cabaña 1', 'Cabaña Familiar', 150.00, 6, 'R', 4),
(24, 'Cabaña 2', 'Cabaña Romántica', 130.00, 2, 'D', 4),
(25, '101', 'Suite Montaña', 180.00, 4, 'D', 4),
(26, '102', 'Habitación Standard', 90.00, 2, 'D', 4),
(27, '201', 'Suite con Chimenea', 220.00, 3, 'O', 4),
(28, '101', 'Individual Express', 85.00, 1, 'D', 5),
(29, '102', 'Doble Express', 110.00, 2, 'D', 5),
(30, '103', 'Triple Express', 140.00, 3, 'D', 5),
(31, '201', 'Suite Ejecutiva', 195.00, 2, 'D', 5),
(32, '202', 'Sala Reuniones + Habitación', 320.00, 2, 'R', 5),
(33, 'Bungalow 1', 'Bungalow Playa', 200.00, 4, 'R', 6),
(34, 'Bungalow 2', 'Bungalow Premium', 280.00, 4, 'D', 6),
(35, '101', 'Vista al Mar Premium', 170.00, 2, 'D', 6),
(36, '102', 'Familiar Playa', 240.00, 5, 'D', 6),
(37, '201', 'Suite Luna de Miel', 350.00, 2, 'D', 6),
(38, '202', 'Junior Suite Playa', 190.00, 3, 'D', 6),
(39, 'Patio 1', 'Habitación Patio', 110.00, 2, 'D', 7),
(40, 'Patio 2', 'Suite Patio', 180.00, 3, 'R', 7),
(41, '101', 'Histórica Standard', 95.00, 2, 'D', 7),
(42, '102', 'Histórica Superior', 130.00, 2, 'R', 7),
(43, '201', 'Suite Noble', 220.00, 3, 'R', 7),
(44, '202', 'Presidencial Histórica', 300.00, 2, 'R', 7),
(45, 'PS-1', 'Penthouse Suite', 600.00, 4, 'R', 8),
(46, 'JS-1', 'Junior Suite Luxury', 280.00, 2, 'D', 8),
(47, 'MS-1', 'Master Suite', 420.00, 3, 'R', 8),
(48, 'DS-1', 'Deluxe Suite', 350.00, 2, 'D', 8),
(49, 'FS-1', 'Family Suite', 380.00, 5, 'D', 8),
(50, 'RS-1', 'Royal Suite', 750.00, 2, 'R', 8);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Hotel`
--

CREATE TABLE `Hotel` (
  `id_hotel` int(11) NOT NULL,
  `nombre_hotel` varchar(100) NOT NULL,
  `direccion` varchar(200) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `Hotel`
--

INSERT INTO `Hotel` (`id_hotel`, `nombre_hotel`, `direccion`, `telefono`) VALUES
(1, 'Alvear Palace Hotel', 'Av. Alvear 1891, Recoleta, CABA', '+54 11 4808-2100'),
(2, 'Hilton Buenos Aires', 'Macacha Güemes 351, Puerto Madero, CABA', '+54 11 4891-0000'),
(3, 'Four Seasons Hotel Buenos Aires', 'Posadas 1086/88, Recoleta, CABA', '+54 11 4321-1200'),
(4, 'Hotel Faena', 'Martha Salotti 445, Puerto Madero, CABA', '+54 11 4010-9000'),
(5, 'NH Collection BA Centro Histórico', 'Bolívar 120, San Telmo, CABA', '+54 11 4124-7000'),
(6, 'Palacio Duhau - Park Hyatt Buenos Aires', 'Av. Alvear 1661, Recoleta, CABA', '+54 11 5171-1234'),
(7, 'Claridge Hotel', 'Tucumán 535, Microcentro, CABA', '+54 11 4314-7700'),
(8, 'Sofitel Buenos Aires Recoleta', 'Arroyo 841, Retiro, CABA', '+54 11 4131-0000');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Reserva`
--

CREATE TABLE `Reserva` (
  `id_reserva` int(11) NOT NULL,
  `fecha_checkin` date NOT NULL,
  `fecha_checkout` date NOT NULL,
  `estado` varchar(20) NOT NULL DEFAULT 'pendiente',
  `id_habitacion` int(11) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `importe_total` decimal(10,2) NOT NULL,
  `fecha_reserva` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `Reserva`
--

INSERT INTO `Reserva` (`id_reserva`, `fecha_checkin`, `fecha_checkout`, `estado`, `id_habitacion`, `id_cliente`, `importe_total`, `fecha_reserva`) VALUES
(5, '2025-11-20', '2025-11-22', 'Confirmada', 6, 8, 150.00, '2025-11-13 10:00:00'),
(6, '2025-11-25', '2025-11-28', 'Confirmada', 12, 9, 285.00, '2025-11-13 10:15:00'),
(7, '2025-12-01', '2025-12-05', 'Pendiente', 17, 10, 480.00, '2025-11-13 10:30:00'),
(8, '2025-12-10', '2025-12-15', 'Confirmada', 23, 11, 750.00, '2025-11-13 10:45:00'),
(11, '2025-11-14', '2025-11-16', 'Confirmada', 50, 13, 1500.00, '2025-11-13 14:29:06'),
(12, '2025-11-16', '2025-11-17', 'Confirmada', 47, 13, 420.00, '2025-11-13 14:59:53'),
(13, '2025-11-14', '2025-11-15', 'Pagada', 45, 7, 600.00, '2025-11-13 15:06:19'),
(14, '2025-11-14', '2025-11-16', 'Pagada', 16, 7, 380.00, '2025-11-13 15:13:56'),
(15, '2025-11-14', '2025-11-15', 'Pagada', 19, 7, 210.00, '2025-11-13 18:06:57'),
(19, '2025-11-15', '2025-11-22', 'Pagada', 43, 6, 1540.00, '2025-11-14 14:26:37'),
(24, '2025-11-21', '2025-11-22', 'Pagada', 44, 7, 300.00, '2025-11-14 19:12:44'),
(31, '2025-11-23', '2025-11-24', 'Pagada', 32, 16, 320.00, '2025-11-16 14:38:44'),
(35, '2025-11-22', '2025-11-24', 'Pagada', 23, 16, 300.00, '2025-11-17 20:31:36'),
(36, '2025-11-20', '2025-11-22', 'Confirmada', 13, 16, 440.00, '2025-11-19 19:23:25');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Usuario`
--

CREATE TABLE `Usuario` (
  `id_usuario` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `fecha_registro` datetime NOT NULL DEFAULT current_timestamp(),
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `rol` enum('cliente','admin') DEFAULT 'cliente',
  `id_cliente` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `Usuario`
--

INSERT INTO `Usuario` (`id_usuario`, `email`, `password`, `fecha_registro`, `activo`, `rol`, `id_cliente`) VALUES
(10, 'pablo@calderon.com.ar', '$2b$10$WvD11IckTZwIxN5G3Hywi.xKGX5DiZHkVh.o8aICcKsQ85Y3hTVmS', '2025-11-13 11:24:25', 1, 'cliente', 6),
(11, 'roberto@perfumo.com', '$2b$10$M529Jo/jBbQFd.4WsTZ34uwimb33uknuMDNIQhiBD6DzhVVk4jrUG', '2025-11-13 11:52:56', 1, 'cliente', 7),
(12, 'cliente3@email.com', '$2b$10$EjemploHashCliente3', '2025-11-13 12:08:15', 1, 'cliente', 8),
(13, 'cliente4@email.com', '$2b$10$EjemploHashCliente4', '2025-11-13 12:08:15', 1, 'cliente', 9),
(14, 'cliente5@email.com', '$2b$10$EjemploHashCliente5', '2025-11-13 12:08:15', 1, 'cliente', 10),
(15, 'viajero@email.com', '$2b$10$EjemploHashViajero', '2025-11-13 12:08:15', 1, 'cliente', 11),
(17, 'diego@maradona.com', '$2b$10$MZnlnISD.xPvsNj.evp5aOScZkgMQEm/XbhT8TUB8FZtpGH9bBh9i', '2025-11-13 14:28:30', 1, 'cliente', 13),
(18, 'pepesanmartin@email.com', '$2b$10$/Mtj7o1MrBkT7J9hFPeEoefyCHId7LkjyTIFryR0kGwM4eC8oYa0q', '2025-11-13 18:16:56', 1, 'cliente', 14),
(19, 'mbelgrano@email.com', '$2b$10$KNmU63OuswnoqyWErZhRQOM0IOh2WSjn0R1Aud7Bm98yFyQBG3rXy', '2025-11-13 18:19:58', 1, 'cliente', 15),
(20, 'dmaradona@email.com', '$2b$10$XjH45S8Z4eMk9CHDdHamUud5BtghVHR76Puz2bqYD8Ng2czG0XIEW', '2025-11-15 16:28:13', 1, 'cliente', 16),
(29, 'admin@hotel.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '2025-11-15 17:34:41', 1, 'admin', 20),
(34, 'lmessi@email.com', '$2b$10$rpk8iLQFx6ehwuwxZU5o3Ouja4r2KPkHFdNAN9/rkz3rXZEETFi9C', '2025-11-17 07:43:58', 1, 'cliente', NULL),
(35, 'leomessi@gmail.com', '$2b$10$OK.Mc3feetouBmIDom77luQ71XCqnNAScfW1eW1L871s96e6Q4hwi', '2025-11-17 07:46:44', 1, 'cliente', NULL),
(36, 'paimar@gmail.com', '$2b$10$dwIOYpwOCfRKKrYBQeqFRuSaWCnIPGOCbJ/Chwu4XZvEh0RYrtSUu', '2025-11-17 09:05:24', 1, 'cliente', NULL),
(37, 'jose@sanmartin.com', '$2b$10$ivXd2i94yVx.L4yVZ9y8he7yu8/W.zx0dHYxJTt54CIwWJ2Jnj/Fm', '2025-11-17 20:33:28', 1, 'cliente', NULL);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `Cliente`
--
ALTER TABLE `Cliente`
  ADD PRIMARY KEY (`id_cliente`),
  ADD UNIQUE KEY `dni` (`dni`),
  ADD KEY `idx_cliente_usuario` (`id_usuario`),
  ADD KEY `idx_cliente_dni` (`dni`);

--
-- Indices de la tabla `Habitacion`
--
ALTER TABLE `Habitacion`
  ADD PRIMARY KEY (`id_habitacion`),
  ADD UNIQUE KEY `unique_numero_hotel` (`numero`,`id_hotel`),
  ADD KEY `idx_habitacion_hotel` (`id_hotel`);

--
-- Indices de la tabla `Hotel`
--
ALTER TABLE `Hotel`
  ADD PRIMARY KEY (`id_hotel`);

--
-- Indices de la tabla `Reserva`
--
ALTER TABLE `Reserva`
  ADD PRIMARY KEY (`id_reserva`),
  ADD KEY `idx_reserva_habitacion` (`id_habitacion`),
  ADD KEY `idx_reserva_cliente` (`id_cliente`),
  ADD KEY `idx_reserva_fechas` (`fecha_checkin`,`fecha_checkout`);

--
-- Indices de la tabla `Usuario`
--
ALTER TABLE `Usuario`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_usuario_email` (`email`),
  ADD KEY `fk_usuario_cliente` (`id_cliente`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `Cliente`
--
ALTER TABLE `Cliente`
  MODIFY `id_cliente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT de la tabla `Habitacion`
--
ALTER TABLE `Habitacion`
  MODIFY `id_habitacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT de la tabla `Hotel`
--
ALTER TABLE `Hotel`
  MODIFY `id_hotel` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `Reserva`
--
ALTER TABLE `Reserva`
  MODIFY `id_reserva` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT de la tabla `Usuario`
--
ALTER TABLE `Usuario`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `Cliente`
--
ALTER TABLE `Cliente`
  ADD CONSTRAINT `Cliente_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `Usuario` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `Habitacion`
--
ALTER TABLE `Habitacion`
  ADD CONSTRAINT `Habitacion_ibfk_1` FOREIGN KEY (`id_hotel`) REFERENCES `Hotel` (`id_hotel`) ON DELETE CASCADE;

--
-- Filtros para la tabla `Reserva`
--
ALTER TABLE `Reserva`
  ADD CONSTRAINT `Reserva_ibfk_1` FOREIGN KEY (`id_habitacion`) REFERENCES `Habitacion` (`id_habitacion`) ON DELETE CASCADE,
  ADD CONSTRAINT `Reserva_ibfk_2` FOREIGN KEY (`id_cliente`) REFERENCES `Cliente` (`id_cliente`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
