"use client"

import { useState, useEffect, memo, useRef } from "react"
import { useTranslation } from "react-i18next"

interface SkillFromSettings {
  category: string; // Field name from settings.json
  skills: {
    name: string;
    level: number;
  }[];
}

interface SkillGroup { // Component's expected structure
  title: string; 
  skills: {
    name: string;
    level: number;
  }[];
}

// 使用memo优化组件，避免不必要的重新渲染
export const SkillsSection = memo(function SkillsSection() {
  const { t } = useTranslation()
  const [skillGroups, setSkillGroups] = useState<SkillGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // 分类英文映射函数
  function getDisplayCategoryName(category: string) {
    switch (category) {
      case '前端': return 'Frontend';
      case '后端': return 'Backend';
      case '数据库': return 'Database';
      case '其他': return 'Other';
      default: return category;
    }
  }

  useEffect(() => {
    // 使用IntersectionObserver优化动画触发
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    const fetchSkills = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/profile-public'); // Assuming this returns the whole settings.json content or at least the skills part
        if (!res.ok) throw new Error('Failed to fetch skills data');
        const data = await res.json();
        
        if (data && Array.isArray(data.skills)) {
          const formattedSkills: SkillGroup[] = data.skills.map((group: SkillFromSettings) => ({
            title: group.category, // Map category to title
            skills: group.skills
          }));
          setSkillGroups(formattedSkills);
        } else {
          console.error('Skills data is not in expected format or missing from API response', data);
          setSkillGroups([]); // Set to empty if data is not as expected
        }
      } catch (e) {
        console.error("Error fetching skills data:", e);
        setSkillGroups([]); // Set to empty on error
      } finally {
        setLoading(false);
      }
    };
    fetchSkills();
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-4 bg-muted/20 p-4 rounded-lg animate-pulse">
            {[1, 2, 3].map((j) => (
              <div key={j} className="space-y-2">
                <div className="h-4 bg-foreground/10 rounded w-24" />
                <div className="h-2 bg-foreground/10 rounded w-full" />
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }
  
  if (skillGroups.length === 0) {
    return <p className="text-center text-muted-foreground">{t('skills.noData', '未能加载技能数据或数据为空。')}</p>
  }

  return (
    <div ref={ref} className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {skillGroups.map((group, groupIndex) => (
        <div key={groupIndex} className="space-y-4 p-6 rounded-xl bg-white/[.30] dark:bg-black/[.30] shadow-lg transition-all hover:shadow-xl hover:scale-[1.02]">
          <h3 className="text-lg font-semibold mb-4 text-center text-foreground dark:text-white/90">{getDisplayCategoryName(group.title)}</h3>
          {group.skills.map((skill, skillIndex) => (
            <div key={skillIndex} className="space-y-1">
              <div className="flex justify-between items-center mb-0.5">
                <span className="text-sm text-foreground/80 dark:text-white/80 truncate" title={skill.name}>
                  {skill.name}
                </span>
                <span className="text-xs text-foreground/70 dark:text-white/70 ml-2">
                  {skill.level}%
                </span>
              </div>
              <div className="h-1.5 bg-muted/50 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-400 to-teal-200"
                  // className="h-full bg-gradient-to-r from-teal-400 to-teal-200 transition-all duration-1000 ease-out"
                  style={{
                    width: `${skill.level}%`, // Directly use skill.level, remove isVisible dependency for now
                    // width: isVisible ? `${skill.level}%` : "0%",
                    // transitionDelay: `${(groupIndex * group.skills.length + skillIndex) * 100}ms`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
})
