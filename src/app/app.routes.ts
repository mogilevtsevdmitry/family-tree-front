import { Routes } from '@angular/router';
import { HomePage } from './pages/home/home.page';
import { ProfilePage } from './pages/profile/profile.page';

export const routes: Routes = [
  { path: '', component: HomePage, title: 'Family Tree — Home' },
  { path: 'profile', component: ProfilePage, title: 'Family Tree — Profile' },
  { path: '**', redirectTo: '' },
];
