-- Datos iniciales para pruebas en local.

SET NAMES utf8mb4;

-- Configuración por defecto (mismos valores que defaultSettings en la app)
INSERT INTO terminal_settings (id) VALUES (1);

-- Mismo PIN que FAKE_PIN en pin-terminal-screen.tsx
INSERT INTO employees (name, pin) VALUES ('Empleado de prueba', '1234');
