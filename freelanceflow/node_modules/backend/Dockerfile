# ==========================================
# Stage 1: Build & TypeScript Compilation
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install openssl for Prisma
RUN apk add --no-cache openssl

# Copy root workspace configs & backend manifests
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY database/prisma ./database/prisma/

# Install dependencies across workspace
RUN npm ci --workspace=backend

# Copy backend source
COPY backend ./backend

# Generate Prisma Client & compile TypeScript
WORKDIR /app/backend
RUN npx prisma generate --schema=../database/prisma/schema.prisma
RUN npm run build

# ==========================================
# Stage 2: Production Runtime Image
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache openssl

ENV NODE_ENV=production
ENV PORT=5000

# Copy workspace setup and built assets
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY database/prisma ./database/prisma/

# Install only production dependencies
RUN npm ci --workspace=backend --omit=dev

# Generate Prisma Client in production environment
WORKDIR /app/backend
RUN npx prisma generate --schema=../database/prisma/schema.prisma

# Copy compiled JavaScript from builder
COPY --from=builder /app/backend/dist ./dist

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 5000

CMD ["node", "dist/index.js"]
