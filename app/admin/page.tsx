"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FiUser, FiLink2, FiSettings, FiLayers, FiFolder, FiFileText } from "react-icons/fi";
import { useTranslation } from "react-i18next";

const navs = [
  { href: "/admin/profile", icon: <FiUser className="w-5 h-5" />, label: "个人资料管理", desc: "编辑你的公开信息" },
  { href: "/admin/social-links", icon: <FiLink2 className="w-5 h-5" />, label: "社交链接管理", desc: "管理你的社交账号" },
  { href: "/admin/skills", icon: <FiLayers className="w-5 h-5" />, label: "技能管理", desc: "维护技能标签" },
  { href: "/admin/projects", icon: <FiFolder className="w-5 h-5" />, label: "项目管理", desc: "管理你的项目集" },
  { href: "/admin/contents", icon: <FiFileText className="w-5 h-5" />, label: "内容管理", desc: "博客/作品内容管理" },
];

export default function AdminDashboard() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8 text-center">
      <h1 className="text-4xl font-bold mb-4">{t('adminDashboard.welcome')}</h1>
      <p className="text-lg text-muted-foreground mb-8">
        {t('adminDashboard.welcomeDescription')}
      </p>
      <p className="text-sm text-muted-foreground">
        {t('adminDashboard.welcomeInstruction')}
      </p>
    </div>
  );
}
