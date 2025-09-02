import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule],
  styles: [
    `
      .wrap {
        margin-top: 24px;
      }
      .lg-card {
        padding: 16px;
        border-radius: 16px;
      }
    `,
  ],
  template: `
    <section class="wrap">
      <div class="lg-card">
        <h2 style="margin:0 0 8px 0;">Профиль</h2>
        <p>Страница пока пустая.</p>
      </div>
    </section>
  `,
})
export class ProfilePage {}
