import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layout/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  styles: [
    `
      main.page {
        margin: 0 auto;
        padding: 24px;
      }
    `,
  ],
  template: `
    <app-header />
    <main class="page">
      <router-outlet />
    </main>
  `,
})
export class AppComponent {}
