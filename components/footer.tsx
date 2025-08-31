"use client"

import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"
import { useEffect, useState } from "react"

// 定义 settings.json 中 footer.items 内对象的类型 (可选但推荐)
interface FooterItemBase {
  type: string;
}
interface BeianItem extends FooterItemBase {
  type: "beian";
  icpBeian?: string;
  mengIcpBeian?: string;
  icpBeianUrl?: string;
  mengIcpBeianUrl?: string;
}
interface CopyrightItem extends FooterItemBase {
  type: "copyright";
  authorName: string;
  startYear: number;
}
interface CustomTextItem extends FooterItemBase {
  type: "customText";
  text: string;
}
interface Link {
  text: string;
  url: string;
  title?: string;
}
interface CustomLinksItem extends FooterItemBase {
  type: "customLinks";
  links: Link[];
}

type FooterItem = BeianItem | CopyrightItem | CustomTextItem | CustomLinksItem;

// 新增: 定义 API 响应的类型
interface FooterSettings {
  items: FooterItem[];
}

export function Footer() {
  const { t, i18n, ready } = useTranslation();
  const currentYear = new Date().getFullYear();

  // 新增: State for footer items, loading, and error
  const [footerItems, setFooterItems] = useState<FooterItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 新增: useEffect to fetch footer data
  useEffect(() => {
    const fetchFooterSettings = async () => {
      try {
        // console.log("[Footer Component] Fetching footer settings..."); // Logs can be kept or removed
        const response = await fetch('/api/footer');
        // console.log("[Footer Component] API Response Status:", response.status);
        if (!response.ok) {
          let errorText = `Failed to fetch footer settings: ${response.statusText}`;
          try {
            const errorData = await response.json();
            errorText = errorData.message || errorText;
            // console.error("[Footer Component] API Error Data:", errorData);
          } catch (e) { /* ignore */ }
          throw new Error(errorText);
        }
        const data: FooterSettings = await response.json();
        setFooterItems(data.items || []);
      } catch (err: any) {
        setError(err.message || "An unknown error occurred");
        setFooterItems([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFooterSettings();
  }, []);

  if (!ready) {
    return <div>Loading...</div>;
  }

  const renderFooterItem = (item: FooterItem, index: number) => {
    switch (item.type) {
      case "beian":
        const beian = item as BeianItem;
        const icpDisplay = beian.icpBeian && beian.icpBeian.trim() !== "";
        const mengIcpDisplay = beian.mengIcpBeian && beian.mengIcpBeian.trim() !== "";
        if (!icpDisplay && !mengIcpDisplay) return null;
        return (
          <div key={index} className="text-xs mt-1 px-4 flex items-center justify-center flex-wrap sm:flex-nowrap">
            {icpDisplay && (
              <a 
                href={beian.icpBeianUrl || 'https://beian.miit.gov.cn/'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors whitespace-nowrap mx-1 inline-flex items-center"
              >
                <span dangerouslySetInnerHTML={{ __html: beian.icpBeian || '' }} />
              </a>
            )}
            {icpDisplay && mengIcpDisplay && <span className="mx-2 shrink-0">|</span>}
            {mengIcpDisplay && (
              <a 
                href={beian.mengIcpBeianUrl || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors whitespace-nowrap mx-1 inline-flex items-center"
              >
                <span dangerouslySetInnerHTML={{ __html: beian.mengIcpBeian || '' }} />
              </a>
            )}
          </div>
        );

      case "customText":
        const customTextItem = item as CustomTextItem;
        return (
          <div 
            key={index} 
            className="mt-1 px-4 w-full text-center" 
            dangerouslySetInnerHTML={{ __html: customTextItem.text }} 
          />
        );

      case "customLinks":
        const customLinks = item as CustomLinksItem;
        if (!customLinks.links || customLinks.links.length === 0) return null;
        return (
          <div key={index} className="mt-1 flex items-center justify-center gap-x-3 sm:gap-x-4 gap-y-1 flex-wrap px-4">
            {customLinks.links.map((link, linkIndex) => (
              <a 
                key={linkIndex} 
                href={link.url} 
                className="hover:text-primary transition-colors text-xs sm:text-sm whitespace-nowrap"
                target="_blank"
                rel="noopener noreferrer"
                title={link.title || link.text}
              >
                {link.text}
              </a>
            ))}
          </div>
        );
      default:
        // console.warn("[Footer Component] Unknown footer item type:", (item as any).type);
        return null;
    }
  };

  if (isLoading) {
    return (
      <motion.footer className="w-full py-6 mt-auto text-center text-sm text-gray-600 dark:text-gray-400">
        Loading...
      </motion.footer>
    );
  }

  if (error) {
    // console.log("[Footer Component] Rendering: Error State");
    return (
      <motion.footer className="w-full py-6 mt-auto text-center text-sm text-red-600 dark:text-red-400">
        {t('footer.error', 'Error loading footer')}: {error}
      </motion.footer>
    );
  }
  
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="w-full py-6 mt-auto text-center text-sm text-black dark:text-gray-300 flex flex-col items-center"
    >
      {footerItems.map((item, index) => renderFooterItem(item, index))}
      
      {/* MODIFIED Hardcoded Copyright Section */}
      <div className="mt-1 px-4">
        Copyright © 2025 @ 
        <a 
          href="https://viper3.top" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-primary hover:underline mx-1"
        >
          Viper373
        </a>
      </div>
    </motion.footer>
  );
}
