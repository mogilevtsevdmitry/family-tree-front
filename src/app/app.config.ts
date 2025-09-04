import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, inject, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { provideFamilyTreeApi } from './core/api/provide-family-tree-api';
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
    provideFamilyTreeApi({
      baseUrl: environment.apiBaseUrl,
      apiPrefixes: ['/users', '/persons', '/relations', '/media'],
    }),
    provideAnimationsAsync(),
  ],
};
