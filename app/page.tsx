"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { SocialIcons } from "@/components/social-icons"
import { ProjectsSection } from "@/components/projects-section"
import { SkillsSection } from "@/components/skills-section"
import { GitHubCalendar } from "@/components/github-calendar"
import { MBTICard } from "@/components/mbti-card"
import { SteamStats } from "@/components/steam-stats"
import { NeteaseMusicStats } from "@/components/netease-music-stats"
import { RSSSubscription } from "@/components/rss-subscription"
import { PageHeaderControls } from "@/components/page-header-controls"
import { BackgroundVideo } from "@/components/background-video"

interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

interface HomePageProfileData {
  avatarUrl?: string;
  introduction?: string;
  signatureSvgUrl1?: string;
  signatureSvgUrl2?: string;
  socialLinks?: SocialLink[];
  // social_links are handled by SocialIcons component directly via API
}

const defaultIntro = '欢迎来到我的个人主页';
const defaultScrollText = '向下滚动';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [profileData, setProfileData] = useState<HomePageProfileData>({});
  const [profileLoading, setProfileLoading] = useState(true);
  
  // 安全使用钩子
  let t: any = (key: string) => {
    // 默认翻译函数，返回对应的默认值
    if (key === 'introduction') return defaultIntro;
    if (key === 'scrollDown') return defaultScrollText;
    return key; // 默认返回键名
  };
  
  // 尝试获取真正的翻译函数
  try {
    const translation = useTranslation();
    if (translation && translation.t) {
      t = translation.t;
    }
  } catch (error) {
    console.error("i18n 初始化错误:", error);
  }
  
  const mainRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    setMounted(true);
    
    const fetchProfileForPage = async () => {
      setProfileLoading(true);
      try {
        const response = await fetch('/api/profile-public');
        if (!response.ok) {
          throw new Error('Failed to fetch profile data for homepage');
        }
        const dataFromApi = await response.json();
        
        setProfileData({ 
          avatarUrl: dataFromApi.avatar_url,
          introduction: dataFromApi.introduction || defaultIntro, 
          signatureSvgUrl1: dataFromApi.signature_svg_url1,
          signatureSvgUrl2: dataFromApi.signature_svg_url2,
          socialLinks: dataFromApi.social_links || []
        });
      } catch (error) {
        console.error("Error fetching profile for homepage:", error);
        setProfileData({
          avatarUrl: '/placeholder-user.jpg', 
          introduction: defaultIntro, 
          signatureSvgUrl1: "https://readme-typing-svg.demolab.com?font=Poppins&size=25&lines=Default+Title+SVG&width=435&height=45&center=true&vCenter=true",
          signatureSvgUrl2: "https://readme-typing-svg.demolab.com?font=Concert+One&size=25&lines=Default+Subtitle+SVG&width=435&height=80&center=true&vCenter=true",
          socialLinks: []
        });
      } finally {
        setProfileLoading(false);
      }
    };
    
    fetchProfileForPage();
  }, []);

  if (!mounted || profileLoading) {
    return <div className="h-screen w-full flex items-center justify-center"><p>加载中...</p></div>;
  }

  // 资源处理
  const titleSvgSrc = profileData.signatureSvgUrl1 || "https://readme-typing-svg.demolab.com?font=Poppins&size=25&lines=Loading+Title...&width=435&height=45&center=true&vCenter=true";
  const subtitleSvgSrc = profileData.signatureSvgUrl2 || "https://readme-typing-svg.demolab.com?font=Concert+One&size=25&lines=Loading+Subtitle...&width=435&height=80&center=true&vCenter=true";

  return (
    <>
      <PageHeaderControls />
      {/* <SiteHeader /> Assuming SiteHeader is part of a layout component or not used here directly */}
      <main 
        ref={mainRef}
        className="w-full relative"
      >
        {/* Global Background Video - Placed directly under main */}
        <BackgroundVideo 
          dayVideoSrc="/videos/三花.mp4" 
          nightVideoSrc="/videos/伊蕾娜.mp4" 
          isActive={true}
        />

        {/* First Screen - Hero - Will no longer be strictly a full screen */}
        <section 
          id="hero-section"
          className="w-full min-h-screen relative flex flex-col items-center justify-center py-20 md:py-32 z-10"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="z-10 text-center px-4 flex flex-col items-center"
          >
            <div className="mb-6">
              <motion.img
                src={profileData.avatarUrl || '/images/avatar.png'}
                alt="Avatar"
                className="w-24 h-24 rounded-full border-2 border-white/50 object-cover"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
              />
            </div>
            {/* 简介大字呈现 */}
            {profileData.introduction && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }} // 调整延迟，使其在头像和签名之间出现
                className="mt-4 mb-6 text-xl md:text-2xl font-semibold text-foreground text-center whitespace-nowrap overflow-hidden text-ellipsis"
              >
                {profileData.introduction}
              </motion.div>
            )}
            <a href="https://git.io/typing-svg" target="_blank" rel="noopener noreferrer" className="mb-4 block">
              <motion.img 
                src={titleSvgSrc} 
                alt="Typing SVG - Hero Title"
                width={435}
                height={45}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              />
            </a>
            <a href="https://git.io/typing-svg" target="_blank" rel="noopener noreferrer" className="block">
              <motion.img 
                src={subtitleSvgSrc} 
                alt="Typing SVG - Hero Subtitle"
                width={435}
                height={80}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
              />
            </a>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.8 }} // 调整延迟
              className="mt-16"
            >
              <SocialIcons />
            </motion.div>
          </motion.div>
        </section>
        {/* Second Screen - RSS, MBTI, Steam, NetEase */}
        <section 
          id="section-2"
          className="w-full min-h-screen py-16 pb-24 relative flex flex-col items-center justify-start overflow-visible z-10"
        >
          <div className="w-full max-w-[1500px] pl-0 pr-0 md:px-4 flex flex-col gap-y-6">
            {/* Main Grid for two columns */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-6 w-full">
              {/* Left Column: Steam and Netease Music */}
              <div className="md:col-span-7 flex flex-col gap-y-6">
                <div className="h-[380px] w-full">
                  <SteamStats />
                </div>
                <div className="h-[450px] w-full">
                  <NeteaseMusicStats />
                </div>
              </div>
              {/* Right Column: MBTI and RSS */}
              <div className="md:col-span-5 flex flex-col gap-y-6">
                <div className="h-[300px]">
                  <MBTICard />
                </div>
                <div className="h-[530px]">
                  <RSSSubscription />
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Third Screen - GitHub & Skills */}
        <section 
          id="section-3"
          className="w-full min-h-screen relative py-16 flex flex-col items-center justify-start text-card-foreground z-10"
        >
          <div className="container px-4">
            <div className="mb-12"><h2 className="text-2xl font-bold mb-8 text-center text-foreground">{t("github.title")}</h2><GitHubCalendar /></div>
            <div className="mt-16"><h2 className="text-2xl font-bold mb-8 text-center text-foreground">{t("skills.title")}</h2><SkillsSection /></div>
          </div>
        </section>
        {/* Fourth Screen - Works Showcase */}
        <section 
          id="section-4"
          className="w-full min-h-screen relative py-16 flex flex-col items-center justify-start z-10"
        >
          <div className="container px-4">
            <div className="text-center mb-12"><h2 className="text-3xl font-bold">{t("works.title")}</h2><p className="text-gray-900 dark:text-white">{t("works.description")}</p></div>
            <ProjectsSection />
          </div>
        </section>
      </main>
    </>
  );
}
