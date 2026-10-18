import { Anchor, h } from '@newfoundcodes/helvetium-dom';

export function NotFoundPage() {
  return (
    <main class="max-w-[1100px] w-full px-4 mx-auto py-20">
      <p class="uppercase tracking-widest text-sm font-bold text-neutral-500 mb-4">404</p>
      <h1 class="max-w-[18ch] text-4xl md:text-6xl lg:text-[5rem] leading-[0.95] font-bold mb-6">
        Page not found.
      </h1>
      <p class="max-w-[65ch] leading-relaxed text-lg mb-8">
        The requested page does not exist or may have moved.
      </p>
      <Anchor
        class="inline-block px-4 py-3 rounded-lg bg-neutral-900 text-white font-medium hover:bg-neutral-800 transition-colors"
        to="/"
      >
        Return home
      </Anchor>
    </main>
  );
}
