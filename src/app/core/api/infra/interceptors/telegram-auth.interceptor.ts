import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TelegramInitService } from '../../../../shared/services/telegram-init.service';

export const telegramAuthInterceptorFn: HttpInterceptorFn = (req, next) => {
  const tg = inject(TelegramInitService);
  const initData = tg.getInitData();
  if (!initData) return next(req);
  return next(
    req.clone({
      setHeaders: { 'X-Telegram-Init-Data': initData },
      withCredentials: false,
    })
  );
};
