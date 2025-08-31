import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// 确认是否在客户端环境
const isClient = typeof window !== 'undefined'

// 初始化i18next
const i18n = i18next
  .use(LanguageDetector)  // 使用语言检测器
  .use(initReactI18next)  // 将i18next与react-i18next集成

// 在客户端初始化配置
if (isClient) {
  try {
    // 仅在客户端动态导入翻译文件
    const enTranslation = require('./locales/en.json')
    const zhTranslation = require('./locales/zh.json')
    
    i18n.init({
      resources: {
        en: {
          translation: enTranslation,
          steam: enTranslation.steam,
          rss: enTranslation.rss,
          netease: enTranslation.netease,
          social: enTranslation.social,
          theme: enTranslation.theme,
          language: enTranslation.language,
          footer: enTranslation.footer,
          admin: enTranslation.admin,
          adminDashboard: enTranslation.adminDashboard,
          toastMessages: enTranslation.toastMessages,
          contentManagement: enTranslation.contentManagement,
          contentNew: enTranslation.contentNew,
          contentEdit: enTranslation.contentEdit,
          adminProfile: enTranslation.adminProfile,
          cacheTimeFormat: enTranslation.cacheTimeFormat,
        },
        zh: {
          translation: zhTranslation,
          steam: zhTranslation.steam,
          rss: zhTranslation.rss,
          netease: zhTranslation.netease,
          social: zhTranslation.social,
          theme: zhTranslation.theme,
          language: zhTranslation.language,
          footer: zhTranslation.footer,
          admin: zhTranslation.admin,
          adminDashboard: zhTranslation.adminDashboard,
          toastMessages: zhTranslation.toastMessages,
          contentManagement: zhTranslation.contentManagement,
          contentNew: zhTranslation.contentNew,
          contentEdit: zhTranslation.contentEdit,
          adminProfile: zhTranslation.adminProfile,
          cacheTimeFormat: zhTranslation.cacheTimeFormat,
        }
      },
      fallbackLng: 'zh',  // 设置回退语言为中文
      debug: true,  // 启用调试模式以便于问题排查
      
      // 语言检测配置
      detection: {
        // 按照优先级顺序排列语言检测方法
        order: ['querystring', 'localStorage', 'sessionStorage', 'navigator', 'htmlTag'],
        lookupQuerystring: 'lang',  // URL参数名称
        lookupLocalStorage: 'i18nextLng',  // 本地存储键名
        lookupSessionStorage: 'i18nextLng',  // 会话存储键名
        
        // 缓存用户语言选择
        caches: ['localStorage', 'sessionStorage'],
        
        // 确保语言代码格式一致
        convertDetectedLanguage: (lng) => lng.includes('zh') ? 'zh' : lng
      },
      
      // 定义命名空间
      ns: ['translation', 'steam', 'rss', 'netease', 'social', 'theme', 'language', 'footer', 'admin', 'adminDashboard', 'toastMessages', 'contentManagement', 'contentNew', 'contentEdit', 'adminProfile', 'cacheTimeFormat'],
      defaultNS: 'translation',
      
      // 其他i18next配置...
      interpolation: {
        escapeValue: false, // 不转义React已处理的值
      },
      
      // 确保页面初始加载时使用正确的语言
      react: {
        useSuspense: false
      }
    })
  } catch (error) {
    console.error('初始化i18n失败:', error)
  }
} else {
  // 在服务端简单初始化，避免错误
  i18n.init({
    resources: {
      en: { translation: {} },
      zh: { translation: {} }
    },
    lng: 'zh', // 将服务端默认语言修改为中文
    fallbackLng: 'zh', // 保持一致
    interpolation: { escapeValue: false }
  })
}

// 导出i18n实例
export default i18n
