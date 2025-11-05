# ============================================
# ETAPA 1: Compilar el código (Build)
# ============================================
FROM gradle:8-jdk17 AS build

# Crear carpeta de trabajo
WORKDIR /app

# Copiar archivos del proyecto
COPY . .

# Compilar el proyecto (crea el JAR)
RUN gradle clean build --no-daemon -x test

# ============================================
# ETAPA 2: Ejecutar la aplicación (Runtime)
# ============================================
FROM openjdk:17-jdk-slim

# Crear carpeta de trabajo
WORKDIR /app

# Crear carpeta para subir archivos
RUN mkdir -p /app/uploads

# Copiar SOLO el JAR compilado (no el código fuente)
COPY --from=build /app/build/libs/*.jar app.jar

# Puerto que usa Spring Boot
EXPOSE 8080

# Comando para ejecutar la aplicación
ENTRYPOINT ["java", "-jar", "app.jar"]
