export {};

declare global {
  interface TelegramWebAppUser {
    id: number;
    is_bot?: boolean;
    first_name?: string;
    last_name?: string;
    username?: string;
    language_code?: string; // например "en", "ru"
  }

  interface TelegramWebAppInitDataUnsafe {
    user?: TelegramWebAppUser;
  }

  interface TelegramWebApp {
    initData?: string;
    initDataUnsafe?: TelegramWebAppInitDataUnsafe;
    colorScheme?: 'light' | 'dark';
    languageCode?: string;
  }

  interface TelegramNamespace {
    WebApp?: TelegramWebApp;
  }

  interface Window {
    Telegram?: TelegramNamespace;
  }
}
