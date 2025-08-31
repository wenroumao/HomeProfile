'use client'; // 1. 添加 'use client'

import type React from "react";
import "./globals.css";
import Script from 'next/script';
import { usePathname } from 'next/navigation'; // 2. 更改导入
import { useEffect } from 'react'; // <-- 导入 useEffect
// import type { Metadata } from "next"; // Metadata 通常在服务器组件中使用，客户端组件需要不同处理方式
import { ThemeProvider } from "@/components/theme-provider";
import { I18nProvider } from "@/components/i18n-provider";
import { AuthProvider } from "@/components/auth-provider";
import { Toaster } from "@/components/ui/sonner";
import { Footer } from "@/components/footer";
import { ConsoleBadge } from "@/components/console-badge";

// 'export const metadata: Metadata = { ... }' // 这部分在 'use client' 组件中不能这样导出

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname(); // 3. 使用 usePathname
  const isAdminPage = pathname ? pathname.startsWith('/admin') : false; // 确保 pathname 存在

  useEffect(() => {
    if (isAdminPage) {
      const sakuraCanvas = document.getElementById('canvas_sakura');
      if (sakuraCanvas && sakuraCanvas.parentElement) {
        sakuraCanvas.parentElement.removeChild(sakuraCanvas);
      }
    }
  }, [isAdminPage]); // 当 isAdminPage 改变时触发

  return (
    <html lang="zh" suppressHydrationWarning>
      <head>
        {/* 对于 'use client' layout，在此处直接管理 title 和 meta 标签 */}
        <title>ZeroHome</title>
        <meta name="description" content="轻量、现代、更加配置化的一站式模版主页" />
        <link rel="icon" href="/images/logo.png" type="image/png" />
      </head>
      <body className="custom-font flex flex-col min-h-screen">
        <ConsoleBadge />
        <AuthProvider>
          <I18nProvider>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
              <div className="flex-grow">
                {children}
                {!isAdminPage && (<Script src="https://api.vvhan.com/api/script/yinghua" strategy="lazyOnload" />)}
              </div>
              <Toaster
                position="top-center"
                richColors
                closeButton
                expand={true}
                visibleToasts={5}
                toastOptions={{
                  style: {
                    marginBottom: '10px',
                  }
                }}
              />
              <Footer />
            </ThemeProvider>
          </I18nProvider>
        </AuthProvider>
      </body>
    </html>
  );
}