import { Anchor } from '@newfoundcodes/helvetium-dom';

export function AboutPage() {
  return (
    <main class="max-w-[1100px] w-full px-4 mx-auto py-20">
      <p class="uppercase tracking-widest text-sm font-bold text-neutral-500 mb-4">
        Structure first
      </p>
      <h1 class="max-w-[18ch] text-4xl md:text-6xl lg:text-[5rem] leading-[0.95] font-bold mb-6">
        About
      </h1>
      <p class="max-w-[65ch] leading-relaxed text-lg mb-8">
        Pages live in <code class="bg-neutral-200 px-1.5 py-0.5 rounded">src/app</code>, API
        callbacks live in{' '}
        <code class="bg-neutral-200 px-1.5 py-0.5 rounded">src/routes/handlers</code>, middleware
        lives in <code class="bg-neutral-200 px-1.5 py-0.5 rounded">src/middlewares</code>, and
        schema changes live in <code class="bg-neutral-200 px-1.5 py-0.5 rounded">migrations</code>.
      </p>
      <Anchor
        class="inline-block px-4 py-3 rounded-lg bg-neutral-900 text-white font-medium hover:bg-neutral-800 transition-colors"
        to="/"
      >
        Back home
      </Anchor>
    </main>
  );
}
