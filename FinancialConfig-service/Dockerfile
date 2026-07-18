FROM node:22-alpine
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --prod --frozen-lockfile

COPY . ./
EXPOSE 4000
CMD ["pnpm", "start"]
