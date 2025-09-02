import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';
import { LanguageToggleComponent } from '../../shared/components/theme-toggle/language-toggle/language-toggle.component';
import { TranslationService } from '../../shared/services/translation.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, ThemeToggleComponent, LanguageToggleComponent],
  styles: [
    `
      header {
        position: sticky;
        top: 0;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 0.75rem 1rem;
      }
      .brand {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 800;
        letter-spacing: 0.3px;
        user-select: none;
      }
      .brand a {
        color: inherit;
        text-decoration: none;
      }
      nav {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
      }
      .btn-lg {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.6rem 1rem;
        border-radius: 9999px;
        border: 1px solid rgba(255, 255, 255, 0.4);
        background: rgba(255, 255, 255, var(--lg-opacity));
        backdrop-filter: blur(calc(var(--lg-blur) * 0.8)) saturate(var(--lg-saturation));
        -webkit-backdrop-filter: blur(calc(var(--lg-blur) * 0.8)) saturate(var(--lg-saturation));
        color: var(--fg);
        text-decoration: none;
        cursor: pointer;
        user-select: none;
        transition: transform 0.12s ease, box-shadow 0.12s ease;
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.18), inset 0 1px rgba(255, 255, 255, 0.3);
      }
      .btn-lg:active {
        transform: translateY(1px) scale(0.98);
      }

      .actions {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .lg-container {
        padding: 0.75rem 1rem;
      }
    `,
  ],
  template: `
    <header class="lg-container" role="banner" aria-label="Main header">
      <div class="brand">
        <a routerLink="/">{{ i18n.t('header.brand') }}</a>
      </div>

      <nav aria-label="Primary">
        <a class="btn-lg" routerLink="/">{{ i18n.t('nav.home') }}</a>
        <a class="btn-lg" routerLink="/profile">{{ i18n.t('nav.profile') }}</a>
      </nav>

      <div class="actions">
        <app-language-toggle />
        <app-theme-toggle />
      </div>
    </header>
  `,
})
export class HeaderComponent {
  public i18n = inject(TranslationService);
}
