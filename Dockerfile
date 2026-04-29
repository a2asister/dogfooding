FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --legacy-peer-deps

COPY . .

RUN npm run build:client
RUN npm run build:server

FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache tzdata
ENV TZ=Asia/Shanghai

COPY package.json package-lock.json ./

RUN npm ci --legacy-peer-deps --production

COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/server/.env ./server/.env

EXPOSE 3001

WORKDIR /app/server

CMD ["node", "dist/index.js"]
