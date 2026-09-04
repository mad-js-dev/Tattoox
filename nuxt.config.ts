export default defineNuxtConfig({
  compatibilityDate: '2026-09-04',
  devtools: { enabled: true },
  srcDir: 'app/', 
  css: ['~/assets/css/tailwind.css'],
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/i18n'
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
      { code: 'en', iso: 'en-US', name: 'English' },
      { code: 'es', iso: 'es-ES', name: 'Español' }
    ],
  },
  typescript: {
    strict: true,
    typeCheck: true
  },
  vite: {
    resolve: {
      alias: {
        '@': '/home/maribel/Documentos/Tattoox/app',
        '~': '/home/maribel/Documentos/Tattoox/app',
      },
    },
  },
})
