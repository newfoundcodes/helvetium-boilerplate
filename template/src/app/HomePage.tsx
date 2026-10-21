import { Anchor } from '@newfoundcodes/helvetium-dom';

export function HomePage() {
  return (
    <main class="max-w-[1100px] w-full px-4 mx-auto py-20">
      <p class="uppercase tracking-widest text-sm font-bold text-neutral-500 mb-4">
        Helvetium full-stack starter
      </p>
      <h1 class="max-w-[18ch] text-4xl md:text-6xl lg:text-[5rem] leading-[0.95] font-bold mb-6">
        Build one application from browser to database.
      </h1>
      <p class="max-w-[65ch] leading-relaxed text-lg mb-8">
        This page is rendered by Helvetium DOM through Helvetium Boot. Same-origin Anchor navigation
        stays inside the current document.
      </p>
      <div class="flex flex-wrap gap-3 mt-8">
        <Anchor
          class="inline-block px-4 py-3 rounded-lg bg-neutral-900 text-white font-medium hover:bg-neutral-800 transition-colors"
          to="/about"
        >
          About this starter
        </Anchor>
        <Anchor
          class="inline-block px-4 py-3 rounded-lg bg-neutral-200 text-neutral-900 font-medium hover:bg-neutral-300 transition-colors"
          to="/api/health"
          reloadDocument
        >
          Health JSON
        </Anchor>
      </div>
    </main>
  );
}
