"use client"

import { useState, useEffect, memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslation } from "react-i18next"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { SiNeteasecloudmusic } from "react-icons/si"
import { FiMusic } from "react-icons/fi"

interface SongRecord {
  id: number;
  name: string;
  artists: string[];
  album: string;
  playCount: number;
  score: number;
  duration: number;
  cover: string;
}

// 这是一个模拟函数，你需要替换为实际调用你的后端 API 的逻辑
// 比如你的后端 /api/netease-music 接口需要 netease_user_id 和 netease_music_u
// 这个函数就应该接收这两个参数，并调用你的后端接口
async function fetchNeteaseMusicStats(userId: string, userToken?: string): Promise<{ songCount: number } | null> {
  try {
    // TODO: 替换为实际调用你的后端 /api/netease-music 接口的逻辑
    // 你的 /api/netease-music 接口应该负责使用 netease_user_id 和 netease_music_u 去调用网易云音乐官方 API
    // 并返回你需要展示的数据 (例如听歌数量)
    // 这里只是一个占位符示例
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
    // 模拟成功返回数据
    return { songCount: Math.floor(Math.random() * 10000) };
  } catch (error) {
    console.error("Failed to fetch Netease Music stats:", error);
    return null; // 获取失败时返回 null
  }
}

// 检查是否为强制刷新 (Ctrl+F5)
function isHardReload() {
  if (typeof window !== 'undefined') {
    // 改进检测方法：使用navigation.type和currentEntry.type的组合检测
    const isReloadNavigation = window.performance && 
      window.performance.navigation && 
      window.performance.navigation.type === 1;
      
    const isReloadEntry = window.performance && 
      window.performance.getEntriesByType && 
      window.performance.getEntriesByType("navigation").length > 0 && 
      (window.performance.getEntriesByType("navigation")[0] as any)?.type === 'reload';

    // 检查特定的Cache-Control头，通常在硬刷新时会发送
    const hasCacheControlHeaders = !!sessionStorage.getItem('force_refresh');
    
    // 执行硬刷新时，所有这些条件通常会同时满足
    return (isReloadNavigation || isReloadEntry) && hasCacheControlHeaders;
  }
  return false;
}

// 设置一个监听器来检测强制刷新
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    // 在页面卸载前检测是否按住了Ctrl键
    if (window.event && (window.event as any).ctrlKey) {
      sessionStorage.setItem('force_refresh', 'true');
    }
  });
  
  window.addEventListener('load', () => {
    // 页面加载完成后移除标记
    setTimeout(() => {
      sessionStorage.removeItem('force_refresh');
    }, 1000);
  });
}

// 缓存键
const NETEASE_CACHE_KEY = 'netease_music_data';
// 缓存过期时间（12小时）
const CACHE_EXPIRY = 12 * 60 * 60 * 1000;

// 使用memo优化组件，避免不必要的重新渲染
export const NeteaseMusicStats = memo(function NeteaseMusicStats() {
  const [records, setRecords] = useState<SongRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { t } = useTranslation()
  const [stats, setStats] = useState<{ songCount: number } | null>(null);
  const [cacheUsed, setCacheUsed] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  // 从 /api/profile-public 获取 netease_user_id 和 netease_music_u
  useEffect(() => {
    const fetchProfileConfig = async () => {
      try {
        const res = await fetch('/api/profile-public');
        if (!res.ok) throw new Error('Failed to fetch profile data');
        const data = await res.json();
        const userId = data.netease_user_id;
        const userToken = data.netease_music_u; // 如果你需要使用这个 token

        if (userId) {
          // 使用获取到的 userId 和 userToken (如果需要) 调用获取网易云音乐数据的函数
          const musicData = await fetchNeteaseMusicStats(userId, userToken);
          setStats(musicData);
        } else {
          // 如果没有配置 userId，则不显示组件
          setStats(null);
        }
      } catch (e) {
        console.error("Error fetching Netease Music config or stats:", e);
        setStats(null); // 获取配置或数据失败时设置为 null
      } finally {
        setLoading(false);
      }
    };
    fetchProfileConfig();
  }, []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      
      // 检查本地缓存
      const now = Date.now();
      const cachedData = localStorage.getItem(NETEASE_CACHE_KEY);
      const isForceRefresh = isHardReload();
      
      // 如果有缓存且未过期且不是强制刷新，使用缓存数据
      if (cachedData && !isForceRefresh) {
        try {
          const parsed = JSON.parse(cachedData);
          
          if (parsed.timestamp && (now - parsed.timestamp < CACHE_EXPIRY)) {
            const remainingMinutes = Math.round((parsed.timestamp + CACHE_EXPIRY - now) / (60 * 1000));
            const hours = Math.floor(remainingMinutes / 60);
            const minutes = remainingMinutes % 60;
            
            // 格式化显示时间，支持国际化
            let timeDisplay;
            if (hours > 0) {
              timeDisplay = t("cacheTimeFormat.hoursAndMinutes", { hours, minutes });
            } else {
              timeDisplay = t("cacheTimeFormat.minutes", { minutes });
            }
            
            console.log('使用网易云音乐缓存数据，剩余有效时间:', hours, '小时', minutes, '分钟');
            
            setRecords(parsed.records || []);
            setLoading(false);
            setCacheUsed(true);
            
            // 显示缓存命中提示 - 改为success类型(绿色)
            toast.success(`${t("cacheTimeFormat.neteaseCacheUsed")} ${timeDisplay}`, {
              position: 'top-center',
              duration: 3000,
              id: 'netease-cache-info',
              icon: <SiNeteasecloudmusic className="h-4 w-4" />,
              style: { maxWidth: '400px', width: 'max-content' }
            });
            
            return;
          } else if (parsed.timestamp) {
            console.log('网易云音乐缓存已过期，已过期:', Math.round((now - parsed.timestamp - CACHE_EXPIRY) / (60 * 1000)), '分钟');
          }
        } catch (e) {
          console.error('解析网易云音乐缓存数据失败', e);
          // 缓存解析失败，继续获取新数据
        }
      } else if (isForceRefresh) {
        console.log('网易云音乐 - 强制刷新，跳过缓存');
        toast.success('网易云音乐组件检测消息', {
          position: 'top-center',
          duration: 2000,
          id: 'netease-force-refresh'
        });
      } else if (!cachedData) {
        console.log('网易云音乐 - 未找到缓存数据');
      }
      
      setCacheUsed(false);
      
      try {
        // 获取网易云用户ID
        const profileRes = await fetch('/api/profile-public')
        const profile = await profileRes.json()
        setProfileData(profile);
        
        // 从profile对象或者直接从profile.netease_user_id获取用户ID
        let uid = profile.netease_user_id;
        if (!uid && profile.profile) {
          uid = profile.profile.netease_user_id;
        }
        
        console.log('获取到的网易云用户ID:', uid);
        
        if (!uid) {
          setError(t('neteaseMusic.noUserId'));
          setLoading(false);
          return;
        }
        
        // 获取最近一周听歌记录
        const res = await fetch(`/api/netease-music?uid=${uid}`);
        const data = await res.json();
        if (!data.data || data.data.length === 0) {
          setError(t('neteaseMusic.noRecords'));
          setLoading(false);
          return;
        }
        
        setRecords(data.data)
        
        // 保存到本地缓存
        localStorage.setItem(NETEASE_CACHE_KEY, JSON.stringify({
          records: data.data,
          timestamp: now
        }));
        console.log('网易云音乐数据已缓存，有效期12小时');
      } catch (e: any) {
        console.error('获取网易云音乐数据失败:', e);
        setError(t('neteaseMusic.fetchError') + (e.message || '未知错误'));
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [t])

  if (loading) {
    return (
      <Card className="bg-white/[.60] dark:bg-black/[.30] border border-white/10 shadow-xl rounded-2xl flex flex-col justify-center items-center p-4 transition-all hover:shadow-2xl hover:scale-[1.01] w-full h-full">
        <CardHeader className="pt-0 pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <SiNeteasecloudmusic className="text-red-500 h-5 w-5" /> {t("neteaseMusic.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-center items-center w-full px-0 pb-0">
          <div className="space-y-3 w-full max-w-xs">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-10 w-10 bg-muted rounded-full" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-white/[.60] dark:bg-black/[.30] border border-white/10 shadow-xl rounded-2xl flex flex-col justify-center items-center p-4 transition-all hover:shadow-2xl hover:scale-[1.01] w-full h-full">
        <CardHeader className="pb-2 pt-0">
          <CardTitle className="flex items-center gap-2 text-lg">
            <SiNeteasecloudmusic className="text-red-500 h-5 w-5" /> {t("neteaseMusic.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-center items-center text-center">
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (records.length === 0) {
    return (
      <Card className="bg-white/[.60] dark:bg-black/[.30] border border-white/10 shadow-xl rounded-2xl flex flex-col justify-center items-center p-4 transition-all hover:shadow-2xl hover:scale-[1.01] w-full h-full">
        <CardHeader className="pb-2 pt-0">
          <CardTitle className="flex items-center gap-2 text-lg">
            <SiNeteasecloudmusic className="text-red-500 h-5 w-5" /> {t("neteaseMusic.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-center items-center text-center">
          <p className="text-sm text-muted-foreground">{t("neteaseMusic.noData")}</p>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return null;
  }

  // 展示最近一周听歌明细，风格与Steam统计一致
  return (
    <Card className="bg-white/[.60] dark:bg-black/[.30] border border-white/10 shadow-xl rounded-2xl flex flex-col p-1 transition-all hover:shadow-2xl hover:scale-[1.01] w-full h-full overflow-hidden">
      <CardHeader className="pt-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <SiNeteasecloudmusic className="text-red-500 h-6 w-6" /> {t("neteaseMusic.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="bg-transparent pt-3 w-full">
        <h4 className="text-md font-semibold mb-2 flex items-center gap-2"><span className="inline-block w-2 h-2 rounded-full bg-red-500" />{t('neteaseMusic.recentPlaysTitle')}</h4>
        <ul className="grid grid-cols-3 gap-3">
          {records.map((song) => (
            <li key={song.id}>
              <a
                href={`https://music.163.com/song?id=${song.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 group hover:bg-white/20 dark:hover:bg-black/30 rounded-lg p-2 transition"
              >
                <img
                  src={song.cover}
                  alt={song.name}
                  className="h-10 w-10 rounded shadow object-cover"
                />
                <div className="min-w-0">
                  <p className="font-medium text-sm text-foreground whitespace-nowrap">{song.name}</p>
                  <p 
                    className="text-xs text-muted-foreground whitespace-nowrap" 
                    style={{ textShadow: '0px 0px 5px rgba(0,0,0,0.7)' }}
                  >
                    {song.artists.join(' / ')} · {song.playCount}{t('neteaseMusic.playCountUnit')}
                  </p>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
})
