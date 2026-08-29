# --- Stage 1: Build the static assets ---
FROM node:22-alpine AS builder
WORKDIR /app

# Copy lockfile and package config
COPY package*.json ./
RUN npm ci

# Copy entire application code
COPY . .

# Compile and build production assets
RUN npm run build

# --- Stage 2: Serve using Nginx ---
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration if needed, otherwise Alpine Nginx defaults are fine
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
