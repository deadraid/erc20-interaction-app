# Stage 1: Build the application
FROM node:22-alpine AS builder

WORKDIR /app

# Set yarn version
RUN yarn set version 1.22.22

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./
# Copy yarn cache if using zero-installs
COPY .yarn ./.yarn

# Install dependencies
RUN yarn install --immutable

# Copy the rest of the application code
COPY . .

# Build the TypeScript code
RUN yarn build

# Prune development dependencies
RUN yarn install --production --immutable

# Stage 2: Create the final production image
FROM node:22-alpine

WORKDIR /app

# Copy built application and production dependencies from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./
COPY --from=builder /app/.pnp.* ./
COPY --from=builder /app/.yarn ./.yarn

# Expose the application port (should match your .env or config)
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/server.js"] 
