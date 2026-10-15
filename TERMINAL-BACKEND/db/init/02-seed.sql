-- Datos iniciales para pruebas en local.

SET NAMES utf8mb4;

-- Empresa de prueba
INSERT INTO companies (name, NIF, phone, email, IBAN)
VALUES ('Empresa de prueba', 'B12345678', '+34600000000', 'prueba@example.com', 'ES9121000418450200051332');

-- Códigos de activación de la empresa de prueba (no caducan). Cada uno sirve para UNA tablet.
-- Para crear más: INSERT INTO activation_codes (company_id, code) VALUES (1, 'TEST-0004');
-- Para reutilizar uno: UPDATE activation_codes SET used_at = NULL, device_id = NULL WHERE code = 'TEST-0001';
INSERT INTO activation_codes (company_id, code)
SELECT id, 'TEST-0001' FROM companies WHERE NIF = 'B12345678'
UNION ALL SELECT id, 'TEST-0002' FROM companies WHERE NIF = 'B12345678'
UNION ALL SELECT id, 'TEST-0003' FROM companies WHERE NIF = 'B12345678';

-- Mismo PIN que FAKE_PIN en pin-terminal-screen.tsx
INSERT INTO employees (company_id, name, pin)
VALUES ((SELECT id FROM companies WHERE NIF = 'B12345678'), 'Empleado de prueba', '123456');

-- Segunda empresa, para probar que cada tablet solo ve a sus empleados
INSERT INTO companies (name, NIF, phone, email, IBAN)
VALUES ('Empresa B', 'B87654321', '+34611111111', 'b@example.com', 'ES7921000813610123456789');

INSERT INTO employees (company_id, name, pin) VALUES
  ((SELECT id FROM companies WHERE NIF = 'B87654321'), 'Empleado B', '654321'),
  ((SELECT id FROM companies WHERE NIF = 'B87654321'), 'Otro B', '123456');

INSERT INTO activation_codes (company_id, code)
VALUES ((SELECT id FROM companies WHERE NIF = 'B87654321'), 'TEST-B001');