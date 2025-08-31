"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { FiRss, FiExternalLink, FiFileText, FiAlertCircle, FiCalendar } from "react-icons/fi";

interface Post {
  title: string;
  url: string;
  date?: string;
  summary?: string;
}

export function RSSSubscription() {
  const [copied, setCopied] = useState(false)
  const [rssUrl, setRssUrl] = useState<string | null>(null);
  const [foloUrl, setFoloUrl] = useState<string | null>(null);
  const [rssLoading, setRssLoading] = useState(true);
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);

  const { t } = useTranslation()

  useEffect(() => {
    const fetchRssUrl = async () => {
      try {
        setRssLoading(true);
        const res = await fetch('/api/profile-public');
        if (!res.ok) throw new Error('Failed to fetch profile data for RSS URL');
        const data = await res.json();
        setRssUrl(data.rss_url || 'https://example.com/feed.xml');
        setFoloUrl(data.folo_url || null);
      } catch (e: any) {
        console.error("Error fetching rss_url or folo_url:", e);
        setRssUrl('https://example.com/feed.xml');
        setFoloUrl(null);
      } finally {
        setRssLoading(false);
      }
    };

    const fetchLatestPosts = async () => {
      try {
        setPostsLoading(true);
        setPostsError(null);
        const res = await fetch('/api/latest-posts');
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: 'Failed to fetch latest posts' }));
          throw new Error(errorData.message || 'Failed to fetch latest posts');
        }
        const data = await res.json();
        setLatestPosts(data);
      } catch (e: any) {
        console.error("Error fetching latest posts:", e);
        setPostsError(e.message || 'Could not load posts.');
      } finally {
        setPostsLoading(false);
      }
    };

    fetchRssUrl();
    fetchLatestPosts();
  }, []);

  const handleCopy = () => {
    if (rssUrl) {
      navigator.clipboard.writeText(rssUrl)
        .then(() => {
          setCopied(true)
          toast.success(t("rss.copiedToClipboard"))
          setTimeout(() => setCopied(false), 2000)
        })
        .catch(err => {
          toast.error(t("rss.copyFailed"))
          console.error("Failed to copy: ", err)
        })
    }
  }

  const handleFollow = () => {
    if (foloUrl) {
      window.open(foloUrl, "_blank")
    } else if (rssUrl) {
      window.open(rssUrl, "_blank")
    }
  }

  if (rssLoading) {
    return (
      <Card className="bg-white/[.30] dark:bg-black/[.30] border border-white/10 shadow-xl rounded-2xl flex flex-col justify-center items-center p-4 transition-all hover:shadow-2xl hover:scale-[1.01] w-full h-full">
        <Skeleton className="h-8 w-1/2 mb-4" />
        <Skeleton className="h-6 w-3/4 mb-6" />
        <Skeleton className="h-10 w-full mb-6" />
        <div className="flex gap-3 justify-center mb-6">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-10 w-1/2" />
        </div>
        <Skeleton className="h-6 w-1/3 mb-3" />
        <div className="space-y-4 mt-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2 mt-1" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white/[.60] dark:bg-black/[.30] border border-white/10 shadow-xl rounded-2xl flex flex-col justify-start transition-all hover:shadow-2xl hover:scale-[1.01] w-full h-full p-6 overflow-hidden">
      <div className="flex-shrink-0">
        <div className="text-center mb-4">
          <h2 className="text-xl font-semibold mb-2">{t('rss.subscribeTitle')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('rss.subscribeDescription')}
          </p>
        </div>
        
        <div className="relative flex items-center mb-6">
          <FiRss className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            value={rssUrl || ''}
            readOnly
            className="pl-10 pr-2 py-2 h-10 w-full bg-background/50 border rounded-md focus-visible:ring-0 focus-visible:ring-offset-0" 
          />
        </div>
        
        <div className="flex gap-3 justify-center mb-6">
          <Button
            onClick={handleCopy}
            size="sm"
            className="flex items-center gap-1"
          >
            {copied ? t('rss.copiedButton') : t('rss.copyButtonText')}
          </Button>
          <Button
            size="sm"
            className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white"
            onClick={handleFollow}
          >
            <FiExternalLink className="mr-2 h-4 w-4" />
            {"folo"}
          </Button>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto border-t border-white/10">
        <h3 className="text-lg font-semibold mb-3 flex items-center pt-2">
          <FiFileText className="mr-2 h-5 w-5 text-primary" />
          {t('rss.latestPosts')}
        </h3>
        {postsLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2 mt-1" />
              </div>
            ))}
          </div>
        ) : postsError ? (
          <div className="text-destructive flex items-center">
            <FiAlertCircle className="mr-2 h-5 w-5" />
            {postsError}
          </div>
        ) : latestPosts.length > 0 ? (
          <ul className="space-y-3">
            {latestPosts.map((post, index) => (
              <li key={index} className="border-b border-white/5 pb-3 last:border-b-0 last:pb-0">
                <a 
                  href={post.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors block truncate mb-1"
                  title={post.title}
                >
                  {post.title}
                </a>
                {post.summary && (
                  <p 
                    className="text-xs text-muted-foreground mb-1" 
                    style={{ textShadow: '0px 0px 5px rgba(0,0,0,0.7)' }}
                  >
                    {post.summary}
                  </p>
                )}
                {post.date && (
                  <p 
                    className="text-xs text-muted-foreground flex items-center" 
                    style={{ textShadow: '0px 0px 5px rgba(0,0,0,0.7)' }}
                  >
                    <FiCalendar className="mr-1 h-3 w-3" />
                    {new Date(post.date).toLocaleDateString()}
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">{t("rss.noPosts", "暂无最新文章")}</p>
        )}
      </div>
    </Card>
  )
}
