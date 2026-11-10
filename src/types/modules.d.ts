declare module 'tailwindcss-pseudo-elements' {
  import type { Config } from 'tailwindcss';
  type Plugin = NonNullable<Config['plugins']>[number];
  const plugin: Plugin;
  export default plugin;
}
