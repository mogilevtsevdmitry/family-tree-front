import { ApplicationConfig, inject, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { ThemeService } from './shared/services/theme.service';
import { LanguageService } from './shared/services/language.service';

function initApp() {
  const lang = inject(LanguageService);
  const theme = inject(ThemeService);
  return () => {
    lang.init(true, 'ru'); // авто-детект из Telegram/браузера
    theme.setTheme('dark'); // дефолт — dark (или 'light')
    // например, под цвет бренда можно задать tint:
    // theme.setLiquidGlass({ tint: '255,153,0' });
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    { provide: 'APP_INITIALIZER', useFactory: initApp, multi: true },
  ],
};
