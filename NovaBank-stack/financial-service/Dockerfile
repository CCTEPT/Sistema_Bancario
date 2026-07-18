FROM node:22-alpine
WORKDIR /app

COPY FinancialConfig-service/package.json FinancialConfig-service/pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --prod --frozen-lockfile

COPY FinancialConfig-service ./
EXPOSE 4000
CMD ["pnpm", "start"]
