"use client";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import React, { useEffect } from "react";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user && pathname !== "/admin/login") {
      router.replace("/admin/login");
    }
  }, [session, status, pathname, router]);

  if (status === "loading" || (!session?.user && pathname !== "/admin/login")) return null;

  return <>{children}</>;
} 