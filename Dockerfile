# Playwright image: Node.js + Chromium and system deps (version matches package.json)
FROM mcr.microsoft.com/playwright:v1.60.0-noble AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS build
COPY . .
RUN npm run build

FROM base AS production
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
RUN npm prune --omit=dev

EXPOSE 3000

CMD ["node", "dist/main.js"]
