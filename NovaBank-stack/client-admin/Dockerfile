FROM node:22-alpine AS build
WORKDIR /app

COPY client-admin/package.json client-admin/pnpm-lock.yaml ./
RUN npm install
COPY client-admin ./
ARG VITE_AUTH=http://localhost:5092/api/v1
ARG VITE_BANK_SERVICE=http://localhost:3000/api
ARG VITE_FINANCIAL_SERVICE=http://localhost:4000/api
ENV VITE_AUTH=$VITE_AUTH
ENV VITE_BANK_SERVICE=$VITE_BANK_SERVICE
ENV VITE_FINANCIAL_SERVICE=$VITE_FINANCIAL_SERVICE
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY NovaBank-stack/nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
