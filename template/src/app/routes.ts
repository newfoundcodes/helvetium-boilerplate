import type { RouteDefinition } from '@newfoundcodes/helvetium-dom';
import { AboutPage } from './AboutPage.js';
import { HomePage } from './HomePage.js';

export const pageRoutes: RouteDefinition[] = [
  { id: 'home', path: '/', component: HomePage, title: 'Home - __PROJECT_NAME__' },
  { id: 'about', path: '/about', component: AboutPage, title: 'About - __PROJECT_NAME__' },
];
