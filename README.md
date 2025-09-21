![ZeroHome](https://socialify.git.ci/wenroumao/ZeroHome/image?description=1&forks=1&issues=1&logo=https://img.viper3.top/ZeroHome/logo.png&name=1&owner=1&pulls=1&stargazers=1&theme=Auto)
# HomeProfile 项目功能版本文档

## 📋 项目概述

HomeProfile 是一个基于 Next.js 15 的现代化个人主页项目，集成了多种社交平台数据展示、技能展示、项目展示和后台管理功能。项目采用响应式设计，支持多语言国际化，提供完整的前后端解决方案。

## 🚀 版本历史

### v1.0.0 ()
- 项目初始版本发布
- 基础个人主页框架搭建
- 核心组件和页面结构建立

### v1.1.0 ()
- 新增网易云音乐统计功能
- 添加 Steam 游戏统计展示
- 实现基础社交图标组件

### v1.2.0 ()
- 集成管理后台系统
- 添加个人资料动态管理
- 实现技能和项目的后台编辑功能

### v1.3.0 ()
- 新增多语言国际化支持
- 优化响应式设计
- 添加暗黑模式支持

### v1.4.0 (2025-09-21)
- 实现 QQ 社交图标悬停效果
- 添加一键复制 QQ 号功能
- 优化用户交互体验

## 📊 功能清单

### 基础功能 (v1.0.0)

#### 🏠 个人主页
- **个人信息展示**: 头像、姓名、职业、简介等基本信息
- **响应式布局**: 适配桌面端、平板和移动端设备
- **现代化UI设计**: 基于 Tailwind CSS 的美观界面

#### 🔧 技术架构
- **Next.js 15**: 最新版本的 React 全栈框架
- **TypeScript**: 类型安全的开发体验
- **Tailwind CSS**: 实用优先的 CSS 框架

### 新增功能

#### v1.1.0 新增功能

##### 🎵 网易云音乐统计
- **听歌统计展示**: 显示总听歌时长、歌曲数量等数据
- **API 集成**: 通过 `/api/netease-music` 接口获取音乐数据
- **实时数据更新**: 支持动态刷新音乐统计信息
- **错误处理**: 完善的异常处理和用户提示

##### 🎮 Steam 游戏统计
- **游戏库展示**: 显示 Steam 游戏收藏和游戏时长
- **成就统计**: 展示游戏成就和完成度
- **API 集成**: 通过 Steam Web API 获取游戏数据

##### 🔗 社交图标组件
- **多平台支持**: GitHub、微博、QQ、微信等主流社交平台
- **图标库集成**: 使用 Lucide React 图标库
- **链接跳转**: 支持外部链接和内部处理

#### v1.2.0 新增功能

##### 🛠️ 管理后台系统
- **用户认证**: 基于 NextAuth.js 的安全认证系统
- **个人资料管理**: 动态编辑个人信息、技能、项目等
- **API 路由**: `/api/admin/profile` 提供完整的 CRUD 操作
- **数据持久化**: 支持数据的增删改查操作

##### 📝 内容管理
- **技能管理**: 动态添加、编辑、删除技能项
- **项目管理**: 项目信息的完整生命周期管理
- **社交链接管理**: 社交平台链接的动态配置

#### v1.3.0 新增功能

##### 🌍 国际化支持
- **多语言切换**: 支持中文、英文等多种语言
- **i18n 配置**: 基于 next-intl 的国际化解决方案
- **动态语言加载**: 按需加载语言包，优化性能

##### 🌙 主题系统
- **暗黑模式**: 完整的暗黑主题支持
- **主题切换**: 用户可自由切换明暗主题
- **系统主题检测**: 自动检测系统主题偏好

#### v1.4.0 新增功能

##### 💬 QQ 社交图标增强
- **悬停提示效果**: 鼠标悬停显示自定义提示信息
- **智能提示内容**: 
  - URL 为空时显示 "QQ: 2964421512 (点击复制)"
  - 有 URL 时显示社交平台名称
- **一键复制功能**: 点击复制 QQ 号到剪贴板
- **用户反馈**: 控制台输出复制状态，提供操作反馈
- **平滑动画**: 基于 Framer Motion 的流畅过渡效果

## 🔧 功能详细描述

### 核心技术实现

#### 网易云音乐 API 集成
```typescript
// 位置: app/api/netease-music/route.ts
export async function GET() {
  // 获取网易云音乐统计数据
  // 处理 API 请求和响应
  // 错误处理和数据格式化
}
```

#### Steam API 集成
- **Steam Web API**: 集成官方 Steam API
- **数据缓存**: 实现数据缓存机制，提升性能
- **隐私保护**: 支持隐私设置和数据过滤

#### 管理后台架构
```typescript
// 位置: app/api/admin/profile/route.ts
export async function GET() { /* 获取个人资料 */ }
export async function POST() { /* 创建/更新资料 */ }
export async function PUT() { /* 更新资料 */ }
export async function DELETE() { /* 删除资料 */ }
```

#### 社交图标组件架构
```typescript
// 位置: components/social-icons.tsx
interface SocialIconsProps {
  socialLinks: SocialLink[];
  className?: string;
}

interface SocialLink {
  name: string;
  url: string;
  icon: string;
}
```

### 组件关联关系

#### 数据流架构
```
用户界面 → API 路由 → 数据处理 → 组件渲染
    ↓           ↓          ↓         ↓
  交互事件 → 状态管理 → 数据更新 → UI 更新
```

#### 组件依赖关系
- **SocialIcons** ← 依赖 → **Tooltip** (Radix UI)
- **MusicStats** ← 依赖 → **API Route** (/api/netease-music)
- **AdminPanel** ← 依赖 → **NextAuth** + **API Routes**

### 技术栈详解

#### 前端技术
- **Next.js 15**: App Router、Server Components、API Routes
- **React 18**: Hooks、Context、Suspense
- **TypeScript**: 严格类型检查、接口定义
- **Tailwind CSS**: 响应式设计、暗黑模式
- **Framer Motion**: 动画和过渡效果
- **Radix UI**: 无障碍的 UI 组件库

#### 后端技术
- **Next.js API Routes**: RESTful API 设计
- **NextAuth.js**: 身份认证和会话管理
- **数据持久化**: JSON 文件存储 (可扩展至数据库)

#### 开发工具
- **ESLint**: 代码质量检查
- **Prettier**: 代码格式化
- **TypeScript**: 类型安全
- **Git**: 版本控制

## 🔮 未来计划

### v1.5.0 (计划中 - 2024-04-01)
- **数据库集成**: 替换 JSON 文件存储为 PostgreSQL/MongoDB
- **用户系统**: 支持多用户注册和管理
- **评论系统**: 添加访客评论功能
- **SEO 优化**: 完善 meta 标签和结构化数据

### v1.6.0 (计划中 - 2024-04-15)
- **博客系统**: 集成 Markdown 博客功能
- **RSS 订阅**: 支持 RSS/Atom 订阅    这个已经废弃了
- **搜索功能**: 全站内容搜索
- **标签系统**: 内容分类和标签管理

### v1.7.0 (计划中 - 2024-05-01)
- **PWA 支持**: 渐进式 Web 应用功能
- **离线缓存**: Service Worker 缓存策略
- **推送通知**: Web Push 通知功能
- **性能优化**: 图片懒加载、代码分割

### v2.0.0 (长期规划 - 2024-06-01)
- **微服务架构**: 拆分为独立的微服务
- **GraphQL API**: 替换 REST API 为 GraphQL
- **实时功能**: WebSocket 实时通信
- **AI 集成**: 智能内容推荐和生成

## 📚 技术文档

### 相关文档
- [网易云音乐组件功能实现文档](./网易云音乐组件功能实现文档.md)
- [QQ社交图标悬停效果实现文档](./QQ社交图标悬停效果实现文档.md)
- [项目 README](./README.md)

### 开发指南
1. **环境准备**: Node.js 18+, pnpm
2. **本地开发**: `pnpm dev` 启动开发服务器
3. **构建部署**: `pnpm build` 构建生产版本
4. **代码规范**: 遵循 ESLint 和 Prettier 配置

### API 文档
- `GET /api/netease-music` - 获取网易云音乐统计
- `GET /api/admin/profile` - 获取个人资料
- `POST /api/admin/profile` - 创建/更新个人资料

## 🤝 贡献指南

### 开发流程
1. Fork 项目仓库
2. 创建功能分支
3. 提交代码变更
4. 创建 Pull Request
5. 代码审查和合并

### 代码规范
- 使用 TypeScript 进行类型安全开发
- 遵循 ESLint 代码质量规则
- 使用 Prettier 保持代码格式一致
- 编写单元测试覆盖核心功能

## 📄 许可证

本项目采用 MIT 许可证，详见 [LICENSE](./LICENSE) 文件。

---

**最后更新**: 2024-03-15  
**文档版本**: v1.4.0  
**维护者**: HomeProfile 开发团队






----------------------------------------------------------------------------------

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
git clone https://github.com/wenroumao/ZeroHome.git
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

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fwenroumao%2FZeroHome&env=ADMIN_USERNAME,ADMIN_PASSWORD,STEAM_API_KEY,NETEASE_MUSIC_U,NEXTAUTH_SECRET)
1. 注册并登录 [Vercel](https://vercel.com/)。
2. 点击 "New Project"，导入您的 GitHub 仓库（如 wenroumao/ZeroHome）。
3. 选择 Next.js 框架，保持默认构建设置。
4. 在 **Settings → Environment Variables** 中，**手动添加所有环境变量**（与 `.env.example` 保持一致）。
5. 部署即可，访问分配的 Vercel 域名（如 `https://your-vercel-domain.vercel.app`）。

> ⚠️ Vercel 不会自动读取 `.env.local`，请务必在控制台手动配置环境变量！

---

### 5.5. 🌐 Netlify 部署

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https%3A%2F%2Fgithub.com%2Fwenroumao%2FZeroHome)


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




"projects": [
    {
      "id": "5d900e3f-3327-45a2-bc6a-5f9345429c5a",
      "title": "LOL-DeepWinPredictor",
      "description": "基于双向双层、引入注意力机制的LSTM对英雄联盟比赛胜率进行预测",
      "imageUrl": "https://socialify.git.ci/wenroumao/LOL-DeepWinPredictor/image?description=1&font=Source+Code+Pro&forks=1&issues=1&logo=https%3A%2F%2Fimg.viper3.top%2FLOL-DeepWinPredictor%2Flogo.png&name=1&owner=1&pulls=1&stargazers=1&theme=Light",
      "tags": [
        "Python",
        "Pytorch",
        "Flask",
        "Deep-Learning"
      ],
      "githubUrl": "https://github.com/wenroumao/LOL-DeepWinPredictor",
      "demoUrl": "https://lol.viper3.us.kg"
    },
    {
      "id": "new_1748645473744_dd8tokvshqb",
      "title": "ZeroHome",
      "description": "轻量、现代、更加配置化的一站式模版个人主页",
      "imageUrl": "https://socialify.git.ci/wenroumao/ZeroHome/image?description=1&forks=1&issues=1&logo=https%3A%2F%2Fimg.viper3.top%2FZeroHome%2Flogo.png&name=1&owner=1&pulls=1&stargazers=1&theme=Light",
      "tags": [
        "React",
        "Next.js"
      ],
      "githubUrl": "https://github.com/wenroumao/ZeroHome",
      "demoUrl": "https://viper3.top",
      "isPinned": false,
      "status": "published",
      "category": "",
      "priority": 4,
      "startDate": "2025-05-30",
      "endDate": ""
    },
    {
      "id": "e79e853f-20af-4814-a2a8-db440538528e",
      "title": "XOVideos",
      "description": "一个为用户打造的个性化视频下载工具",
      "imageUrl": "https://socialify.git.ci/wenroumao/XOVideos/image?description=1&font=Inter&forks=1&issues=1&logo=https%3A%2F%2Fimg.viper3.top%2FXOVideos%2Flogo.png&name=1&owner=1&pattern=Circuit+Board&pulls=1&stargazers=1&theme=Light",
      "tags": [
        "Python",
        "Crawler",
        "m3u8",
        "boto3"
      ],
      "githubUrl": "https://github.com/wenroumao/XOVideos",
      "demoUrl": ""
    },
    {
      "id": "new_1748409450807_zpiwj7ca8i",
      "title": "LightS4",
      "description": "一款基于React和fastapi的S3文件管理器，可在线管理文件",
      "imageUrl": "https://socialify.git.ci/wenroumao/LightS4/image?description=1&forks=1&issues=1&logo=https%3A%2F%2Fimg.viper3.top%2FLightS4%2Flogo.png&name=1&owner=1&pulls=1&stargazers=1&theme=Light",
      "tags": [
        "React",
        "FastAPI",
        "S3"
      ],
      "githubUrl": "https://github.com/wenroumao/LightS4",
      "demoUrl": "https://s4.viper3.top",
      "isPinned": false,
      "status": "published",
      "category": "",
      "priority": 1,
      "startDate": "2025-05-28",
      "endDate": ""
    },
    {
      "id": "new_1748413629164_jq6iiy5atp7",
      "title": "GSC-Kit",
      "description": "🚀 GSC-Kit旨在自动化从 Google Search Console (GSC) 提取数据，帮助高效地收集和整理网站的性能指标",
      "imageUrl": "https://socialify.git.ci/wenroumao/GSC-Kit/image?description=1&forks=1&issues=1&logo=https%3A%2F%2Fimg.viper3.top%2FGSC-Kit%2Flogo.png&name=1&owner=1&pulls=1&stargazers=1&theme=Light",
      "tags": [
        "Python",
        "JavaScript",
        "Google"
      ],
      "githubUrl": "https://github.com/wenroumao/BIPT-JWZX_eduAssess",
      "demoUrl": "",
      "isPinned": false,
      "status": "published",
      "category": "",
      "priority": 2,
      "startDate": "2025-05-28",
      "endDate": ""
    },
    {
      "id": "new_1748617519133_yc8awjlne2f",
      "title": "JD-comments",
      "description": "爬取京东商品评论数据",
      "imageUrl": "https://img.viper3.top/echo.viper3.top/zoel2D.jpg",
      "tags": [
        "Python",
        "Crawler",
        "Data-Analysis"
      ],
      "githubUrl": "https://github.com/wenroumao/JD-comments",
      "demoUrl": "",
      "isPinned": false,
      "status": "published",
      "category": "",
      "priority": 3,
      "startDate": "2025-05-30",
      "endDate": ""
    }
  ],







   "projects": [
    {
      "id": "5d900e3f-3327-45a2-bc6a-5f9345429c5a",
      "title": "LOL-DeepWinPredictor",
      "description": "基于双向双层、引入注意力机制的LSTM对英雄联盟比赛胜率进行预测",
      "imageUrl": "https://socialify.git.ci/Viper373/LOL-DeepWinPredictor/image?description=1&font=Source+Code+Pro&forks=1&issues=1&logo=https%3A%2F%2Fimg.viper3.top%2FLOL-DeepWinPredictor%2Flogo.png&name=1&owner=1&pulls=1&stargazers=1&theme=Light",
      "tags": [
        "Python",
        "Pytorch",
        "Flask",
        "Deep-Learning"
      ],
      "githubUrl": "https://github.com/Viper373/LOL-DeepWinPredictor",
      "demoUrl": "https://lol.viper3.us.kg"
    },
    {
      "id": "new_1748645473744_dd8tokvshqb",
      "title": "wenroumao",
      "description": "轻量、现代、更加配置化的一站式模版个人主页",
      "imageUrl": "https://socialify.git.ci/Viper373/ZeroHome/image?description=1&forks=1&issues=1&logo=https%3A%2F%2Fimg.viper3.top%2FZeroHome%2Flogo.png&name=1&owner=1&pulls=1&stargazers=1&theme=Light",
      "tags": [
        "React",
        "Next.js"
      ],
      "githubUrl": "https://github.com/wenroumao",
      "demoUrl": "https://blog.wenroumao.com",
      "isPinned": false,
      "status": "published",
      "category": "",
      "priority": 4,
      "startDate": "2025-09-21",
      "endDate": ""
    },
    {
      "id": "e79e853f-20af-4814-a2a8-db440538528e",
      "title": "XOVideos",
      "description": "一个为用户打造的个性化视频下载工具",
      "imageUrl": "https://socialify.git.ci/Viper373/XOVideos/image?description=1&font=Inter&forks=1&issues=1&logo=https%3A%2F%2Fimg.viper3.top%2FXOVideos%2Flogo.png&name=1&owner=1&pattern=Circuit+Board&pulls=1&stargazers=1&theme=Light",
      "tags": [
        "Python",
        "Crawler",
        "m3u8",
        "boto3"
      ],
      "githubUrl": "https://github.com/Viper373/XOVideos",
      "demoUrl": ""
    },


    {
      "id": "",
      "title": "",
      "description": "",
      "imageUrl": "",
      "tags": [
        "Python",
        "Crawler",
        "Data-Analysis"
      ],
      "githubUrl": "",
      "demoUrl": "",
      "isPinned": false,
      "status": "published",
      "category": "",
      "priority": 3,
      "startDate": "2025-05-30",
      "endDate": ""
    }
  ],