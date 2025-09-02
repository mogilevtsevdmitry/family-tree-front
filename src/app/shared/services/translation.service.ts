import { Injectable, computed, effect, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LanguageService } from './language.service';

type Dict = Record<string, string>;

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly http = inject(HttpClient);
  private readonly lang = inject(LanguageService).current;

  /** активный словарь */
  private readonly dict = signal<Dict>({});

  /** загрузка словаря при смене языка */
  constructor() {
    effect(() => {
      const l = this.lang();
      const url = `i18n/${l}.json`;
      this.http.get<Dict>(url).subscribe({
        next: (d) => this.dict.set(d ?? {}),
        error: () => this.dict.set({}), // без падения приложения
      });
    });
  }

  /** получить перевод (возвращает строку, если нет — ключ) */
  t(key: string): string {
    return this.dict()[key] ?? key;
  }

  /** реактивно следить за ключом (для сложных шаблонов) */
  select(key: string) {
    return computed(() => this.dict()[key] ?? key);
  }
}
