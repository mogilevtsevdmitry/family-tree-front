import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeMode, ThemeService } from '../../services/theme.service';

const THEME_STORAGE_KEY = 'app.theme';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  styles: [
    `
      :host {
        display: inline-flex;
      }
      .toggle {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.9rem;
        border-radius: 9999px;
        border: 1px solid rgba(255, 255, 255, 0.4);
        background: rgba(255, 255, 255, var(--lg-opacity));
        backdrop-filter: blur(calc(var(--lg-blur) * 0.8)) saturate(var(--lg-saturation));
        -webkit-backdrop-filter: blur(calc(var(--lg-blur) * 0.8)) saturate(var(--lg-saturation));
        cursor: pointer;
        user-select: none;
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.18), inset 0 1px rgba(255, 255, 255, 0.3);
        font-weight: 600;
      }
      .icon {
        font-size: 1rem;
        line-height: 1;
      }
      .sr-only {
        position: absolute;
        clip: rect(0, 0, 0, 0);
        clip-path: inset(50%);
        width: 1px;
        height: 1px;
        overflow: hidden;
        white-space: nowrap;
      }
    `,
  ],
  template: `
    <button
      type="button"
      class="toggle"
      (click)="toggle()"
      [attr.aria-pressed]="mode() === 'dark'"
      aria-label="Toggle theme"
    >
      <span class="icon" aria-hidden="true">{{ mode() === 'dark' ? '🌙' : '☀️' }}</span>
      <span>{{ label() }}</span>
      <span class="sr-only">Current theme {{ mode() }}</span>
    </button>
  `,
})
export class ThemeToggleComponent {
  private readonly theme = inject(ThemeService);

  constructor() {
    // синхронизация с DOM и сохранение
    effect(() => {
      const m = this.mode();
      this.theme.setTheme(m);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, m);
      } catch {}
    });
  }
  /** текущее значение темы */
  readonly mode = signal<ThemeMode>(this.readInitialTheme());

  /** метка кнопки */
  readonly label = computed(() => (this.mode() === 'dark' ? 'Dark' : 'Light'));

  toggle(): void {
    this.mode.set(this.mode() === 'dark' ? 'light' : 'dark');
  }

  private readInitialTheme(): ThemeMode {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {}
    return this.theme.getTheme() ?? 'dark';
  }
}
