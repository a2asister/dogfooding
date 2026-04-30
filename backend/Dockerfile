FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --registry=https://registry.npmmirror.com

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production --registry=https://registry.npmmirror.com

COPY --from=builder /app/dist ./dist

RUN mkdir -p logs

EXPOSE 8080

CMD ["node", "dist/app.js"]
