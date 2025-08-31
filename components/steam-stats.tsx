"use client"

import { useState, useEffect, memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { SiSteam } from "react-icons/si";

interface GameData {
  appid: number
  name: string
  playtime_forever: number
  img_icon_url: string
  playtime_2weeks?: number
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
const STEAM_CACHE_KEY = 'steam_stats_data';
// 缓存过期时间（6小时）
const CACHE_EXPIRY = 6 * 60 * 60 * 1000;

// 使用memo优化组件，避免不必要的重新渲染
export const SteamStats = memo(function SteamStats() {
  const [games, setGames] = useState<GameData[]>([])
  const [ownedGames, setOwnedGames] = useState<GameData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [steamProfileUrl, setSteamProfileUrl] = useState<string | null>(null)
  const [cacheUsed, setCacheUsed] = useState(false)
  const [profileData, setProfileData] = useState<any>(null)
  const { t, ready } = useTranslation()

  // 从 /api/profile-public 获取 steam_user_id，并使用它来调用 /api/steam
  useEffect(() => {
    const fetchProfileConfigAndStats = async () => {
      setLoading(true);
      setError(null);
      
      // 检查本地缓存
      const now = Date.now();
      const cachedData = localStorage.getItem(STEAM_CACHE_KEY);
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
              
            console.log('使用Steam缓存数据，剩余有效时间:', hours, '小时', minutes, '分钟');
            
            setGames(parsed.data?.recentGames || []);
            setOwnedGames(parsed.data?.topOwnedGames || []);
            setSteamProfileUrl(parsed.steamProfileUrl || null);
            setLoading(false);
            setCacheUsed(true);
            
            // 显示缓存命中提示 - 改为success类型(绿色)
            toast.success(`${t("cacheTimeFormat.steamCacheUsed")} ${timeDisplay}`, {
              position: 'top-center',
              duration: 3000,
              id: 'steam-cache-info',
              icon: <SiSteam className="h-4 w-4" />,
              style: { maxWidth: '400px', width: 'max-content' }
            });
            
            return;
          } else if (parsed.timestamp) {
            console.log('Steam缓存已过期，已过期:', Math.round((now - parsed.timestamp - CACHE_EXPIRY) / (60 * 1000)), '分钟');
          }
        } catch (e) {
          console.error('解析缓存数据失败', e);
          // 缓存解析失败，继续获取新数据
        }
      } else if (isForceRefresh) {
        console.log('Steam - 强制刷新，跳过缓存');
      } else if (!cachedData) {
        console.log('Steam - 未找到缓存数据');
      }
      
      setCacheUsed(false);
      
      try {
        // 1. 从 /api/profile-public 获取配置
        const res = await fetch('/api/profile-public');
        if (!res.ok) throw new Error('Failed to fetch profile data');
        const profileData = await res.json();
        setProfileData(profileData); // 保存整个配置数据
        const userId = profileData.steam_user_id;
        const apiKey = profileData.steam_api_key; // Assuming your /api/steam needs apiKey

        // 查找 steam 社交链接
        if (Array.isArray(profileData.socialLinks)) {
          const steamLink = profileData.socialLinks.find((l: any) => l.type?.toLowerCase() === 'steam');
          if (steamLink && steamLink.url) setSteamProfileUrl(steamLink.url);
        } else if (Array.isArray(profileData.social_links)) {
          const steamLink = profileData.social_links.find((l: any) => l.type?.toLowerCase() === 'steam');
          if (steamLink && steamLink.url) setSteamProfileUrl(steamLink.url);
        }

        if (!userId) {
          // 如果没有配置 userId，显示错误或不显示组件
          setError(t("steam.userIdMissing"));
          setGames([]); // Clear old data
          setOwnedGames([]);
          return; // Stop here if no user ID
        }

        // 2. 使用配置调用 /api/steam 接口
        const steamApiResponse = await fetch(`/api/steam?userId=${userId}&apiKey=${apiKey}`); 
        
        if (!steamApiResponse.ok) {
           const errorData = await steamApiResponse.json().catch(() => ({ message: t("steam.errorFetching") }));
           throw new Error(errorData.message || t("steam.errorFetching"));
        }

        const data = await steamApiResponse.json();

        if (data.success && data.data) {
           setGames(data.data.recentGames || []); 
           setOwnedGames(data.data.topOwnedGames || []);
           
           // 保存到本地缓存
           localStorage.setItem(STEAM_CACHE_KEY, JSON.stringify({
             data: data.data,
             steamProfileUrl: steamProfileUrl,
             timestamp: now
           }));
        } else {
          console.error("Unexpected data structure from /api/steam:", data);
          setError(t("steam.errorApiStructure"));
          setGames([]);
          setOwnedGames([]);
        }

      } catch (err: any) {
        console.error("Error fetching Steam stats:", err);
        setError(err.message || t("steam.errorFetching"));
        setGames([]);
        setOwnedGames([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileConfigAndStats();
  }, [t, ready]); // Add t to dependencies as it's used in error messages

  if (loading || !ready) { // Wait for i18n to be ready
    return (
      <Card className="bg-white/[.60] dark:bg-black/[.30] dark:bg-black/[.30] border border-white/10 shadow-xl rounded-2xl transition-all hover:shadow-2xl hover:scale-[1.01] w-full h-full">
        <CardHeader className="bg-transparent">
          <CardTitle className="flex items-center justify-center gap-2 text-xl bg-transparent">
            <SiSteam className="h-7 w-7" />
            {t('steam.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-center py-4">
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-10 w-10 bg-muted rounded" />
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

  return (
    <Card className="bg-white/[.60] dark:bg-black/[.30] border border-white/10 shadow-xl rounded-2xl transition-all hover:shadow-2xl hover:scale-[1.01] w-full h-full">
      <CardHeader className="bg-transparent pb-2">
        <CardTitle className="flex items-center justify-center gap-3 text-2xl font-bold bg-transparent">
          <SiSteam className="h-8 w-8" />
          {t('steam.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 py-3 bg-transparent">
        {/* 最近游玩 */}
        <div>
          <h4 className="text-md font-semibold mb-2 flex items-center gap-2"><span className="inline-block w-2 h-2 rounded-full bg-blue-500" />{t("steam.recentActivity")}</h4>
          <ul className="grid grid-cols-[repeat(3,minmax(0,1fr))] gap-3">
            {games.map((game) => (
              <li key={game.appid}>
                <a href={`https://store.steampowered.com/app/${game.appid}/`} target="_blank" rel="noopener noreferrer" className="flex flex-row items-center group hover:bg-white/20 dark:hover:bg-black/30 rounded-lg p-2 transition">
                  <img
                    src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`}
                    alt={game.name}
                    className="h-10 w-10 rounded shadow object-cover"
                    onError={(e) => (e.currentTarget.src = "/images/vapo.gif")}
                  />
                  <div className="ml-3 flex-1 w-auto">
                    <span className="block font-medium text-sm text-foreground whitespace-nowrap">{game.name}</span>
                    <span 
                      className="block text-xs text-muted-foreground whitespace-nowrap" 
                      style={{ textShadow: '0px 0px 5px rgba(0,0,0,0.7)' }}
                    >
                      {t("steam.hoursPlayedRecent", { hours: game.playtime_2weeks !== undefined ? (game.playtime_2weeks / 60).toFixed(1) : 'N/A' })}
                    </span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
        {/* 最爱玩 */}
        <div>
          <h4 className="text-md font-semibold mb-2 flex items-center gap-2"><span className="inline-block w-2 h-2 rounded-full bg-green-500" />{t("steam.topOwnedGames")}</h4>
          <ul className="grid grid-cols-[repeat(3,minmax(0,1fr))] gap-3">
            {ownedGames.map((game) => (
              <li key={game.appid}>
                <a href={`https://store.steampowered.com/app/${game.appid}/`} target="_blank" rel="noopener noreferrer" className="flex flex-row items-center group hover:bg-white/20 dark:hover:bg-black/30 rounded-lg p-2 transition">
                  <img
                    src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`}
                    alt={game.name}
                    className="h-10 w-10 rounded shadow object-cover"
                    onError={(e) => (e.currentTarget.src = "/images/vapo.gif")}
                  />
                  <div className="ml-3 flex-1 w-auto">
                    <span className="block font-medium text-sm text-foreground whitespace-nowrap">{game.name}</span>
                    <span 
                      className="block text-xs text-muted-foreground whitespace-nowrap" 
                      style={{ textShadow: '0px 0px 5px rgba(0,0,0,0.7)' }}
                    >
                      {t("steam.hoursPlayedTotal", { hours: game.playtime_forever !== undefined ? (game.playtime_forever / 60).toFixed(1) : 'N/A' })}
                    </span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
})
