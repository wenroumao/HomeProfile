"use client";
import type React from "react";
import { memo, Suspense, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getSocialIconComponent } from "@/lib/getSocialIcon";

interface SocialLinkData {
    name: string;
    url: string;
    icon: string;
}

interface ProfileApiResponse {
    social_links?: SocialLinkData[];
}

export const SocialIcons = memo(function SocialIcons() {
    const { t } = useTranslation();
    const [links, setLinks] = useState<SocialLinkData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSocialLinks = async () => {
            setLoading(true);
            try {
                const response = await fetch("/api/profile-public");
                if (!response.ok) {
                    throw new Error("Failed to fetch social links");
                }
                const data: ProfileApiResponse = await response.json();
                setLinks(data.social_links || []);
            } catch (error) {
                console.error("Error fetching social links:", error);
                setLinks([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSocialLinks();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center gap-3">
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className="w-10 h-10 rounded-full bg-white/20 animate-pulse"
                    />
                ))}
            </div>
        );
    }

    if (!links || links.length === 0) {
        return null;
    }

    return (
        <TooltipProvider delayDuration={100}>
            <div className="flex justify-center gap-3">
                {links.map((social, index) => {
                    return (
                        <Tooltip key={index}>
                            <TooltipTrigger asChild>
                            <motion.a
                                    layout
                                    href={social.url}
                                    className="w-10 h-10 rounded-full bg-secondary backdrop-blur-sm flex items-center justify-center hover:bg-accent transition-colors duration-200 ease-out"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={social.name}
                                    style={{
                                        opacity: 1,
                                    }}
                                    initial={{ scale: 1, rotate: 0 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    whileHover={{
                                        scale:    [1,   0.7,  1.2, 1], 
                                        rotate:   [0,   0,    10,  0],
                                        transition: { // 这个 transition 只作用于 whileHover 动画的内部阶段
                                            duration: 0.6, 
                                            ease: "easeInOut",
                                            times:    [0,   0.6,  0.8, 1] 
                                        }
                                    }}
                                    transition={{ // 这个 transition 作用于从 whileHover 恢复到 animate 状态
                                        duration: 0.3, // 恢复动画可以快一些
                                        ease: "easeOut"
                                    }}
                                >
                                    <Suspense
                                        fallback={
                                            <AiOutlineLoading3Quarters
                                                size={20}
                                                className="animate-spin text-muted-foreground"
                                            />
                                        }
                                    >
                                        {getSocialIconComponent(
                                            social.icon,
                                            20,
                                            "text-foreground",
                                        )}
                                    </Suspense>
                                </motion.a>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{social.name}</p>
                            </TooltipContent>
                        </Tooltip>
                    );
                })}
            </div>
        </TooltipProvider>
    );
});