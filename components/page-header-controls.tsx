"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useTheme } from "next-themes";
import {
  FiMoon, 
  FiSun,
  FiUser,
  FiHome,
  FiSettings,
  FiLogOut,
  FiLogIn
} from 'react-icons/fi';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import { useSession, signIn, signOut } from "next-auth/react";
import { Session } from "next-auth";

// 扩展Session类型以包含自定义字段
interface CustomUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  avatar_url?: string | null;
  user_name?: string | null;
}

interface CustomSession extends Session {
  user?: CustomUser;
}

export function PageHeaderControls() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { data: session, status } = useSession() as { data: CustomSession | null, status: string };
  const mounted = typeof window !== 'undefined';
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const controlsContainerRef = React.useRef<HTMLDivElement>(null);

  const isLoggedIn = !!session?.user;
  // 检查是否在管理后台
  const isAdminPage = pathname?.startsWith('/admin');
  // 检查是否在登录页面
  const isLoginPage = pathname === '/admin/login';
  
  // 获取用户头像URL
  const avatarUrl = session?.user?.image || session?.user?.avatar_url;
  const userName = session?.user?.name || session?.user?.user_name || '用户';
  
  // 在开发环境打印调试信息
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && isLoggedIn) {
    }
  }, [session, isLoggedIn, avatarUrl, userName, pathname]);

  useEffect(() => {
    const bodyPaddingRight = document.body.style.paddingRight;
    if (controlsContainerRef.current) {
      if (isMenuOpen && bodyPaddingRight) {
        // When menu is open and body has paddingRight (likely due to scrollbar compensation)
        // Adjust the right position of the controls container
        const baseRightRem = isAdminPage ? 0.75 : 1; // top-3/right-3 or top-4/right-4 (0.75rem or 1rem)
        controlsContainerRef.current.style.right = `calc(${baseRightRem}rem + ${bodyPaddingRight})`;
      } else {
        // Reset to original position when menu is closed or body padding is removed
        const baseRightRem = isAdminPage ? 0.75 : 1;
        controlsContainerRef.current.style.right = `${baseRightRem}rem`;
      }
    }
    // We also need to listen for direct changes to document.body.style.paddingRight
    // This can be done with a MutationObserver for robustness, but it adds complexity.
    // For now, we rely on isMenuOpen changing.
  }, [isMenuOpen, isAdminPage]); // Rerun when menu state or admin page context changes

  // 如果在登录页面，不显示控件
  if (isLoginPage) return null;
  
  // 如果session正在加载中，不显示任何内容
  if (status === "loading") return null;

  const renderThemeToggleButton = () => {
    if (!mounted) return null;
    
    const currentTheme = resolvedTheme || theme;
    return (
      <Button 
        variant="ghost" 
        size="icon" 
        className="w-7 h-7"
        onClick={() => setTheme(currentTheme === 'light' ? 'dark' : 'light')}
        aria-label={currentTheme === 'light' ? t('theme.switchToDark', '切换到暗色主题') : t('theme.switchToLight', '切换到亮色主题')}
      >
        {currentTheme === 'light' ? <FiMoon className="h-4 w-4" /> : <FiSun className="h-4 w-4" />}
      </Button>
    );
  };

  return (
    <div 
      ref={controlsContainerRef}
      className={`fixed ${isAdminPage ? 'top-3 right-3' : 'top-4 right-4'} flex items-center z-[1000]`}
    >
      <LanguageSwitcher />
      
      <div className="ml-2 mr-4">
        {renderThemeToggleButton()}
      </div>

      {isLoggedIn ? (
        <DropdownMenu onOpenChange={setIsMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative w-7 h-7 rounded-full overflow-hidden focus:ring-0 focus:ring-offset-0 outline-none focus:outline-none focus-visible:outline-none active:outline-none border-transparent focus:border-transparent active:border-transparent"
              aria-label={t('ariaLabels.userMenu', '用户菜单')}
              style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
            >
              <div className="w-full h-full flex items-center justify-center">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt={userName}
                    className="h-full w-full rounded-full object-cover" 
                    onLoad={() => setAvatarLoaded(true)}
                    onError={(e) => {
                      console.error("头像加载失败:", avatarUrl);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : null}
                {!avatarUrl || !avatarLoaded ? (
                  <FiUser className="h-4 w-4" />
                ) : null}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount sideOffset={5}>
            {userName && (
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                </div>
              </DropdownMenuLabel>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {isAdminPage ? (
                // 当在管理后台时，显示前台入口
                <Link href="/" passHref>
                  <DropdownMenuItem>
                    <FiHome className="mr-2 h-4 w-4" />
                    <span>{t('userNav.frontPage', '返回前台')}</span>
                  </DropdownMenuItem>
                </Link>
              ) : (
                // 当在前台时，显示管理后台入口
                <Link href="/admin" passHref>
                  <DropdownMenuItem>
                    <FiSettings className="mr-2 h-4 w-4" />
                    <span>{t('userNav.adminPanel', '管理面板')}</span>
                  </DropdownMenuItem>
                </Link>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/admin/login' })}>
              <FiLogOut className="mr-2 h-4 w-4" />
              <span>{t('userNav.logout', '退出登录')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="w-7 h-7" aria-label={t('ariaLabels.loginOptions', '登录选项')}>
              <FiUser className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48" align="end">
            <DropdownMenuItem onSelect={() => signIn()}>
              <FiLogIn className="mr-2 h-4 w-4" />
              <span>{t('userNav.login', '登录')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
} 