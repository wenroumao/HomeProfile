import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import Parser, { Item as RssParserItem } from 'rss-parser';

interface Post {
  title: string;
  url: string;
  date?: string;
  summary?: string;
}

interface Settings {
  profile?: {
    rss_url?: string;
  };
}

// Helper function to strip HTML and truncate text
function createSummary(htmlContent: string | undefined, maxLength: number = 100): string | undefined {
  if (!htmlContent) return undefined;
  // Strip HTML tags
  const textContent = htmlContent.replace(/<[^>]+>/g, '.');
  // Truncate and add ellipsis
  if (textContent.length > maxLength) {
    return textContent.substring(0, maxLength) + '...';
  }
  return textContent;
}

export async function GET() {
  try {
    // 1. Read settings.json to get rss_url
    const settingsFilePath = path.join(process.cwd(), 'settings.json');
    const settingsJsonData = fs.readFileSync(settingsFilePath, 'utf-8');
    const settings: Settings = JSON.parse(settingsJsonData);
    const rssUrl = settings.profile?.rss_url;

    if (!rssUrl) {
      throw new Error('RSS URL not found in settings.json');
    }

    // 2. Fetch and parse RSS feed
    const parser = new Parser();
    const feed = await parser.parseURL(rssUrl);

    if (!feed.items) {
      return NextResponse.json([]);
    }

    // 3. Map feed items to Post interface and sort
    const posts: Post[] = feed.items.map((item: RssParserItem & { contentSnippet?: string, content?: string }): Post => ({
      title: item.title || 'Untitled Post',
      url: item.link || '#',
      date: item.isoDate || item.pubDate,
      summary: createSummary(item.contentSnippet || item.content, 100) // Get summary from contentSnippet or content
    })).sort((a: Post, b: Post) => {
      if (a.date && b.date) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return 0;
    });

    return NextResponse.json(posts.slice(0, 3)); // Return latest 3 posts
  } catch (error: any) {
    console.error('Error fetching or parsing RSS feed:', error);
    return NextResponse.json({ message: error.message || 'Error fetching latest posts from RSS feed' }, { status: 500 });
  }
} 