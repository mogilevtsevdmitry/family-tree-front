import { InjectionToken } from '@angular/core';

export interface ApiConfig {
  baseUrl: string; // например: 'http://localhost:3004'
  apiPrefixes?: string[]; // какие относительные пути считаем API
}

export const API_CONFIG = new InjectionToken<ApiConfig>('API_CONFIG');
export const FAMILY_TREE_API = new InjectionToken('FAMILY_TREE_API');
