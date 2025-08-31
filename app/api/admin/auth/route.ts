import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

/**
 * 管理员登录认证接口
 * 此接口现在作为辅助认证检查，主要认证逻辑由 next-auth/route.ts 处理。
 * 废弃自定义 admin-token 机制，完全依赖 next-auth。
 * @param request Request
 * @returns NextResponse
 */
export async function POST(request: Request) {
  // For login, NextAuth's CredentialsProvider handles the POST request to /api/auth/callback/credentials
  // This file (app/api/admin/auth/route.ts) should ideally not be used for direct authentication POSTs.
  // It seems like a legacy route from a custom auth setup.
  // If this route is still intended for *some* purpose, it should verify session via getServerSession.
  // For now, we will respond with a method not allowed or an error.
  // The actual login POST is handled by next-auth on /api/auth/callback/credentials

  // To fully deprecate, we can return 405 Method Not Allowed or a specific message.
  return NextResponse.json({ message: "This route is deprecated. Please use NextAuth login." }, { status: 405 });
}
