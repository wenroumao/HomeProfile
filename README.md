![ZeroHome](https://socialify.git.ci/Viper373/ZeroHome/image?description=1&forks=1&issues=1&logo=https://img.viper3.top/ZeroHome/logo.png&name=1&owner=1&pulls=1&stargazers=1&theme=Auto)

# 🏝️ ZeroHome

## 1. 项目概述
本项目是一个现代化个人主页，用于展示开发者的介绍、近期动态、技术栈和作品集。用户端通过GitHub API获取GitHub贡献日历，展示技术栈和项目画廊，集成网易云音乐和Steam API展示音乐和游戏数据。后台管理功能允许管理员编辑个人资料和页脚内容，以及管理技能和项目展示内容。

## 2. 功能清单

### 用户端功能
- 🗓️ GitHub贡献日历：动态展示GitHub活动
- 🛠️ 技能展示区：分类展示技术栈
- 🖼️ 项目画廊：交互式项目展示
- 🎵 网易云音乐数据展示：集成音乐API
- 🎮 Steam游戏数据展示：集成Steam API
- 🌏 多语言支持：中英文切换
- 🌓 主题切换：深色/浅色模式
- 🌸 樱花飘落背景特效
- 💫 社交图标悬停动效

### 后台管理功能
- 🛠️ 技能管理：CRUD操作技术技能条目
- 🖼️ 项目管理：增删改查项目展示内容
- 👤 个人资料编辑：更新个人信息
- 📝 页脚内容管理：自定义页脚信息
- 🔐 登录/登出：基于NextAuth的身份验证

## 3. 技术栈
- **框架**: Next.js 15 (App Router)
- **样式**: Tailwind CSS + Shadcn/ui组件库
- **认证**: NextAuth.js
- **国际化**: next-intl
- **状态管理**: 主要依赖 React 内置 Hooks (如 `useState`, `useContext`) 及特定功能库（如 `next-auth` for authentication, `next-themes` for theming, `react-hook-form` for forms）进行状态管理。
- **表单处理**: React Hook Form + Zod验证
- **动画**: Framer Motion

## 4. 安装与启动

### 4.1. 环境准备
- [Node.js](https://nodejs.org/) (推荐版本 >= 18.x)
- [pnpm](https://pnpm.io/) (推荐包管理器)
- [Git](https://git-scm.com/)
- [Docker](https://www.docker.com/) (可选，用于容器化部署)
- [Docker Compose](https://docs.docker.com/compose/) (可选，用于容器化部署)

### 4.2. 本地开发
```bash
# 1. 克隆项目
git clone https://github.com/Viper373/ZeroHome.git
cd ZeroHome

# 2. 安装依赖
pnpm install

# 3. 配置环境变量
#    复制 .env.example 文件为 .env.local (用于本地开发)
#    或 .env (用于 Docker Compose 部署)
cp .env.example .env.local 
#    然后根据下面的 "环境变量配置" 部分修改文件内容

# 4. 启动开发服务器
pnpm dev
```
应用默认运行在 `http://localhost:3000`。

### 4.3. 环境变量配置 (`.env.local` 或 `.env`)
确保您已经创建了对应的 `.env` 文件。以下是主要的环境变量列表及其说明。强烈建议您从 `.env.example` 文件开始，并填充您的实际值。

| 环境变量        | 示例值                               | 说明                                                                 |
|-----------------|--------------------------------------|----------------------------------------------------------------------|
| `NEXTAUTH_URL`  | `http://localhost:3000`              | NextAuth.js 使用的基础 URL，开发时通常是 `http://localhost:3000`。       |
| `NEXTAUTH_SECRET` | `'YOUR_VERY_STRONG_SECRET_HERE'`     | 用于签名和加密 NextAuth.js 会话和令牌的密钥。**请务必替换为一个强随机字符串**。生成方法示例: `openssl rand -base64 32` |
| `ADMIN_USERNAME`| `your_admin_username`                | 后台管理员的用户名 (用于初始登录或特定认证策略)。                         |
| `ADMIN_PASSWORD`| `your_admin_password`                | 后台管理员的密码。                                                      |
| `STEAM_API_KEY` | `your_steam_api_key`                 | 用于从 Steam Web API 获取数据的 API 密钥。                              |
| `NETEASE_MUSIC_U`| `your_netease_music_u_cookie`        | 网易云音乐的 `MUSIC_U` Cookie 值，用于获取用户音乐数据。                  |

**重要提示**: 
- `.env.example` 文件应包含所有必需和可选的环境变量模板，并附带清晰的注释。
- **切勿**将包含真实敏感信息的 `.env` 或 `.env.local` 文件提交到版本控制系统 (如 Git)。确保它们已在 `.gitignore` 文件中列出。

## 5. 部署

### 5.1. 使用 Docker 和 Docker Compose (推荐)
项目根目录下已包含 `Dockerfile` 和 `docker-compose.yml` 文件，方便进行容器化部署。`docker-compose.yml` 配置为通过 `env_file: .env` 从项目根目录下的 `.env` 文件加载环境变量。

**前提**:
- Docker 和 Docker Compose 已安装。
- 项目根目录下有一个名为 `.env` 的文件，其中包含所有必要的运行时环境变量 (参考上面的 "环境变量配置" 表格)。

**构建并运行:**
```bash
# 1. 构建 Docker 镜像 (如果 Dockerfile 有更新)
docker-compose build

# 2. 启动服务 (后台运行)
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```
服务将根据 `docker-compose.yml` 中的端口映射配置运行。

### 5.2. 单独使用 Dockerfile
如果您希望不通过 `docker-compose`，而是直接使用 `Dockerfile` 构建和运行：

1.  **构建镜像**:
    ```bash
    docker build -t zero-home .
    ```
2.  **运行容器**:
    您需要在 `docker run` 命令中传递所有必要的环境变量。**请注意将 `"http://yourdomain.com"` 替换为您的实际部署 URL。**
    ```bash
    docker run -p 3000:3000 \
      -e NODE_ENV=production \
      -e NEXTAUTH_URL="http://yourdomain.com" \
      -e NEXTAUTH_SECRET="YOUR_VERY_STRONG_SECRET_HERE" \
      -e ADMIN_USERNAME="your_admin_username" \
      -e ADMIN_PASSWORD="your_admin_password" \
      -e STEAM_API_KEY="your_steam_api_key" \
      -e NETEASE_MUSIC_U="your_netease_music_u_cookie" \
      zero-home
    ```
    这种方式环境变量管理较为繁琐，推荐使用 Docker Compose 配合 `env_file`。

### 5.3. 传统 Node.js 环境部署 (例如 Vercel, Netlify, 或自有服务器)
1.  确保服务器上已安装 Node.js 和 pnpm。
2.  上传项目文件（或通过 Git 拉取）。
3.  安装依赖：`pnpm install --frozen-lockfile`。
4.  构建项目：`pnpm build`。
5.  设置运行时环境变量。
6.  启动应用：`pnpm start`。

### 5.4. ▲ Vercel 部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FViper373%2FZeroHome&env=ADMIN_USERNAME,ADMIN_PASSWORD,STEAM_API_KEY,NETEASE_MUSIC_U,NEXTAUTH_SECRET)
1. 注册并登录 [Vercel](https://vercel.com/)。
2. 点击 "New Project"，导入您的 GitHub 仓库（如 Viper373/ZeroHome）。
3. 选择 Next.js 框架，保持默认构建设置。
4. 在 **Settings → Environment Variables** 中，**手动添加所有环境变量**（与 `.env.example` 保持一致）。
5. 部署即可，访问分配的 Vercel 域名（如 `https://your-vercel-domain.vercel.app`）。

> ⚠️ Vercel 不会自动读取 `.env.local`，请务必在控制台手动配置环境变量！

---

### 5.5. 🌐 Netlify 部署

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https%3A%2F%2Fgithub.com%2FViper373%2FZeroHome)


1. 注册并登录 [Netlify](https://www.netlify.com/)。
2. 点击 "Add new site" → "Import an existing project"，选择您的 GitHub 仓库。
3. 构建命令填写：`pnpm build`
4. 发布目录填写：`.next`
5. 在 **Site settings → Environment variables** 中，**手动添加所有环境变量**（与 `.env.example` 保持一致）。
6. 部署即可，访问分配的 Netlify 域名（如 `https://your-site.netlify.app`）。

> ⚠️ Netlify 不会自动读取 `.env.local`，请务必在控制台手动配置环境变量！

---

如需批量导入环境变量，可参考 Vercel/Netlify 官方文档或 CLI 工具说明。

## 6. 目录结构

### 关键目录和文件说明

```
ZeroHome/ # 项目根目录
├── .env # 环境变量文件 (Git忽略)
├── .env.example # 环境变量示例文件
├── app/ # Next.js App Router 核心目录
│ ├── (admin)/ # 后台管理页面组 (路由组，不影响URL路径)
│ │ └── admin/ # 后台管理实际路由 /admin/*
│ ├── (main)/ # 前台主要页面组 (路由组)
│ │ └── (home)/ # 首页特定布局组
│ │ ├── layout.tsx
│ │ └── page.tsx # 主页 /
│ ├── layout.tsx # 应用的根布局
│ └── globals.css # 全局 CSS 样式
├── components/ # 可复用 React 组件
│ ├── admin/ # 后台管理界面专用组件
│ ├── common/ # 项目通用的组件 (如页眉、页脚、导航等)
│ ├── ui/ # Shadcn/ui 生成的原子UI组件
│ ├── background-video.tsx
│ ├── console-badge.tsx # 控制台输出项目信息的组件
│ ├── github-calendar.tsx
│ ├── i18n-provider.tsx # I18n 上下文提供组件
│ ├── social-icons.tsx
│ └── theme-provider.tsx # 主题切换上下文提供组件
├── hooks/ # 自定义 React Hooks
├── i18n/ # next-intl 国际化配置文件和语言资源
│ ├── locales/ # 语言 JSON 文件 (例如 en.json, zh.json)
├── lib/ # 工具函数、辅助脚本、第三方库的封装等
│ ├── utils.ts # 通用工具函数
│ └── getSocialIcon.tsx # 获取社交图标组件
├── public/ # 静态资源目录 (图片, 视频, 字体等)
│ ├── assets/
│ ├── images/
│ └── videos/
├── components.json # Shadcn/ui 配置文件
├── Dockerfile # Docker 镜像构建定义文件
├── docker-compose.yml # Docker Compose 服务定义文件
├── next.config.mjs # Next.js 项目配置文件
├── next-env.d.ts # Next.js 的 TypeScript 类型声明文件
├── package.json # 项目元数据、依赖列表和脚本命令
├── pnpm-lock.yaml # pnpm 精确的依赖版本锁定文件
├── postcss.config.mjs # PostCSS 配置文件
├── settings.json # 用于存储个人信息的配置文件
├── tailwind.config.ts # Tailwind CSS 配置文件
└── tsconfig.json # TypeScript 编译器配置文件

### 生成强随机字符串 NEXTAUTH_SECRET
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```
## 7. 项目截图
- 亮色模式: ![首页截图](public/images/index1.png)
- 暗色模式: ![首页截图](public/images/index2.png)
- 后台管理截图: ![后台管理截图](public/images/admin.png)

## 8. 贡献指南
如果您想为这个项目做出贡献，请遵循以下步骤：
1. Fork 本仓库。
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)。
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)。
4. 推送到分支 (`git push origin feature/AmazingFeature`)。
5. 打开一个 Pull Request。

欢迎任何形式的贡献，无论是代码、文档还是建议！

## 9. 许可证
本项目采用 [MIT](LICENSE) 许可证