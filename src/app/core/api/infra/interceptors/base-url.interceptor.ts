import { HttpInterceptorFn } from '@angular/common/http';
import { ApiConfig } from '../api.config';

function startsWithAny(url: string, prefixes: string[]): boolean {
  return prefixes.some((p) => url.startsWith(p));
}

export const baseUrlInterceptor =
  (cfg: ApiConfig): HttpInterceptorFn =>
  (req, next) => {
    console.log(`🔧 [BaseUrlInterceptor] Original URL: ${req.url}, Method: ${req.method}`);

    const isAbsolute = /^https?:\/\//i.test(req.url);
    if (isAbsolute) {
      console.log(`🔧 [BaseUrlInterceptor] Absolute URL detected, skipping: ${req.url}`);
      return next(req);
    }

    const prefixes = cfg.apiPrefixes ?? ['/users', '/persons', '/relations', '/media'];
    const isApi = startsWithAny(req.url, prefixes);

    console.log(
      `🔧 [BaseUrlInterceptor] URL: ${req.url}, Is API: ${isApi}, Prefixes: ${prefixes.join(', ')}`
    );

    if (!isApi) {
      // ассеты и любые не-API относительные запросы идут как есть (например /i18n/ru.json)
      console.log(`🔧 [BaseUrlInterceptor] Non-API request, passing through: ${req.url}`);
      return next(req);
    }

    const url = `${cfg.baseUrl}${req.url.startsWith('/') ? '' : '/'}${req.url}`;
    console.log(`🔧 [BaseUrlInterceptor] Final URL: ${url} (baseUrl: ${cfg.baseUrl})`);
    return next(req.clone({ url }));
  };
