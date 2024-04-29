FROM node:20.9.0-alpine AS api
WORKDIR /usr/src/app
COPY apps/api/package*.json .
RUN npm install
COPY apps/api .
CMD npm run start