import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, inject, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { LanguageService } from './shared/services/language.service';
import { ThemeService } from './shared/services/theme.service';

function initApp() {
  const lang = inject(LanguageService);
  const theme = inject(ThemeService);
  return () => {
    lang.init(true, 'ru');
    theme.setTheme('dark');
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    { provide: 'APP_INITIALIZER', useFactory: initApp, multi: true },
    provideHttpClient(),
  ],
};
