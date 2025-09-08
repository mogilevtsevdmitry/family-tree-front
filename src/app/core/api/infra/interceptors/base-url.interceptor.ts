import { HttpInterceptorFn } from '@angular/common/http';
import { ApiConfig } from '../api.config';

function startsWithAny(url: string, prefixes: string[]): boolean {
  return prefixes.some((p) => url.startsWith(p));
}

export const baseUrlInterceptor =
  (cfg: ApiConfig): HttpInterceptorFn =>
  (req, next) => {
    const isAbsolute = /^https?:\/\//i.test(req.url);
    if (isAbsolute) {
      return next(req);
    }

    const prefixes = cfg.apiPrefixes ?? ['/users', '/persons', '/relations', '/media'];
    const isApi = startsWithAny(req.url, prefixes);

    if (!isApi) {
      return next(req);
    }

    const url = `${cfg.baseUrl}${req.url.startsWith('/') ? '' : '/'}${req.url}`;
    return next(req.clone({ url }));
  };
