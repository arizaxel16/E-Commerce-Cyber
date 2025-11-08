# Ruta: frontend/Dockerfile

# --- ETAPA 1: Construcción (Build Stage) ---
# Usamos una imagen de Node 18 (LTS)
FROM node:18-alpine AS build

# Establecemos el directorio de trabajo
WORKDIR /app

# Copiamos package.json y package-lock.json
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos todo el código fuente
COPY . .

# Construimos la aplicación para producción
# (Vite pondrá los archivos en /app/dist)
RUN npm run build

# --- ETAPA 2: Producción (Serve Stage) ---
# Usamos una imagen de Nginx súper ligera
FROM nginx:1.27-alpine

# Copiamos los archivos estáticos construidos (de la Etapa 1) 
# al directorio web por defecto de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# ¡CRÍTICO! Copiamos nuestra configuración de Nginx (Paso B)
# Esto le enseña a Nginx a ser un proxy inverso y a manejar React Router
COPY nginx.conf /etc/nginx/nginx.conf

# Exponemos el puerto 80 (HTTP estándar)
EXPOSE 80

# El comando por defecto de Nginx para iniciar el servidor
CMD ["nginx", "-g", "daemon off;"]