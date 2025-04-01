import type { SUPPORTED_LANGUAGES } from './consts.js';
import type cnMessage from '../locales/zh_CN/messages.json';

export type SupportedLanguagesKeysType = keyof typeof SUPPORTED_LANGUAGES;
export type SupportedLanguagesWithoutRegionKeysType = Exclude<SupportedLanguagesKeysType, `${string}_${string}`>;
export type I18nValueType = {
  message: string;
  placeholders?: Record<string, { content?: string; example?: string }>;
};

export type MessageKey = keyof typeof cnMessage;
export type LocalesJSONType = typeof cnMessage;
