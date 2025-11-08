#!/bin/sh
set -e

export DB_PASSWORD="$(tr -d '\r\n' < "$DB_PASSWORD_FILE")"
export JWT_SECRET="$(tr -d '\r\n' < "$JWT_SECRET_FILE")"
export ENCRYPTION_KEY="$(tr -d '\r\n' < "$ENCRYPTION_KEY_FILE")"

exec java -jar /app/app.jar
