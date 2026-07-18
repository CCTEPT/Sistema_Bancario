FROM node:22-alpine
WORKDIR /app

COPY Bank-service/package.json Bank-service/pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --prod --frozen-lockfile

COPY Bank-service ./
EXPOSE 3000
CMD ["pnpm", "start"]
