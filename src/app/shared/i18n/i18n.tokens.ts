import { InjectionToken } from '@angular/core';

export const SUPPORTED_LANGS = ['en', 'ru'] as const;
export type SupportedLang = (typeof SUPPORTED_LANGS)[number];
export const DEFAULT_LANG: SupportedLang = 'en';

export const I18N_STORAGE_KEY = 'app.lang';

export const RTL_LANGS = ['ar', 'fa', 'he', 'ur'] as const;
export type RtlLang = (typeof RTL_LANGS)[number];

export const I18N_SUPPORTED_LANGS = new InjectionToken<readonly string[]>('I18N_SUPPORTED_LANGS', {
  factory: () => SUPPORTED_LANGS as unknown as readonly string[],
});

export const I18N_DEFAULT_LANG = new InjectionToken<string>('I18N_DEFAULT_LANG', {
  factory: () => DEFAULT_LANG,
});
