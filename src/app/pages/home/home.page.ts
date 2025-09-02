import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule],
  styles: [
    `
      .hero {
        margin-top: 24px;
      }
      .lg-card {
        padding: 16px;
        border-radius: 16px;
      }
    `,
  ],
  template: `
    <section class="hero">
      <div class="lg-card">
        <h1 style="margin:0 0 8px 0;">Family Tree</h1>
        <p>Главный экран. Тут позже будет контент.</p>
      </div>
    </section>
  `,
})
export class HomePage {}
