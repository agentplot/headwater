// The site, built by Astro with Starlight and published to GitHub Pages at
// https://agentplot.github.io/headwater by .github/workflows/pages.yml.
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLinksValidator from 'starlight-links-validator';

export default defineConfig({
  site: 'https://agentplot.github.io',
  base: '/headwater',
  integrations: [
    starlight({
      title: 'headwater',
      description: 'Every release newer than what your repository pins, in upstream’s own words.',
      logo: {
        light: './src/assets/mark-light.svg',
        dark: './src/assets/mark-dark.svg',
        alt: 'headwater',
      },
      favicon: '/favicon.svg',
      // The start page's hero, with the animated diagram; every other page
      // keeps Starlight's.
      components: { Hero: './src/components/Hero.astro' },
      customCss: ['./src/styles/brand.css', './src/styles/diagrams.css'],
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/agentplot/headwater' }],
      editLink: { baseUrl: 'https://github.com/agentplot/headwater/edit/main/site/' },
      plugins: [starlightLinksValidator()],
      sidebar: [
        { label: 'Start', link: '/' },
        { label: 'How it works', link: '/how-it-works/' },
        { label: 'How it fits', link: '/how-it-fits/' },
        { label: 'Design', link: '/design/' },
        { label: 'Roadmap', link: '/roadmap/' },
      ],
    }),
  ],
});
