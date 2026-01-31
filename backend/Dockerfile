# Build Stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Production Stage
FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app ./

# Install PM2 globally for process management
RUN npm install -g pm2

EXPOSE 5000

# Use PM2-runtime to start the app in production
CMD ["pm2-runtime", "server.js"]
