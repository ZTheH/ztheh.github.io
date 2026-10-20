import { defineConfig } from 'astro/config';

// User-site repo (ZTheH/ZTheH.github.io) is served from the domain root, so no `base` is needed.
// If you later attach a custom domain, change `site` to it.
export default defineConfig({
  site: 'https://ztheh.github.io',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
  markdown: { shikiConfig: { theme: 'github-dark-default', wrap: false } },
});
