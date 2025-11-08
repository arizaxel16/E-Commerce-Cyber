#!/bin/sh
# Este script se ejecuta ANTES de que arranque Spring Boot

set -e

# 1. Lee las rutas de los secretos (pasadas por docker-compose)
# 2. Lee el contenido de esos archivos secretos
# 3. Exporta ese contenido como variables de entorno NORMALES
[ -f "$DB_PASSWORD_FILE" ]    && export DB_PASSWORD="$(cat "$DB_PASSWORD_FILE")"
[ -f "$JWT_SECRET_FILE" ]     && export JWT_SECRET="$(cat "$JWT_SECRET_FILE")"
[ -f "$ENCRYPTION_KEY_FILE" ] && export ENCRYPTION_KEY="$(cat "$ENCRYPTION_KEY_FILE")"

# (Las variables *_FILE ya no existen para Spring, solo DB_PASSWORD, JWT_SECRET, etc.)

# 4. Ahora, ejecuta el comando principal de la imagen (el java -jar)
exec java -jar /app/app.jar