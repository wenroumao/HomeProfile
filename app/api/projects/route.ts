import { NextResponse } from "next/server"
import fs from 'fs';
import path from 'path';

const SETTINGS_PATH = path.resolve(process.cwd(), 'settings.json');

function readSettings() {
  if (!fs.existsSync(SETTINGS_PATH)) {
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify({}, null, 2));
  }
  return JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf-8'));
}

/**
 * 处理获取所有已发布的项目的请求 (供前台使用)
 * @param request Request
 * @returns NextResponse
 */
export async function GET(request: Request) {
  try {

    // 从settings.json中读取项目数据而不是使用SQL
    const settings = readSettings();
    const projects = settings.projects || [];

    return NextResponse.json(
      {
        success: true,
        message: 'Published projects fetched successfully.',
        data: projects,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('[API /api/projects GET] Error fetching published projects:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error while fetching published projects.', errorDetails: (error as Error).message },
      { status: 500 }
    );
  }
}
