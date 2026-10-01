-- Esquema de la base de datos de UNA empresa.
-- Cada empresa tendrá su propia base de datos con estas mismas tablas,
-- por eso ninguna tabla lleva company_id.

SET NAMES utf8mb4;

-- Configuración de la terminal (lo que hoy guarda terminal-settings-context.tsx).
-- Siempre hay una sola fila, con id = 1.
CREATE TABLE terminal_settings (
  id                   TINYINT UNSIGNED NOT NULL DEFAULT 1,
  onboarding_completed BOOLEAN          NOT NULL DEFAULT FALSE,
  company_name         VARCHAR(120)     NOT NULL DEFAULT '',
  logo                 MEDIUMTEXT       NULL COMMENT 'Imagen en base64 (data URI) o URL',
  background_color     VARCHAR(9)       NOT NULL DEFAULT '#0F172A',
  pin_button_color     VARCHAR(9)       NOT NULL DEFAULT '#2563EB',
  date_format          ENUM('short', 'long') NOT NULL DEFAULT 'long',
  updated_at           DATETIME(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  CONSTRAINT chk_terminal_settings_single_row CHECK (id = 1)
);

-- Empleados que pueden fichar con su PIN.
CREATE TABLE employees (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name       VARCHAR(120) NOT NULL,
  pin        VARCHAR(10)  NOT NULL,
  active     BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_employees_pin (pin)
);

-- Fichajes de entrada y salida. Las fechas se guardan en UTC.
CREATE TABLE time_entries (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  employee_id INT UNSIGNED    NOT NULL,
  type        ENUM('in', 'out') NOT NULL,
  clocked_at  DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_time_entries_employee_date (employee_id, clocked_at),
  CONSTRAINT fk_time_entries_employee FOREIGN KEY (employee_id) REFERENCES employees (id)
);
