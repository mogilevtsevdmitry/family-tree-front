import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { EnvironmentProviders, inject, makeEnvironmentProviders } from '@angular/core';
import { FamilyTreeApiPort } from './domain/family-tree.api.port';
import { API_CONFIG, ApiConfig, FAMILY_TREE_API } from './infra/api.config';
import { HttpFamilyTreeApiService } from './infra/http-family-tree.api.service';
import { MockFamilyTreeApiService } from './infra/mock-family-tree.api.service';
import { baseUrlInterceptor } from './infra/interceptors/base-url.interceptor';
import { loggingInterceptor } from './infra/interceptors/logging.interceptor';
import { telegramAuthInterceptorFn } from './infra/interceptors/telegram-auth.interceptor';

/**
 * Подключает:
 * - API_CONFIG
 * - HttpClient с интерсепторами (logging, baseUrl, telegram auth)
 * - Реализацию порта FamilyTreeApiPort
 */
export function provideFamilyTreeApi(config: ApiConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: API_CONFIG, useValue: config },

    provideHttpClient(
      withInterceptors([
        loggingInterceptor,
        (req, next) => baseUrlInterceptor(inject(API_CONFIG))(req, next),
        telegramAuthInterceptorFn,
      ])
    ),

    HttpFamilyTreeApiService,
    { provide: FAMILY_TREE_API, useExisting: HttpFamilyTreeApiService },
    { provide: FamilyTreeApiPort, useExisting: HttpFamilyTreeApiService },
  ]);
}

/**
 * Подключает моковый сервис для тестирования без реального API:
 * - MockFamilyTreeApiService с тестовыми данными
 * - Реализацию порта FamilyTreeApiPort
 */
export function provideMockFamilyTreeApi(): EnvironmentProviders {
  return makeEnvironmentProviders([
    MockFamilyTreeApiService,
    { provide: FAMILY_TREE_API, useExisting: MockFamilyTreeApiService },
    { provide: FamilyTreeApiPort, useExisting: MockFamilyTreeApiService },
  ]);
}
