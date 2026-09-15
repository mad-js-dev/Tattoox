export default defineNuxtConfig({
  compatibilityDate: '2026-09-04',
  app: {
    baseURL: '/tattoox/',
    buildAssetsDir: '_nuxt',
  },
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/']
    }
  },
  devtools: { enabled: true },
  srcDir: 'app/', 
  css: ['assets/css/tailwind.css'],
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/i18n',
  ],
  components: [
    {
      path: '~/components/ui',
      prefix: 'Ui',
      pathPrefix: false,
    },
  ],
  i18n: {
    strategy: 'no_prefix',
    defaultLocale: 'es',
    locales: [
      { code: 'en', iso: 'en-US', name: 'English', file: 'en.json' },
      { code: 'es', iso: 'es-ES', name: 'Español', file: 'es.json' }
    ],
    langDir: 'locales',
  },
  typescript: {
    strict: false,
    typeCheck: false
  },
  vite: {
    server: {
      allowedHosts: [
        'maribel-extensa-2540.tailef5f9d.ts.net',
        'maribel-extensa-2540',
        'all',
      ],
    },
    resolve: {
      alias: {
        '@': './app',
        '~': './app',
      },
    },
  },
})
