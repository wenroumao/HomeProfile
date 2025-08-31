# 阶段 1: 基础镜像，包含 Node.js 和 pnpm
FROM node:18-alpine AS base

# 在基础镜像中全局安装 pnpm
# 使用 npm 安装 pnpm 是因为 node:alpine 镜像默认包含 npm
RUN npm install -g pnpm

# 阶段 2: 安装项目依赖
# 这个阶段专门用于安装依赖，以便更好地利用 Docker 的层缓存机制
FROM base AS deps
WORKDIR /app

# 仅复制 package.json 和 pnpm-lock.yaml 文件
# 如果这两个文件没有改变，Docker 可以重用此阶段的缓存层
COPY package.json pnpm-lock.yaml ./

# 使用 pnpm fetch 下载所有依赖项到 pnpm 的内容寻址存储中
# 这样做可以加速后续的 pnpm install --offline
RUN pnpm fetch --frozen-lockfile

# 从本地 pnpm 存储中安装依赖
# -r 标志用于递归安装（主要用于 monorepo 项目，在此项目中可能非必需但无害）
# --offline 标志指示 pnpm 尝试从已下载的缓存中安装，而不是从网络下载
# --frozen-lockfile 确保严格按照 pnpm-lock.yaml 文件安装依赖
RUN pnpm install -r --offline --frozen-lockfile

# 阶段 3: 构建应用程序
# 这个阶段用于编译/构建您的 Next.js 应用
FROM base AS builder
WORKDIR /app

# 从 'deps' 阶段复制已经安装好的 node_modules
COPY --from=deps /app/node_modules ./node_modules

# 复制应用程序的其余源代码
# 确保您的 .dockerignore 文件配置正确，以排除不必要的文件和目录
COPY . .

# 执行 Next.js 的构建命令，生成生产环境所需的静态文件和服务器代码
RUN pnpm run build

# 阶段 4: 生产环境运行阶段
# 这个阶段只包含运行应用所需的最小文件集合，以减小最终镜像的体积
FROM base AS runner
WORKDIR /app

# 设置环境变量，表明应用在生产模式下运行
ENV NODE_ENV production
# Next.js 应用将在此端口上运行，server.js 会读取此变量
ENV PORT 3000
# HOSTNAME 通常不需要显式设置，因为 Next.js 的 standalone server.js 默认会监听 0.0.0.0

# 创建一个非 root 用户和用户组，以增强安全性
# 使用固定的 GID 和 UID 有助于在不同环境中保持一致性
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 从 'builder' 阶段复制 Next.js standalone 模式的输出
# --chown=nextjs:nodejs 确保复制过来的文件属于新创建的非 root 用户
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# 复制 .next/static 目录，其中包含静态构建资源
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 复制 public 文件夹
# Next.js standalone 输出模式期望 public 文件夹位于相对于 server.js 的 ./public 路径
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# 切换到新创建的非 root 用户来运行应用
USER nextjs

# 向 Docker 声明容器在运行时会监听的端口
# 这只是一个元数据声明，实际的端口映射在 docker-compose.yml 或 docker run 命令中完成
EXPOSE 3000

# 定义容器启动时执行的命令
# 对于 Next.js standalone 输出，这是运行应用的推荐方式
# server.js 文件位于 .next/standalone/ 目录中，在 WORKDIR /app 下，它就是 ./server.js
CMD ["node", "server.js"]