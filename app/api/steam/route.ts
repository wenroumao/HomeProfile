import { NextResponse } from 'next/server';

// Simple in-memory cache object
// Key: 'steam-' + userId
// Value: { data: any, timestamp: number }
const steamCache: Record<string, { data: any, timestamp: number }> = {};
// Cache expiration time in milliseconds (e.g., 1 day)
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6小时 

// 检查是否为强制刷新请求
function isHardReload(request: Request): boolean {
  const cacheControl = request.headers.get('Cache-Control');
  return Boolean(cacheControl?.includes('no-cache') || cacheControl?.includes('max-age=0'));
}

// Based on user's provided example class
class SteamGameTracker {
    private apiKey: string;
    private baseUrl: string = 'http://api.steampowered.com';

    constructor(apiKey: string) {
        if (!apiKey) {
            throw new Error("Steam API Key is required.");
        }
        this.apiKey = apiKey;
    }
    
    async fetchSteamAPI(endpoint: string, params?: Record<string, any>): Promise<any> {
        const url = new URL(`${this.baseUrl}${endpoint}`);
        url.searchParams.append('key', this.apiKey);
        url.searchParams.append('format', 'json');
        
        // Add other parameters
        if (params) {
            Object.keys(params).forEach(key => {
                 // Only append defined parameters
                if (params[key] !== undefined && params[key] !== null) {
                     url.searchParams.append(key, params[key]);
                }
            });
        }

        try {
            const response = await fetch(url);
            // Steam API often returns 200 even on logical errors (like invalid key or private profile)
            // Need to check the response body for success/error indicators if available
            // For now, we'll just check response.ok for basic HTTP errors
            if (!response.ok) {
                console.error(`Steam API HTTP error: ${response.status} ${response.statusText}`);
                // Try to read error body if available
                 const errorBody = await response.text().catch(() => "No response body");
                 console.error("Steam API Error Body:", errorBody);
                throw new Error(`Steam API HTTP错误: ${response.status}`);
            }
            const data = await response.json();
            // Further check if the API returned a specific error payload
            // (This varies by Steam API endpoint, might need specific checks for each call)
            // If 'response' key is missing or empty, it might indicate an issue
            if (!data || !data.response) {
                 console.warn("Steam API response missing 'response' key or is empty:", data);
            }
            return data;
        } catch (error: any) { // Explicitly type error as any for easier handling
            console.error('Steam API Request failed:', error);
            throw new Error(`调用Steam API失败: ${error.message}`);
        }
    }
    
    async getRecentlyPlayedGames(steamId: string): Promise<any> {
        
        // Docs: https://partner.steamgames.com/doc/webapi/IPlayerService#GetRecentlyPlayedGames
        const endpoint = '/IPlayerService/GetRecentlyPlayedGames/v0001/';
        const params = { steamid: steamId };

        const data = await this.fetchSteamAPI(endpoint, params);
        
        // The expected structure from Steam API is like: { "response": { "total_count": 0, "games": [...] } }
        // If user profile is private or API key is invalid, 'response' might be empty or missing.
        if (data && data.response) {
             return data.response; // Return the 'response' object which contains total_count and games array
        } else if (data && Object.keys(data).length === 0) {
             // Sometimes Steam API returns an empty object {} for private profiles/invalid key
             console.warn("Backend: Steam API returned empty object, possibly private profile or invalid key.");
             // Return a structure that indicates no games found, similar to a valid empty response
             return { total_count: 0, games: [] };
        } else {
             console.error("Backend: Failed to get 'response' field from Steam API data or data is null.", data);
            throw new Error('Steam API返回数据格式不正确或用户资料不公开');
        }
    }

    // Add other methods from the example if needed later (e.g., getOwnedGames)
    // async getOwnedGames(steamId) { /* ... */ }
    // async getGameStatsSummary(steamId) { /* ... */ }
    async getOwnedGames(steamId: string): Promise<any> {

        // Docs: https://partner.steamgames.com/doc/webapi/IPlayerService#GetOwnedGames
        const endpoint = '/IPlayerService/GetOwnedGames/v0001/';
        const params = {
            steamid: steamId,
            include_appinfo: 'true', // Get game names and icons
            include_played_free_games: 'true'
        };

        const data = await this.fetchSteamAPI(endpoint, params);

        if (data && data.response && Array.isArray(data.response.games)) {
            // Sort games by playtime_forever descending and take top 5
            const topGames = data.response.games.sort((a: any, b: any) => {
                return (b.playtime_forever || 0) - (a.playtime_forever || 0);
            }).slice(0, 5);

            return { game_count: data.response.game_count, games: topGames };
        } else if (data && Object.keys(data).length === 0) {
             console.warn("Backend: Steam API returned empty object for owned games.");
             return { game_count: 0, games: [] };
        } else {
             console.error("Backend: Failed to get owned games data.", data);
             throw new Error('Steam API返回拥有的游戏数据格式不正确或用户资料不公开');
        }
    }

    // async getGameStatsSummary(steamId) { /* ... */ }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const apiKey = searchParams.get('apiKey');
  const cacheKey = 'steam-' + userId; // Generate cache key based on user ID
  const isForceRefresh = isHardReload(request); // 检查是否强制刷新

  // 1. 验证参数
  if (!userId) {
    console.error("[API Steam] Missing userId parameter");
    return NextResponse.json({ success: false, message: '缺少Steam用户ID参数' }, { status: 400 });
  }
   if (!apiKey) {
    console.error("[API Steam] Missing apiKey parameter");
    return NextResponse.json({ success: false, message: '缺少Steam API Key参数' }, { status: 400 });
  }

  // 2. 检查缓存
  const cachedData = steamCache[cacheKey];
  const now = Date.now();

  // 使用缓存，除非是强制刷新或缓存已过期
  if (cachedData && (now - cachedData.timestamp < CACHE_DURATION) && !isForceRefresh) {
    console.log(`[API Steam] 使用缓存数据，userId: ${userId}`);
    return NextResponse.json({ success: true, data: cachedData.data });
  }
  
  if (isForceRefresh) {
    console.log(`[API Steam] 强制刷新，忽略缓存，userId: ${userId}`);
  }

  // 3. 调用 Steam Web API (在缓存未命中时执行)
  try {
    const tracker = new SteamGameTracker(apiKey); // Instantiate with the provided API key
    // We will fetch recently played games as the frontend component seems to display a list

    // 2.1 获取最近游玩游戏
    const recentGamesResponse = await tracker.getRecentlyPlayedGames(userId);

    // 2.2 获取拥有游戏（并处理为总游玩时长前5）
    const ownedGamesResponse = await tracker.getOwnedGames(userId);

    // Combine the results
    const combinedData = {
        recentGames: recentGamesResponse.games || [], // Return just the games array
        topOwnedGames: ownedGamesResponse.games || [] // Return just the top 5 games array
    };

    // 4. 更新缓存
    steamCache[cacheKey] = { data: combinedData, timestamp: now };
    console.log(`[API Steam] Cache updated for userId: ${userId}`);

    // 5. 返回数据给前台
     // Frontend expects { success: boolean, data: { recentGames: [...], topOwnedGames: [...] } }
    return NextResponse.json({ success: true, data: combinedData });

  } catch (error: any) { // Explicitly type error as any
    console.error("[API Steam] Error fetching data:", error);
    // Return a 500 status with an error message
    return NextResponse.json({ success: false, message: `获取Steam数据失败: ${error.message}` }, { status: 500 });
  }
} 