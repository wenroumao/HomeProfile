"use client"

import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useEffect, useState } from "react"
import { RiTranslate2 } from 'react-icons/ri';

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation()
  const [mounted, setMounted] = useState(false)

  // Use effect to initialize component and handle language setup
  useEffect(() => {
    setMounted(true)
    // Check stored language on mount
    const storedLang = localStorage.getItem('i18nextLng')
    if (storedLang) {
      // Normalize language code (zh-CN, zh-TW -> zh)
      const normalizedLang = storedLang.includes('zh') ? 'zh' : 'en'
      if (normalizedLang !== i18n.language) {
        i18n.changeLanguage(normalizedLang)
      }
    }
  }, [i18n])

  // Enhanced language change function with forced reload
  const changeLanguage = (lng: string) => {
    if (i18n.language !== lng) {
      // Set the language in i18next
      i18n.changeLanguage(lng)
      // Explicitly save to localStorage
      localStorage.setItem('i18nextLng', lng)
      // Force reload to ensure all components update - REMOVED
      // window.location.reload()
    }
  }

  // Get current language, fallback to 'en'
  const currentLanguage = i18n.language || (typeof window !== "undefined" ? window.localStorage.getItem('i18nextLng') || 'en' : 'en');

  if (!mounted) {
    // Placeholder to avoid hydration mismatch
    return <Button variant="ghost" size="icon" className="w-9 h-9"><RiTranslate2 className="h-5 w-5" /></Button>; 
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="w-9 h-9">
          <RiTranslate2 className="h-5 w-5" />
          <span className="sr-only">切换语言</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => changeLanguage("zh")}
          disabled={currentLanguage === "zh" || currentLanguage.startsWith("zh-")}
        >
          中文
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => changeLanguage("en")}
          disabled={currentLanguage === "en" || currentLanguage.startsWith("en-")}
        >
          English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
