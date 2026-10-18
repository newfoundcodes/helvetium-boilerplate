import {
  RouterOutlet,
  RouterProvider,
  createBrowserRouter,
  h,
  hydrateRoot,
} from '@newfoundcodes/helvetium-dom';
import { pageRoutes } from './app/routes.js';
import { NotFoundPage } from './app/NotFoundPage.js';

const mount = document.getElementById('app');
if (!mount) {
  throw new Error('Missing #app mount');
}

const router = createBrowserRouter(pageRoutes, { notFound: NotFoundPage });
hydrateRoot(mount, h(RouterProvider, { router }, h(RouterOutlet, null)));
