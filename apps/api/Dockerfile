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
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
# pnpm install is faster and uses less space
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY --from=builder /app/out/full/ .
RUN pnpm dlx prisma generate --schema=./packages/database/prisma/schema.prisma || pnpm dlx prisma generate --schema=./prisma/schema.prisma
RUN pnpm run build --filter=@repolens/api

FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

COPY --from=installer --chown=nestjs:nodejs /app/apps/api/dist ./dist
COPY --from=installer --chown=nestjs:nodejs /app/apps/api/package.json ./package.json
COPY --from=installer --chown=nestjs:nodejs /app/node_modules ./node_modules

USER nestjs

EXPOSE 3001

CMD ["node", "dist/main.js"]
