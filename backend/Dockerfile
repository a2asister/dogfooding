FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --registry=https://registry.npmmirror.com

COPY . .

RUN npm run build

EXPOSE 3001

CMD ["npm", "run", "start:prod"]