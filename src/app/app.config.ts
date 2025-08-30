import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
  importProvidersFrom,
  inject,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  provideTranslateHttpLoader,
} from '@ngx-translate/http-loader';

// ---- i18n settings ----
export const SUPPORTED_LANGS = ['en', 'ru'] as const;
export type SupportedLang = (typeof SUPPORTED_LANGS)[number];
export const DEFAULT_LANG: SupportedLang = 'ru';

export function resolveInitialLang(): SupportedLang {
  const tgUserLang =
    window?.Telegram?.WebApp?.initDataUnsafe?.user?.language_code ||
    window?.Telegram?.WebApp?.languageCode;

  const browserLang = navigator?.language?.split('-')[0];

  const candidates = [tgUserLang, browserLang, DEFAULT_LANG]
    .filter((x): x is string => !!x)
    .map((x) => x.toLowerCase());

  const match = candidates.find((c) =>
    (SUPPORTED_LANGS as readonly string[]).includes(c),
  );

  return (match as SupportedLang) ?? DEFAULT_LANG;
}

function initTranslate() {
  const translate = inject(TranslateService);

  translate.addLangs([...SUPPORTED_LANGS]);
  translate.setDefaultLang(DEFAULT_LANG);

  const initial = resolveInitialLang();
  translate.use(initial).subscribe({
    error: (e) => {
      console.error('[i18n] failed to load lang', initial, e);
      if (initial !== DEFAULT_LANG) translate.use(DEFAULT_LANG).subscribe();
    },
  });
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),

    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: DEFAULT_LANG,
        useDefaultLang: true,
        isolate: false,
      }),
    ),

    ...provideTranslateHttpLoader({
      prefix: './assets/i18n/',
      suffix: '.json',
    }),

    { provide: 'APP_I18N_INIT', useFactory: initTranslate },
  ],
};
