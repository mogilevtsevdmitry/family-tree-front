import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layout/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  template: `
    <app-header />

    <main class="page">
      <div class="lg-card lg-shimmer" style="height:120px">
        <p>Какой-то текст</p>
      </div>
      <router-outlet />
    </main>
  `,
})
export class AppComponent {}
