FROM node:22-slim

# Install pnpm
RUN npm install -g pnpm@11

WORKDIR /app

# Copy root workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json tsconfig.json ./

# Copy lib packages
COPY lib/ lib/

# Copy the frontend app
COPY artifacts/adwallet/ artifacts/adwallet/

# Copy the API server
COPY artifacts/api-server/ artifacts/api-server/

# Copy scripts
COPY scripts/ scripts/

# Install dependencies
RUN pnpm install --ignore-scripts --frozen-lockfile

# Expose ports
EXPOSE 5173 3000

# Default command - start frontend dev server
WORKDIR /app/artifacts/adwallet
CMD ["sh", "-c", "PORT=5173 BASE_PATH=/ pnpm run dev"]
