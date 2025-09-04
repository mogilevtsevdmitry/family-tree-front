import { HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs/operators';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const startTime = Date.now();
  const originalUrl = req.url;

  // Логируем исходящий запрос
  console.log(`🚀 [HTTP Request] ${req.method} ${originalUrl}`, {
    originalUrl: originalUrl,
    headers: req.headers.keys().reduce((acc, key) => {
      acc[key] = req.headers.get(key);
      return acc;
    }, {} as Record<string, string | null>),
    body: req.body,
    withCredentials: req.withCredentials,
    timestamp: new Date(startTime).toISOString(),
  });

  return next(req).pipe(
    tap({
      next: (event) => {
        const duration = Date.now() - startTime;

        if (event.type === 0) {
          // HttpSentEvent - начало отправки (здесь можем получить финальный URL)
          const finalUrl = (event as any).url || req.url;
          console.log(`📤 [HTTP Sent] ${req.method} ${originalUrl}`, {
            finalUrl: finalUrl,
            redirected: finalUrl !== originalUrl,
            duration: `${duration}ms`,
            timestamp: new Date().toISOString(),
          });
        } else if (event.type === 4) {
          // HttpResponse - успешный ответ
          const finalUrl = (event as any).url || req.url;
          console.log(`✅ [HTTP Response] ${req.method} ${originalUrl}`, {
            finalUrl: finalUrl,
            redirected: finalUrl !== originalUrl,
            status: event.status,
            statusText: event.statusText,
            duration: `${duration}ms`,
            headers: event.headers.keys().reduce((acc, key) => {
              acc[key] = event.headers.get(key);
              return acc;
            }, {} as Record<string, string | null>),
            body: event.body,
            timestamp: new Date().toISOString(),
          });
        }
      },
      error: (error) => {
        const duration = Date.now() - startTime;
        const finalUrl = (error as any).url || req.url;

        console.error(`❌ [HTTP Error] ${req.method} ${originalUrl}`, {
          finalUrl,
          originalUrl,
          redirected: finalUrl !== originalUrl,
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          duration: `${duration}ms`,
          error: error.error,
          timestamp: new Date().toISOString(),
        });
      },
    })
  );
};
