-- Esquema de la base de datos de UNA empresa.
-- Cada empresa tendrá su propia base de datos con estas mismas tablas,
-- por eso ninguna tabla lleva company_id.
--
-- Modo quiosco: la tablet se vincula UNA vez con un código de activación y a
-- partir de ahí se identifica con su token en cada petición.

SET NAMES utf8mb4;

-- Tablets vinculadas a la empresa.
CREATE TABLE terminal_devices (
  id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name           VARCHAR(80)  NOT NULL DEFAULT 'Terminal',
  token_hash     CHAR(64)     NOT NULL COMMENT 'SHA-256 del token. El token en claro solo lo tiene la tablet',
  admin_pin_hash VARCHAR(255) NULL     COMMENT 'Hash (bcrypt) del PIN para entrar en los ajustes. Se define en el onboarding',
  status         ENUM('active', 'revoked') NOT NULL DEFAULT 'active',
  activated_at   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  last_seen_at   DATETIME(3)  NULL,
  revoked_at     DATETIME(3)  NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_terminal_devices_token (token_hash)
);

-- Códigos para vincular una tablet. Son de un solo uso.
-- Ahora se crean a mano; en el futuro los generará el HR / License Manager.
CREATE TABLE activation_codes (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  code       VARCHAR(20)  NOT NULL,
  expires_at DATETIME(3)  NULL     COMMENT 'NULL = no caduca (solo para pruebas)',
  used_at    DATETIME(3)  NULL     COMMENT 'NULL = todavía no se ha usado',
  device_id  INT UNSIGNED NULL     COMMENT 'Tablet que lo usó',
  created_at DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_activation_codes_code (code),
  CONSTRAINT fk_activation_codes_device FOREIGN KEY (device_id) REFERENCES terminal_devices (id)
);

-- Configuración de cada tablet (lo que hoy guarda terminal-settings-context.tsx).
-- Una fila por tablet; se crea al activarla.
CREATE TABLE terminal_settings (
  device_id            INT UNSIGNED     NOT NULL,
  onboarding_completed BOOLEAN          NOT NULL DEFAULT FALSE,
  company_name         VARCHAR(120)     NOT NULL DEFAULT '',
  logo                 MEDIUMTEXT       NULL COMMENT 'Imagen en base64 (data URI) o URL',
  background_color     VARCHAR(9)       NOT NULL DEFAULT '#0F172A',
  pin_button_color     VARCHAR(9)       NOT NULL DEFAULT '#2563EB',
  date_format          ENUM('short', 'long') NOT NULL DEFAULT 'long',
  updated_at           DATETIME(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (device_id),
  CONSTRAINT fk_terminal_settings_device FOREIGN KEY (device_id) REFERENCES terminal_devices (id) ON DELETE CASCADE
);

-- Empleados que pueden fichar con su PIN.
CREATE TABLE employees (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name       VARCHAR(120) NOT NULL,
  pin        CHAR(6)      NOT NULL COMMENT '6 dígitos',
  active     BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_employees_pin (pin),
  CONSTRAINT chk_employees_pin CHECK (pin REGEXP '^[0-9]{6}$')
);

-- Fichajes de entrada y salida. Las fechas se guardan en UTC.
CREATE TABLE time_entries (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  employee_id INT UNSIGNED    NOT NULL,
  device_id   INT UNSIGNED    NULL COMMENT 'Tablet desde la que se fichó',
  type        ENUM('in', 'out') NOT NULL,
  clocked_at  DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_time_entries_employee_date (employee_id, clocked_at),
  CONSTRAINT fk_time_entries_employee FOREIGN KEY (employee_id) REFERENCES employees (id),
  CONSTRAINT fk_time_entries_device FOREIGN KEY (device_id) REFERENCES terminal_devices (id)
);
