FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --registry=https://registry.npmmirror.com

COPY . .

EXPOSE 3001

CMD ["npm", "run", "start:dev"]
