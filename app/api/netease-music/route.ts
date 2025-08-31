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
    
    if (!musicU) {
      console.error('未配置MUSIC_U');
      return NextResponse.json({ code: 400, message: '未配置MUSIC_U，请在环境变量中设置' }, { status: 400 });
    }

    // 使用获取到的MUSIC_U请求网易云API
    const apiUrl = `${baseURL}/user/record?uid=${uid}&type=1&cookie=MUSIC_U=${encodeURIComponent(musicU)}`;
    
    const res = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Referer': 'https://music.163.com/'
      }
    });
    
    const data = await res.json();

    if (data.code !== 200) {
      console.error('网易云API返回错误:', data);
      return NextResponse.json({ code: data.code, message: data.message || '网易云API错误' }, { status: 500 });
    }

    const weekData = data.weekData || [];
    const top10 = weekData.slice(0, 10).map((record: any, idx: number) => {
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
    neteaseCache[cacheKey] = { data: top10, timestamp: now };
    return NextResponse.json({ code: 200, data: top10 });
  } catch (e: any) {
    console.error('网易云API请求失败:', e);
    return NextResponse.json({ code: 500, message: e.message || '服务器内部错误' }, { status: 500 });
  }
} 