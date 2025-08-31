import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // 导入 authOptions

// Determine the path to settings.json, assuming it's in the project root
const settingsFilePath = path.resolve(process.cwd(), 'settings.json');

/**
 * Handles GET requests to fetch footer settings.
 * 公开可访问，因为页脚通常不包含敏感隐私信息。
 */
export async function GET() {
  try {
    // Read the settings.json file
    let fileContents;
    try {
      fileContents = await fs.readFile(settingsFilePath, 'utf8');
    } catch (readError: any) {
      if (readError.code === 'ENOENT') {
        // settings.json does not exist, return default empty footer structure
        console.warn("settings.json not found. Returning default empty footer.");
        return NextResponse.json({ items: [] });
      }
      throw readError; // Re-throw other read errors
    }
    
    const settings = JSON.parse(fileContents);

    // Return the footer part of the settings, or a default if it doesn't exist
    return NextResponse.json(settings.footer || { items: [] });

  } catch (error) {
    console.error("Error processing GET /api/footer:", error);
    return NextResponse.json({ message: 'Error reading footer settings' }, { status: 500 });
  }
}

/**
 * Handles PUT requests to update footer settings.
 * 需要认证，只有管理员才能修改页脚设置。
 */
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions); // 使用 NextAuth.js 获取会话

  // 检查用户是否已登录且是管理员
  if (!session || (session.user as any)?.role !== "admin") { // 假设 admin 角色已在 authOptions 的 session callback 中设置
    return NextResponse.json({ message: 'Unauthorized: Access Denied' }, { status: 403 });
  }

  try {
    const newFooterData = await request.json();

    // Validate the incoming data structure if necessary
    if (!newFooterData || typeof newFooterData !== 'object' || !Array.isArray(newFooterData.items)) {
      return NextResponse.json({ message: 'Invalid footer data format. Expected { items: [...] }.' }, { status: 400 });
    }

    let settings;
    try {
      // Read the current settings.json file
      const fileContents = await fs.readFile(settingsFilePath, 'utf8');
      settings = JSON.parse(fileContents);
    } catch (readError: any) {
      if (readError.code === 'ENOENT') {
         // settings.json does not exist, create a new one with the footer data
        console.warn("settings.json not found during PUT. Creating a new one.");
        settings = {}; // Initialize empty settings
      } else {
        throw readError; // Re-throw other read errors
      }
    }
    
    // Update the footer part of the settings
    settings.footer = newFooterData;

    // Write the updated settings back to settings.json
    await fs.writeFile(settingsFilePath, JSON.stringify(settings, null, 2), 'utf8');
    
    console.log("页脚设置已成功更新于 settings.json"); // Log in Chinese too if you prefer
    return NextResponse.json({ message: '页脚设置已成功更新。' }); //  <--- 修改这里为中文

  } catch (error) {
    console.error("处理 PUT /api/footer 时出错:", error);
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
        return NextResponse.json({ message: '请求体中的JSON格式无效。' }, { status: 400 });
    }
    return NextResponse.json({ message: '更新页脚设置时出错。' }, { status: 500 }); // 也可考虑将错误消息改为中文
  }
} 