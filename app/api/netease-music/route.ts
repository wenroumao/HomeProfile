import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// 内存缓存对象
const neteaseCache: Record<string, { data: any, timestamp: number }> = {};
const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12小时

// 检查是否为强制刷新请求
function isHardReload(request: Request): boolean {
  const cacheControl = request.headers.get('Cache-Control');
  return Boolean(cacheControl?.includes('no-cache') || cacheControl?.includes('max-age=0'));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // 支持从query或环境变量获取uid
  const uid = searchParams.get('uid') || process.env.NETEASE_USER_ID;
  const baseURL = 'https://neteasecloudmusicapi.wenroumao.com';
  
  // 检查是否为强制刷新
  const isForceRefresh = isHardReload(request);
  
  if (!uid) {
    console.error('未提供网易云用户ID');
    return NextResponse.json({ code: 400, message: '缺少uid参数' }, { status: 400 });
  }

  // 使用缓存，除非是强制刷新
  const cacheKey = `netease-${uid}`;
  const now = Date.now();
  const cached = neteaseCache[cacheKey];
  if (cached && (now - cached.timestamp < CACHE_DURATION) && !isForceRefresh) {
    console.log('使用网易云音乐API缓存数据');
    return NextResponse.json({ code: 200, data: cached.data });
  }

  try {
    // 先获取profile-public中的MUSIC_U
    const profileRes = await fetch(new URL('/api/profile-public', request.url).toString());
    const musicU = process.env.NETEASE_MUSIC_U;
    
    if (!musicU || musicU === 'your_actual_music_u_cookie_value_here') {
      console.error('未配置有效的MUSIC_U Cookie');
      return NextResponse.json({ 
        code: 400, 
        message: '未配置有效的MUSIC_U Cookie。请在.env.local文件中设置正确的NETEASE_MUSIC_U值。获取方法：登录网易云音乐网页版 -> F12开发者工具 -> Application -> Cookies -> music.163.com -> 找到MUSIC_U的值' 
      }, { status: 400 });
    }

    // 使用获取到的MUSIC_U请求网易云API
    const apiUrl = `${baseURL}/user/record?uid=${uid}&type=1`;
    
    const res = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Referer': 'https://music.163.com/',
        'Cookie': `MUSIC_U=${musicU}`
      }
    });
    
    const data = await res.json();
    console.log('网易云API响应:', JSON.stringify(data, null, 2));

    if (data.code !== 200) {
      console.error('网易云API返回错误:', data);
      return NextResponse.json({ 
        code: data.code, 
        message: data.message || '网易云API错误。可能原因：1) MUSIC_U Cookie无效或过期 2) 用户ID不正确 3) API服务不可用',
        debug: process.env.NODE_ENV === 'development' ? data : undefined
      }, { status: 500 });
    }

    const weekData = data.weekData || [];
    // 增加显示的歌曲数量到50首，并支持通过查询参数自定义
    const limit = parseInt(searchParams.get('limit') || '100');
    const songList = weekData.slice(0, limit).map((record: any, idx: number) => {
      const song = record.song;
      return {
        rank: idx + 1,
        id: song.id,
        name: song.name,
        artists: song.ar.map((a: any) => a.name),
        album: song.al.name,
        playCount: record.playCount,
        score: record.score,
        duration: song.dt,
        cover: song.al.picUrl
      };
    });

    // 写入缓存
    neteaseCache[cacheKey] = { data: songList, timestamp: now };
    return NextResponse.json({ code: 200, data: songList });
  } catch (e: any) {
    console.error('网易云API请求失败:', e);
    return NextResponse.json({ code: 500, message: e.message || '服务器内部错误' }, { status: 500 });
  }
}