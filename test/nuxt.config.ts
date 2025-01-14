export default defineNuxtConfig({
  ssr: false,

  runtimeConfig: {
    public: {
      firebaseConfig      : {
        apiKey           : process.env.FIREBASE_API_KEY,
        authDomain       : process.env.FIREBASE_AUTH_DOMAIN,
        projectId        : process.env.FIREBASE_PROJECT_ID,
        storageBucket    : process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId            : process.env.FIREBASE_APP_ID,
      },
    },
  },

  app: {
    head: {
      meta: [
        { name: 'robots', content: 'noindex, nofollow' },
      ],
    },
  },

  components: {
    global: true,
    dirs  : ['~/components'],
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },
    build: {
      rollupOptions: {
        external: ['gk-firebase-manager'], // gk-firebase-managerを外部モジュールとして指定
      },
    },
  },

  css: [
    'modern-css-reset/dist/reset.min.css',
    '~/assets/scss/base.scss',
  ],

  compatibilityDate: '2024-12-23',
})