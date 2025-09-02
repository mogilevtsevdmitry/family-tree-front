import { Routes } from '@angular/router';
// import { HomePage } from './pages/home/home.page';
// import { ProfilePage } from './pages/home/profile/profile.page';

export const routes: Routes = [
  // { path: '', pathMatch: 'full', redirectTo: 'home' },
  // { path: 'home', component: HomePage, title: 'Family Tree — Home' },
  // { path: 'profile', component: ProfilePage, title: 'Family Tree — Profile' },

  // 404 по вкусу:
  { path: '**', redirectTo: 'home' },
];
