import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route"; // Updated import path
import fs from 'fs';
import path from 'path';

const SETTINGS_PATH = path.resolve(process.cwd(), 'settings.json');

// Helper function to read settings
async function readSettings() {
  try {
    if (!fs.existsSync(SETTINGS_PATH)) {
      // 如果文件不存在，创建一个包含空项目数组的默认设置
      const defaultSettings = { projects: [] };
      fs.writeFileSync(SETTINGS_PATH, JSON.stringify(defaultSettings, null, 2));
      return defaultSettings;
    }
    const fileContent = fs.readFileSync(SETTINGS_PATH, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error("Error reading settings.json:", error);
    // 如果读取或解析失败，也返回一个带空项目数组的结构，避免后续操作失败
    return { projects: [] }; 
  }
}

// Helper function to write settings
async function writeSettings(data: any) {
  try {
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error writing settings.json:", error);
    throw new Error("Failed to write settings."); // 抛出错误，让调用者知道失败了
  }
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const settings = await readSettings();
    const projects = settings.projects || [];
    return NextResponse.json(projects); // 直接返回项目数组
  } catch (error) {
    console.error('[API /api/admin/projects GET] Error:', error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const newProjects = await request.json();
    if (!Array.isArray(newProjects)) {
      return NextResponse.json({ message: "Invalid project data format. Expected an array." }, { status: 400 });
    }

    const currentSettings = await readSettings();
    const updatedSettings = {
      ...currentSettings,
      projects: newProjects,
    };

    await writeSettings(updatedSettings);
    return NextResponse.json({ message: "Projects updated successfully" }, { status: 200 });

  } catch (error) {
    console.error('[API /api/admin/projects POST] Error:', error);
    // 检查是否是JSON解析错误
    if (error instanceof SyntaxError) {
        return NextResponse.json({ message: "Invalid JSON in request body." }, { status: 400 });
    }
    // 检查是否是写入文件时的自定义错误
    if (error instanceof Error && error.message === "Failed to write settings.") {
        return NextResponse.json({ message: "Failed to save project data to the server." }, { status: 500 });
    }
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
} 