FROM node:20-alpine AS builder

WORKDIR /app

# Copy prisma schema first (needed for client generation)
COPY prisma ./prisma

# Install API deps
COPY apps/api/package.json ./
RUN npm install

COPY apps/api/tsconfig.json apps/api/nest-cli.json ./
COPY apps/api/src ./src

RUN npx prisma generate
RUN npm run build

# ─── Production image ────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/package.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
