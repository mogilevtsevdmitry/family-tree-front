// src/app/app.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeService } from './shared/theme/theme.service';
import { LiquidGlassDirective } from './shared/theme/liquid-glass.directive';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TranslateModule, LiquidGlassDirective],
  template: `
    <div class="app-shell">
      <header
        class="app-header"
        [appLiquidGlass]="theme.liquid()"
        [lgBlur]="22"
        [lgSaturation]="1.5"
        [lgBorder]="1"
        [lgAnimate]="true"
      >
        <div>🌳 <strong>Family Tree</strong></div>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-ghost" (click)="onToggleTheme()">
            {{ theme.theme() === 'dark' ? 'Light' : 'Dark' }} theme
          </button>
          <button class="btn btn-primary" (click)="onToggleLiquid()">
            {{ theme.liquid() ? 'Solid UI' : 'Liquid Glass' }}
          </button>
        </div>
      </header>

      <main class="app-main">
        <!-- liquid карточка (подхватит глобальный флаг) -->
        <section
          [appLiquidGlass]="theme.liquid()"
          class="lg-roomy"
          [lgBlur]="18"
          [lgSaturation]="1.4"
          [lgBorder]="1"
          [lgAnimate]="true"
        >
          <h2 style="margin:0 0 8px 0;">Liquid Glass Card</h2>
          <p class="u-muted">Frosted translucency with animated sheen.</p>
        </section>

        <!-- обычная карточка -->
        <section class="card">
          <h2 style="margin:0 0 8px 0;">Regular Card</h2>
          <p class="u-muted">Solid elevated surface.</p>
        </section>
      </main>
    </div>
  `,
})
export class AppComponent implements OnInit {
  readonly theme = inject(ThemeService);

  ngOnInit(): void {
    this.theme.init();
  }

  onToggleTheme(): void {
    this.theme.toggleTheme();
  }
  onToggleLiquid(): void {
    this.theme.toggleLiquid();
  }
}
