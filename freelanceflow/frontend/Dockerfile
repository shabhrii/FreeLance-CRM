# ==========================================
# Stage 1: Build Vite Frontend
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root manifests & frontend configs
COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/

# Install workspace dependencies
RUN npm ci --workspace=frontend

# Copy frontend source code
COPY frontend ./frontend

# Build production bundle with Vite
WORKDIR /app/frontend
ARG VITE_API_URL
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}

RUN npm run build

# ==========================================
# Stage 2: High-Performance Nginx Web Server
# ==========================================
FROM nginx:1.25-alpine AS runner

# Copy custom Nginx configuration with SPA support
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
