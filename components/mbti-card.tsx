"use client"

import { useState, useEffect, memo } from "react"
import { useTranslation } from "react-i18next"

interface MBTIProfile {
  mbti_type?: string;
  mbti_image_url?: string;
  mbti_traits?: string[];
  mbti_title?: string;
}

export const MBTICard = memo(function MBTICard() {
  const { t } = useTranslation()
  const [mbti, setMbti] = useState<MBTIProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMbti = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/profile-public')
        if (!res.ok) throw new Error('MBTI fetch failed')
        const data = await res.json()
        setMbti({
          mbti_type: data.mbti_type || '',
          mbti_image_url: data.mbti_image_url || '',
          mbti_traits: Array.isArray(data.mbti_traits) ? data.mbti_traits : [],
          mbti_title: data.mbti_title || '',
        })
      } catch (e) {
        setMbti(null)
      } finally {
        setLoading(false)
      }
    }
    fetchMbti()
  }, [])

  if (loading) {
    return (
      <div className="bg-card text-card-foreground p-6 rounded-lg shadow-lg w-full flex items-center justify-center min-h-[300px] h-full">
        <div className="h-8 w-3/4 bg-muted animate-pulse rounded mb-4" />
      </div>
    )
  }

  // 降级：无后台配置时用翻译文本
  const mbtiType = mbti?.mbti_type || t('mbti.type')
  const mbtiTitle = mbti?.mbti_title || t('mbti.title')
  const mbtiTraits = mbti?.mbti_traits && mbti.mbti_traits.length > 0
    ? mbti.mbti_traits
    : [t('mbti.trait1'), t('mbti.trait2'), t('mbti.trait3'), t('mbti.trait4')]
  const mbtiImage = mbti?.mbti_image_url || '/images/mbti-avatar.png'
  const learnMoreText = t('mbti.learnMoreLinkText', { personalityType: mbtiTitle })

  return (
    <div className="bg-white/[.60] dark:bg-black/[.30] border border-white/10 shadow-xl rounded-2xl p-6 transition-all hover:shadow-2xl hover:scale-[1.01] w-full h-full relative">
      {/* 16Personalities Logo Top Right */}
      <div className="absolute top-4 right-4">
        <img 
          src="https://www.16personalities.com/static/images/system/logo.svg" 
          alt="16Personalities Logo" 
          className="h-8 opacity-50"
        />
      </div>
      
      {/* 标题区域 */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{mbtiType} {mbtiTitle}</h2>
      </div>
      
      {/* 性格特征区域 */}
      <div className="mb-2">
        <h4 className="text-md font-medium mb-2">{t('mbti.traitsHeaderTitle')}</h4>
        <ul className="space-y-3 list-disc list-inside pl-1">
          {mbtiTraits.map((trait, index) => (
            <li key={index} className="text-sm flex items-start">
              <span className="inline-block h-1 w-1 rounded-full bg-gray-400 mt-2 mr-2"></span>
              <span>{trait}</span>
            </li>
          ))}
        </ul>
      </div>
      
      {/* 右侧图片 - 使用绝对定位 */}
      <div className="absolute bottom-4 right-1">
        <img 
          src={mbtiImage}
          alt={`${mbtiType} Avatar`}
          className="h-40 w-40"
          loading="lazy"
        />
      </div>
      
      {/* 底部链接 */}
      <div className="absolute bottom-6 left-0 w-full text-center">
        <a 
          href="https://www.16personalities.com/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-xs text-muted-foreground hover:text-primary transition-colors"
          style={{ textShadow: '0px 0px 5px rgba(0,0,0,0.7)' }}
        >
          {learnMoreText}
        </a>
      </div>
    </div>
  )
})
