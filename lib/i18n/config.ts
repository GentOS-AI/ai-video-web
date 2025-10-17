/**
 * i18n Configuration
 * Defines available locales and default language settings
 */

export const locales = ['en', 'zh', 'zh-TW'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  zh: '简体中文',
  'zh-TW': '繁體中文',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  zh: '🇨🇳',
  'zh-TW': '🧧', // 红包图标 - 代表繁体中文/传统中文
};
