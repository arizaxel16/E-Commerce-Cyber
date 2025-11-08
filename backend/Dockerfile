# Ruta: backend/Dockerfile

# --- ETAPA 1: Construcción (Build Stage) ---
FROM gradle:jdk17-focal AS build
WORKDIR /home/gradle/src
COPY . .
# Limpia (si es necesario) y da permisos al wrapper de gradle
RUN sed -i 's/\r$//' gradlew && chmod +x gradlew
# Construye el .jar
RUN ./gradlew bootJar --no-daemon

# --- ETAPA 2: Producción (Final Stage) ---
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copia el .jar construido
COPY --from=build /home/gradle/src/build/libs/*.jar app.jar

# ¡NUEVO! Copia el script entrypoint y dale permisos
COPY entrypoint.sh /app/entrypoint.sh
RUN sed -i 's/\r$//' /app/entrypoint.sh && chmod +x /app/entrypoint.sh

EXPOSE 8080
# ¡NUEVO! Ejecuta el entrypoint en lugar de java -jar
ENTRYPOINT ["/app/entrypoint.sh"]