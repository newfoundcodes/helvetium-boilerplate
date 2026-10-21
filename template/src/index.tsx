import type { VNodeChild } from '@newfoundcodes/helvetium-dom';
import { FooterComponent } from './app/components/FooterComponent.js';
import { NavigationBarComponent } from './app/components/NavigationBarComponent.js';

export function Index({ children }: { children?: VNodeChild }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="A production-ready Helvetium application" />
        <link rel="stylesheet" href="/assets/app.css" />
        <title>__PROJECT_NAME__</title>
      </head>
      <body class="bg-neutral-50 text-neutral-900 m-0">
        <div class="min-h-screen grid grid-rows-[auto_1fr_auto]">
          <NavigationBarComponent />
          {children}
          <FooterComponent />
        </div>
      </body>
    </html>
  );
}
