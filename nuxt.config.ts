export default defineNuxtConfig({\n  compatibilityDate: '2026-09-04',\n  app: {\n    baseURL: process.env.GITHUB_PAGES === 'true' ? '/tattoox/' : '/',\n    buildAssetsDir: 'assets',\n  },\n  devtools: { enabled: true },\n  srcDir: 'app/', 
  css: ['~/assets/css/tailwind.css'],
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
    langDir: '/home/maribel/Documentos/Tattoox/app/locales',
  },
  typescript: {
    strict: true,
    typeCheck: true
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
        '@': '/home/maribel/Documentos/Tattoox/app',
        '~': '/home/maribel/Documentos/Tattoox/app',
      },
    },
  },
})
