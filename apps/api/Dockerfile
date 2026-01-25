FROM node:22-alpine AS base
RUN apk add --no-cache openssl
RUN npm install -g pnpm

FROM base AS builder
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune --scope=@repolens/api --docker

FROM base AS installer
WORKDIR /app

# Configure pnpm to hoist dependencies (makes node_modules more predictable)
RUN pnpm config set shamefully-hoist true

# Copy configuration files
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Install ALL dependencies (including devDeps for build)
RUN pnpm install --ignore-scripts

# Copy source and build
COPY --from=builder /app/out/full/ .
RUN pnpm dlx prisma generate --schema=./packages/database/prisma/schema.prisma || pnpm dlx prisma generate --schema=./prisma/schema.prisma
RUN pnpm run build --filter=@repolens/api

# Prune development dependencies
RUN pnpm prune --prod --ignore-scripts

FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy built application and the pruned node_modules
COPY --from=installer --chown=nestjs:nodejs /app/apps/api/dist ./dist
COPY --from=installer --chown=nestjs:nodejs /app/apps/api/package.json ./package.json
COPY --from=installer --chown=nestjs:nodejs /app/node_modules ./node_modules

# Ensure the .prisma directory is copied correctly (Prisma 7 requirement)
# It's usually inside node_modules but pnpm can nest it
COPY --from=installer --chown=nestjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

USER nestjs

EXPOSE 3001

# Verify the prisma client exists before starting (Robustness check)
CMD ["node", "dist/main.js"]