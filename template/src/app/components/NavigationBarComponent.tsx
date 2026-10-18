import { Anchor, h } from '@newfoundcodes/helvetium-dom';

export function NavigationBarComponent() {
  return (
    <nav
      class="max-w-[1100px] w-full px-4 mx-auto flex items-center justify-between py-4"
      aria-label="Primary"
    >
      <strong>__PROJECT_NAME__</strong>
      <div class="flex gap-4">
        <Anchor to="/" class="hover:font-bold">
          Home
        </Anchor>
        <Anchor to="/about" class="hover:font-bold">
          About
        </Anchor>
      </div>
    </nav>
  );
}
