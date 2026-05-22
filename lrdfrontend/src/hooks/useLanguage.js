import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    return saved || 'zh';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key) => {
    return translations[language][key] || key;
  };

  const td = (type, value) => {
    if (language === 'zh') {
      return value; // 中文直接返回原内容
    }
    // 俄语时查找翻译
    const translationsMap = translations[type];
    return translationsMap && translationsMap[value] ? translationsMap[value] : value;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'zh' ? 'ru' : 'zh');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, td, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
