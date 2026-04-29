FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache tzdata
ENV TZ=Asia/Shanghai

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/dist ./dist
COPY .env ./

EXPOSE 3001

CMD ["node", "dist/index.js"]
