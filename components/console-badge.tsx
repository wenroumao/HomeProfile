"use client";
import { useEffect } from "react";

export function ConsoleBadge() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      console.log(
        "%c ",
        `
        font-size:1px;
        padding:13px 55px;
        background:url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjYiIGhlaWdodD0iMjAiIHJvbGU9ImltZyIgYXJpYS1sYWJlbD0iVmlwZXIzNzM6IFplcm9Ib21lIj48dGl0bGU+VmlwZXIzNzM6IFplcm9Ib21lPC90aXRsZT48bGluZWFyR3JhZGllbnQgaWQ9InMiIHgyPSIwIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjYmJiIiBzdG9wLW9wYWNpdHk9Ii4xIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLW9wYWNpdHk9Ii4xIi8+PC9saW5lYXJHcmFkaWVudD48Y2xpcFBhdGggaWQ9InIiPjxyZWN0IHdpZHRoPSIxMjYiIGhlaWdodD0iMjAiIHJ4PSIzIiBmaWxsPSIjZmZmIi8+PC9jbGlwUGF0aD48ZyBjbGlwLXBhdGg9InVybCgjcikiPjxyZWN0IHdpZHRoPSI1OSIgaGVpZ2h0PSIyMCIgZmlsbD0iYmxhY2siLz48cmVjdCB4PSI1OSIgd2lkdGg9IjY3IiBoZWlnaHQ9IjIwIiBmaWxsPSIjNDBlMGQwIi8+PHJlY3Qgd2lkdGg9IjEyNiIgaGVpZ2h0PSIyMCIgZmlsbD0idXJsKCNzKSIvPjwvZz48ZyBmaWxsPSIjZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iVmVyZGFuYSxHZW5ldmEsRGVqYVZ1IFNhbnMsc2Fucy1zZXJpZiIgdGV4dC1yZW5kZXJpbmc9Imdlb21ldHJpY1ByZWNpc2lvbiIgZm9udC1zaXplPSIxMTAiPjx0ZXh0IGFyaWEtaGlkZGVuPSJ0cnVlIiB4PSIzMDUiIHk9IjE1MCIgZmlsbD0iIzAxMDEwMSIgZmlsbC1vcGFjaXR5PSIuMyIgdHJhbnNmb3JtPSJzY2FsZSguMSkgIiB0ZXh0TGVuZ3RoPSI0OTAiPlZpcGVyMzczPC90ZXh0Pjx0ZXh0IHg9IjMwNSIgeT0iMTQwIiB0cmFuc2Zvcm09InNjYWxlKC4xKSIgZmlsbD0iI2ZmZiIgdGV4dExlbmd0aD0iNDkwIj5WaXBlcjM3MzwvdGV4dD48dGV4dCBhcmlhLWhpZGRlbj0idHJ1ZSIgeD0iOTE1IiB5PSIxNTAiIGZpbGw9IiMwMTAxMDEiIGZpbGwtb3BhY2l0eT0iLjMiIHRyYW5zZm9ybT0ic2NhbGUoLjEpIiB0ZXh0TGVuZ3RoPSI1NzAiPlplcm9Ib21lPC90ZXh0Pjx0ZXh0IHg9IjkxNSIgeT0iMTQwIiB0cmFuc2Zvcm09InNjYWxlKC4xKSIgZmlsbD0iI2ZmZiIgdGV4dExlbmd0aD0iNTcwIj5aZXJvSG9tZTwvdGV4dD48L2c+PC9zdmc+') no-repeat center;
        background-size:contain;
        border-radius:8px;
        `
      );
    }
  }, []);
  return null;
} 