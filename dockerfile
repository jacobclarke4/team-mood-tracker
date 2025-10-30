# -----------------------------
# 1. Build stage
# -----------------------------
FROM node:20-alpine AS builder


WORKDIR /app

# Copy only package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy all source files
COPY . .

COPY .env .env

# Build the Next.js app
RUN npm run build

# -----------------------------
# 2. Production stage
# -----------------------------
FROM node:20-alpine AS runner


WORKDIR /app

ENV NODE_ENV=production
# Disable telemetry
ENV NEXT_TELEMETRY_DISABLED 1
ENV DATABASE_URL=postgresql://postgres:BigChungus4!@34.45.68.90:5432/team_mood_tracker


# Copy only the necessary build output and dependencies
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

EXPOSE 3000

# Use the Next.js built-in server
CMD ["npm", "start"]
