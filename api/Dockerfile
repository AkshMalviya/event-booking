FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (use npm install to avoid lockfile issues across versions)
RUN npm install

# Copy source code
COPY . .

# Build all 4 NestJS applications
RUN npm run build api-gateway && \
    npm run build auth-service && \
    npm run build booking-service && \
    npm run build event-service

# Install only production dependencies
RUN npm install --omit=dev && npm cache clean --force

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install PM2 globally to manage multiple Node processes
RUN npm install pm2 -g

# Copy necessary files from the builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY ecosystem.config.js ./

# Start PM2 runtime
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
