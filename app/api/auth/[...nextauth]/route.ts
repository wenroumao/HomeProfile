import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";

// 使用 Node.js 的 fs 和 path 模块读取 JSON
import fs from 'fs';
import path from 'path';

// 在这里添加日志来检查 NEXTAUTH_SECRET 的值

// 构建 settings.json 的绝对路径
// process.cwd() 返回项目根目录
const settingsPath = path.join(process.cwd(), 'settings.json');
let settings: any = {}; // 提供一个默认空对象
try {
  if (fs.existsSync(settingsPath)) { // 检查文件是否存在
    const fileContents = fs.readFileSync(settingsPath, 'utf8');
    settings = JSON.parse(fileContents);
  } else {
    console.error(`[NextAuth] settings.json not found at path: ${settingsPath}`);
    // 可以设置默认的 profile 对象以避免运行时错误
    settings.profile = { avatar_url: '' };
  }
} catch (error) {
  console.error("[NextAuth] Error reading or parsing settings.json:", error);
  settings.profile = { avatar_url: '' }; // 发生错误时也设置默认值
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "用户名", type: "text" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        const username = credentials?.username;
        const password = credentials?.password;
        const envUsername = process.env.ADMIN_USERNAME;
        const envPassword = process.env.ADMIN_PASSWORD;

        // 关键检查：确保 ADMIN_USERNAME 和 ADMIN_PASSWORD 环境变量已设置
        if (!envUsername || !envPassword) {
          console.error(
            "[NextAuth][authorize] 错误：ADMIN_USERNAME 或 ADMIN_PASSWORD 环境变量未设置。"
          );
          return null;
        }

        if (!username || !password) {
          return null;
        }
        if (username !== envUsername) {
          return null;
        }
        if (password !== envPassword) {
          return null;
        }

        // 登录成功，从 settings.json 获取头像 URL (确保 settings 和 settings.profile 存在)
        const adminAvatarUrl = settings?.profile?.avatar_url || null; // 如果未找到，默认为 null

        const userToReturn = {
          id: "admin",
          name: username,
          image: adminAvatarUrl, // 将头像 URL 添加到 User 对象
        };
        return userToReturn as User;
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: 60 * 60 * 24 * 30, // 30天
  },
  jwt: {
    // 使用 NEXTAUTH_SECRET 作为 JWT 的主要 secret
    // secret: process.env.ADMIN_JWT_SECRET || "changeme-secret",
    // 注意：NextAuth 会自动使用 NEXTAUTH_SECRET 环境变量（如果已设置）。
    // 如果 NEXTAUTH_SECRET 已设置，则明确指定这里的 secret 是可选的，
    // 但为了清晰，可以保留或移除。如果移除，确保 NEXTAUTH_SECRET 环境变量已设置。
    // 为了依赖 .env.local 中的 NEXTAUTH_SECRET，我们可以注释掉这一行或确保其值与 NEXTAUTH_SECRET 一致。
    // 为简单起见，我们假设 NEXTAUTH_SECRET 将被设置，NextAuth 会自动使用它。
    // 因此，这里的 'secret' 字段可以省略，或者明确指向 process.env.NEXTAUTH_SECRET
    secret: process.env.NEXTAUTH_SECRET, // 显式使用 NEXTAUTH_SECRET
    // （可选）如果你想在 JWT token 中也存储头像
    // async encode({ secret, token, maxAge }) {
    //   // 自定义 encode
    //   return await encode({ secret, token, maxAge });
    // },
    // async decode({ secret, token }) {
    //   // 自定义 decode
    //   return await decode({ secret, token });
    // },
  },
  pages: {
    signIn: "/admin/login", // 可自定义登录页
  },
  callbacks: {
    // （可选但推荐）jwt 回调，将 user.image 保存到 token
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user?.image) {
        token.picture = user.image; // next-auth/jwt 倾向于使用 token.picture
      }
      if (user?.name) { // 确保用户名也传递到 token
        token.name = user.name;
      }
      // token.role = "admin"; // 也可以在这里设置角色
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        // 从 token 中获取头像，并赋值给 session.user.image
        if (token.picture) {
          session.user.image = token.picture as string;
        }
        // 确保 session.user.name 也被正确设置 (如果 token.name 存在)
        if (token.name) {
            session.user.name = token.name;
        }
        // 添加角色
        (session.user as any).role = "admin";
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 