-- Datos iniciales para pruebas en local.

SET NAMES utf8mb4;

-- Códigos de activación de prueba (no caducan). Cada uno sirve para UNA tablet.
-- Para crear más: INSERT INTO activation_codes (code) VALUES ('TEST-0004');
-- Para reutilizar uno: UPDATE activation_codes SET used_at = NULL, device_id = NULL WHERE code = 'TEST-0001';
INSERT INTO activation_codes (code) VALUES ('TEST-0001'), ('TEST-0002'), ('TEST-0003');

-- Mismo PIN que FAKE_PIN en pin-terminal-screen.tsx
INSERT INTO employees (name, pin) VALUES ('Empleado de prueba', '123456');
