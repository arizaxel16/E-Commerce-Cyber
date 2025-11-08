#!/bin/bash
# Ruta: /db-init/init-app-user.sh (¡CORREGIDO!)

set -e

# Lee la contraseña del 'app_user' desde el archivo secreto de Docker
APP_USER_PASSWORD=$(cat /run/secrets/pg_app_password)

# Ejecutar SQL como el superusuario 'postgres'
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL

    -- 1. Crear el rol (usuario) para la aplicación
    CREATE USER app_user WITH PASSWORD '$APP_USER_PASSWORD';

    -- 2. Darle permiso para conectarse a esta base de datos
    GRANT CONNECT ON DATABASE arepabuelas_db TO app_user;

    -- 3. ¡LA LÍNEA QUE FALTABA!
    -- Darle permiso para USAR y CREAR en el esquema 'public'
    GRANT USAGE, CREATE ON SCHEMA public TO app_user;

    -- 4. Darle permisos para todas las tablas y secuencias (IDs)
    -- que se creen en el futuro DENTRO del esquema public.
    ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL ON TABLES TO app_user;

    ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL ON SEQUENCES TO app_user;

EOSQL