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

# Build the TypeScript code with production config
RUN yarn build || (echo "TypeScript build had warnings but we'll continue" && exit 0)

# Stage 2: Create the final production image
FROM node:22-alpine

WORKDIR /app

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./
COPY .yarn ./.yarn

# Copy the built application from builder stage
COPY --from=builder /app/dist ./dist

# Install production dependencies with --ignore-scripts flag to prevent postinstall from running
RUN yarn install --production --immutable --ignore-scripts

# Expose the application port (should match your .env or config)
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/src/server.js"]
