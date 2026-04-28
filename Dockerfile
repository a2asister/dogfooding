# 第一阶段：构建阶段
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装所有依赖（包括开发依赖）
RUN npm install

# 复制项目文件
COPY . .

# 构建项目
RUN npm run build

# 第二阶段：生产阶段
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 只安装生产依赖
RUN npm install --production

# 从构建阶段复制构建好的文件
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/src ./src
COPY --from=builder /app/public ./public
COPY --from=builder /app/.babelrc ./

# 暴露端口
EXPOSE 3001

# 启动应用
CMD ["npm", "start"]
