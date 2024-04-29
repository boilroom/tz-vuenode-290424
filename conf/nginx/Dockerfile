FROM node:20.9.0-alpine AS frontend
WORKDIR /app/panel
COPY apps/panel/package*.json .
RUN npm install
COPY apps/panel .
RUN npm run build

WORKDIR /app/client
COPY apps/client/package*.json .
RUN npm install
COPY apps/client .
RUN npm run build

FROM nginx:latest
COPY --from=frontend /app/panel/dist /var/www/html/panel
COPY --from=frontend /app/client/dist /var/www/html/client
COPY apps/home /var/www/html
COPY conf/nginx/conf.d /etc/nginx/conf.d
