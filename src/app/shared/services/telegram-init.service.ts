import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TelegramInitService {
  getInitData(): string | null {
    try {
      return window?.Telegram?.WebApp?.initData || null;
    } catch {
      return null;
    }
  }
}
