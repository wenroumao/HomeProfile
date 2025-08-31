"use client"

import type React from "react"
import { useState, useEffect } from "react"
// 从 react-i18next 导入 I18nextProvider
import { I18nextProvider } from "react-i18next" 
// 导入在 i18n/index.ts 中配置并导出的 i18n 实例
import i18nInstance from "@/i18n" 

export function I18nProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // 确保在客户端渲染
    setIsClient(true);
  }, []);

  // 在服务端渲染时，仅渲染子组件而不包裹 I18nextProvider
  // 这样可以防止错误，但会导致初始渲染没有国际化支持
  if (!isClient) {
    return <>{children}</>;
  }

  // 使用 react-i18next 的 I18nextProvider 并传入 i18n 实例
  return <I18nextProvider i18n={i18nInstance}>{children}</I18nextProvider>
}
