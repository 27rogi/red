export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'Электронный дневник',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'format-detection', content: 'telephone=no' },
      { name: 'theme-color', content: '#2f6ace' },
      { hid: 'description', name: 'description', content: 'Электронный дневник для учащихся в группе 3ИП-11-19, позволяет смотреть расписание, подсказывает время до начала и конца урока, позволяет добавлять домашнее задание и оповещает о начале уроков в ВК.' },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&display=swap',
      },
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: '/favicon.svg',
      },
      {
        rel: 'icon',
        type: 'image/png',
        href: '/favicon.png',
      },
    ]
  },

  env: {
    baseUrl:
      process.env.NODE_ENV === 'dev'
        ? 'http://localhost'
        : 'https://api.ryzhenkov.space'
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '~/assets/base.scss',
    '~/assets/table.scss',
    '~/assets/select.scss'
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    { src: '~/plugins/vue-ohicons', ssr: false },
    { src: '~/plugins/vue-select', ssr: false },
    { src: '~/plugins/vue-good-table', ssr: false },
    { src: '~/plugins/vue-toasted', ssr: false },
    { src: '~/plugins/vue-tippy', ssr: false },
    { src: '~/plugins/vue-visibility', ssr: false }
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    'nuxt-webpack-optimisations',
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module',
    // https://go.nuxtjs.dev/tailwindcss
    '@nuxtjs/moment',
    '@nuxtjs/color-mode',
    '@nuxtjs/composition-api/module',
  ],

  moment: {
    defaultLocale: 'ru',
    locales: ['ru'],
    defaultTimezone: 'Europe/Moscow'
  },

  modern: true,

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    '@nuxt/postcss8',
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    // https://go.nuxtjs.dev/pwa
    '@nuxtjs/pwa',
    '@nuxtjs/auth-next',
    '@nuxtjs/sitemap',
    '@nuxtjs/device',
    '@luxdamore/nuxt-prune-html',
    'nuxt-precompress',
  ],

  colorMode: {
    classSuffix: '',
    fallback: 'light',
    preference: 'light',
  },

  transition: {
    name: 'fade',
    mode: 'out-in'
  },

  auth: {
    strategies: {
      local: {
        scheme: 'refresh',
        token: {
          property: 'tokens.access.token',
          maxAge: 1800,
          global: true,
          // type: 'Bearer'
        },
        refreshToken: {
          property: 'tokens.refresh.token',
          data: 'refreshToken',
          maxAge: 60 * 60 * 24 * 30
        },
        user: {
          property: false,
          autoFetch: true
        },
        endpoints: {
          login: {
            url: (process.env.NODE_ENV === 'dev'
              ? 'http://localhost'
              : 'https://api.ryzhenkov.space') + '/v1/auth/login', method: 'post'
          },
          refresh: {
            url: (process.env.NODE_ENV === 'dev'
              ? 'http://localhost'
              : 'https://api.ryzhenkov.space') + '/v1/auth/refresh-tokens', method: 'post'
          },
          user: {
            url: (process.env.NODE_ENV === 'dev'
              ? 'http://localhost'
              : 'https://api.ryzhenkov.space') + '/v1/users/user', method: 'get'
          },
          logout: {
            url: (process.env.NODE_ENV === 'dev'
              ? 'http://localhost'
              : 'https://api.ryzhenkov.space') + '/v1/auth/logout', method: 'post'
          }
        },
        // autoLogout: false
      }
    }
  },

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {},

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  pwa: {
    manifest: {
      lang: 'en'
    }
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    postcss: {
      plugins: {
        tailwindcss: {},
        autoprefixer: {},
      },
    },
    babel: {
      plugins: [
        ['@babel/plugin-proposal-private-property-in-object', { loose: true }]
      ],
    },
  },


}
