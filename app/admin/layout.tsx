"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import AdminGuard from "@/components/admin-guard";
import { useSession } from "next-auth/react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { PageHeaderControls } from "@/components/page-header-controls";
import { cn } from "@/lib/utils";
import {
  Sidebar, 
  SidebarHeader, 
  SidebarContent, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton, 
  SidebarProvider,
  SidebarToggle
} from "@/components/ui/sidebar";
import {
  FiHome,
  FiMenu,
  FiSettings,
  FiUser,
  FiLayers,
  FiFolder,
  FiFileText,
  FiEdit3,
  FiPackage
} from "react-icons/fi";
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const oldNavsForReference = [
  {
    href: "/admin/profile",
    icon: <FiUser className="w-5 h-5 dark:text-white text-zinc-800" />,
    labelKey: "adminDashboard.navProfile",
  },
  {
    href: "/admin/skills",
    icon: <FiLayers className="w-5 h-5 dark:text-white text-zinc-800" />,
    labelKey: "adminDashboard.navSkills",
  },
  {
    href: "/admin/projects",
    icon: <FiFolder className="w-5 h-5 dark:text-white text-zinc-800" />,
    labelKey: "adminDashboard.navProjects",
  },
  {
    href: "/admin/footer",
    icon: <FiEdit3 className="w-5 h-5 dark:text-white text-zinc-800" />,
    labelKey: "adminDashboard.navFooter",
  },
];

export default function AdminLayout(
  { children }: { children: React.ReactNode },
) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const { data: session, status } = useSession();

  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [isDragging, setIsDragging] = useState(false);
  const minWidth = 200;
  const maxWidth = 400;
  const [isLoadingClient, setIsLoadingClient] = useState(true);

  // Simple throttle function
  const throttle = <T extends (...args: any[]) => void>(func: T, limit: number) => {
    let inThrottle: boolean;
    let lastFunc: ReturnType<typeof setTimeout>;
    let lastRan: number;
    return function(this: any, ...args: Parameters<T>) {
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        lastRan = Date.now();
        inThrottle = true;
        lastFunc = setTimeout(() => {
          inThrottle = false;
        }, limit);
      } else {
        clearTimeout(lastFunc);
        lastFunc = setTimeout(() => {
          if ((Date.now() - lastRan) >= limit) {
            func.apply(context, args);
            lastRan = Date.now();
          }
        }, limit - (Date.now() - lastRan));
      }
    };
  };

  const throttledSetSidebarWidth = useCallback(
    throttle((newWidth: number) => {
      setSidebarWidth(Math.max(minWidth, Math.min(maxWidth, newWidth)));
    }, 50), // Throttle to 50ms
    [minWidth, maxWidth] // Dependencies for useCallback
  );

  useEffect(() => {
    const storedLang = (typeof window !== 'undefined') ? localStorage.getItem('i18nextLng') : null;
    if (storedLang && i18n.language !== storedLang) {
      i18n.changeLanguage(storedLang);
    }
    setIsLoadingClient(false); // Set to false after initial client-side checks
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      throttledSetSidebarWidth(e.clientX);
    };
    const handleMouseUp = () => setIsDragging(false);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, minWidth, maxWidth, throttledSetSidebarWidth]);

  const showSidebarAndHeader = pathname !== "/admin/login" && pathname !== "/admin/auth";

  const navLinks = [
    { href: "/admin/profile", label: t('adminDashboard.navProfile'), IconComponent: FiUser },
    { href: "/admin/skills", label: t('adminDashboard.navSkills'), IconComponent: FiLayers },
    { href: "/admin/projects", label: t('adminDashboard.navProjects'), IconComponent: FiFolder },
    { href: "/admin/footer", label: t('adminDashboard.navFooter'), IconComponent: FiEdit3 },
  ];

  useEffect(() => {
    if (status === 'loading') return;
    if (!session && pathname !== '/admin/auth' && pathname !== '/admin/login') { 
      router.push('/admin/login'); 
    }
  }, [session, status, pathname, router]);

  if (status === "loading" && showSidebarAndHeader) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <AiOutlineLoading3Quarters className="h-8 w-8 animate-spin mr-3" />
        {!isLoadingClient ? t('adminLayout.loadingSession') : 'Loading session...'}
      </div>
    );
  }

  return (
    <AdminGuard>
      <SidebarProvider defaultOpen={!showSidebarAndHeader ? false : undefined}> 
        <div className={cn("flex min-h-screen w-full", showSidebarAndHeader ? "bg-muted/40 dark:bg-muted/70" : "bg-background")}>
          {showSidebarAndHeader && (
            <Sidebar 
              className="fixed inset-y-0 left-0 z-50 h-full border-r bg-background dark:bg-gray-850 lg:block"
              style={{ width: `${sidebarWidth}px` }}
            >
              <SidebarHeader className="flex items-center gap-2 h-16 px-4 border-b font-semibold text-lg">
                <FiPackage className="h-6 w-6 text-primary" /> 
                <span className="leading-6">{t('adminLayout.title', '管理中心')}</span>
              </SidebarHeader>
              <SidebarContent className="overflow-y-auto">
                <SidebarMenu className="py-4 px-2">
                  {navLinks.map((linkItem) => {
                    const isActive = pathname.startsWith(linkItem.href);
                    return (
                      <SidebarMenuItem key={linkItem.href} className="mb-2">
                        <Link href={linkItem.href}>
                          <SidebarMenuButton isActive={isActive} className="w-full justify-start text-base py-2.5">
                            <linkItem.IconComponent className={cn("h-5 w-5 mr-3", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                            {linkItem.label}
                          </SidebarMenuButton>
                        </Link>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarContent>
              <div
                className={cn("absolute top-0 bottom-0 right-0 w-2 cursor-ew-resize z-[51]",
                  isDragging ? "bg-primary/20" : "hover:bg-muted"
                )}
                onMouseDown={(e) => {
                  setIsDragging(true);
                  e.preventDefault(); 
                }}
              />
            </Sidebar>
          )}

          <div className={cn("flex flex-col flex-1", showSidebarAndHeader ? `lg:ml-[${sidebarWidth}px]` : "")}>
            {showSidebarAndHeader && (
              <header className={cn("sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6 dark:bg-gray-850")}>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="lg:hidden">
                      <FiMenu className="h-6 w-6" />
                      <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="sm:max-w-xs bg-background dark:bg-gray-850 px-0">
                    <SidebarHeader className="flex items-center gap-2 h-16 px-4 border-b font-semibold text-lg">
                      <FiPackage className="h-6 w-6 text-primary" /> 
                      <span className="leading-6">{t('adminLayout.title', '管理中心')}</span>
                    </SidebarHeader>
                    <SidebarContent className="overflow-y-auto">
                      <SidebarMenu className="py-4 px-2">
                        {navLinks.map((linkItem) => {
                          const isActive = pathname.startsWith(linkItem.href);
                          return (
                            <SidebarMenuItem key={linkItem.href + "-mobile"} className="mb-2">
                              <Link href={linkItem.href}>
                                <SidebarMenuButton isActive={isActive} className="w-full justify-start text-base py-2.5">
                                  <linkItem.IconComponent className={cn("h-5 w-5 mr-3", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                                  {linkItem.label}
                                </SidebarMenuButton>
                              </Link>
                            </SidebarMenuItem>
                          );
                        })}
                      </SidebarMenu>
                    </SidebarContent>
                  </SheetContent>
                </Sheet>
                <div className="flex-1" />
                <PageHeaderControls />
              </header>
            )}
            <main className={cn("flex-1 p-4 sm:p-6 overflow-auto", !showSidebarAndHeader && "h-screen")}>
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AdminGuard>
  );
}
