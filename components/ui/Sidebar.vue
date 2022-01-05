<template>
  <div class="sidebar-wrapper">
    <div class="floating-menu" @click="mobileMenu = !mobileMenu">
      <MenuIcon v-if="!mobileMenu" size="1x" />
      <MinusIcon v-else size="1x" />
    </div>
    <nav class="sidebar" :class="{ 'sidebar__open': mobileMenu }" @click="closeIfMobile">
      <div class="sidebar--logo">
        <svg viewBox="0 0 352 154" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0.000725848 108.203C-0.014167 111.093 0.20014 113.979 0.641629 116.835C1.35269 121.846 3.0192 126.675 5.55067 131.058C9.01709 137.077 14.1698 141.95 20.3732 145.076C26.7629 148.201 33.7966 149.785 40.9093 149.698V124.485C37.5739 124.555 34.2597 123.937 31.1731 122.671C28.4986 121.583 26.2166 119.71 24.6277 117.299C24.3652 116.905 24.1284 116.495 23.9186 116.071C22.8215 113.909 22.2647 111.514 22.2959 109.09C22.2515 107 22.6271 104.922 23.4004 102.981C23.5641 102.585 23.7414 102.19 23.9186 101.835C24.5324 100.639 25.3386 99.5518 26.305 98.617C27.4769 97.4791 28.869 96.5928 30.3958 96.0125C31.8837 95.4365 33.4639 95.1361 35.0594 95.1261C37.6775 95.1132 40.271 95.6328 42.682 96.6534C45.284 97.8086 47.7083 99.3284 49.8819 101.167C52.2955 103.158 55.0228 105.503 58.0636 108.203L104.999 153.557V50.6994L0.000725848 0V108.203ZM83.3452 66.5583H83.1815V108.135L61.5 83.9308C57.8399 79.6391 53.5005 75.9768 48.6547 73.09C43.9582 70.3141 38.5919 68.8759 33.1367 68.931C29.7376 68.9439 26.3675 69.5579 23.1823 70.7446V36.2859L83.3452 66.5583Z" fill="#5B8ADC"/>
          <path d="M124 65.7278H149.926C159.458 65.7278 166.677 67.8935 171.585 72.2248C176.493 76.5562 178.947 82.5207 178.947 90.1183C178.947 97.645 176.493 103.609 171.585 108.012C166.677 112.343 159.458 114.509 149.926 114.509H142.031V140.284H124V65.7278ZM149.926 80.5325H142.031V99.5976H149.926C153.554 99.5976 156.399 98.7811 158.462 97.1479C160.525 95.5148 161.556 93.1716 161.556 90.1183C161.556 86.9941 160.525 84.6154 158.462 82.9822C156.399 81.3491 153.554 80.5325 149.926 80.5325Z" class="theme"/>
          <path d="M201.464 110.249V95.7633H239.02C237.882 92.568 236.104 89.8343 233.686 87.5621C231.267 85.2899 228.493 83.5503 225.364 82.3432C222.305 81.1361 219.14 80.5325 215.868 80.5325C210.604 80.5325 206.123 81.4556 202.424 83.3018C198.726 85.1479 195.81 87.0651 193.676 89.0533V71.4793C196.663 69.2071 199.935 67.3964 203.491 66.0473C207.048 64.6982 211.529 64.0237 216.935 64.0237C224.972 64.0237 232.05 65.6568 238.167 68.9231C244.355 72.1893 249.192 76.7692 252.677 82.6627C256.233 88.4852 258.012 95.2663 258.012 103.006C258.012 110.746 256.233 117.562 252.677 123.456C249.192 129.278 244.355 133.822 238.167 137.089C232.05 140.355 224.972 141.988 216.935 141.988C211.529 141.988 207.048 141.314 203.491 139.964C199.935 138.615 196.663 136.805 193.676 134.533V116.959C195.81 118.947 198.726 120.864 202.424 122.71C206.123 124.556 210.604 125.479 215.868 125.479C219.14 125.479 222.305 124.876 225.364 123.669C228.493 122.462 231.267 120.722 233.686 118.45C236.104 116.178 237.882 113.444 239.02 110.249H201.464Z" class="theme"/>
          <path d="M333.969 140.284H284.89V152H266.859V124.734H279.022L309.429 62L339.837 124.734H352V152H333.969V140.284ZM309.429 94.4852L298.44 124.734H320.419L309.429 94.4852Z" class="theme"/>
        </svg>
        <uiThemeSwitch />
      </div>
      <div class="sidebar--menu">
        <NuxtLink v-for="link in links.base" :key="link.title" :to="link.to" class="sidebar--link">
          <span class="link-icon"><component :is="link.icon" size="1.3x" /></span> {{ link.title }}
        </NuxtLink>
      </div>
      <div class="sidebar--menu sidebar--menu__account">
        <NuxtLink v-for="link in baseAccountLinks" :key="link.title" :to="link.to" class="sidebar--link">
          <span class="link-icon"><component :is="link.icon" size="1.3x" /></span> {{ link.title }}
        </NuxtLink>
        <a v-for="link in specialAccountLinks" :key="link.title" href="javascript:void(0)" class="sidebar--link" @click="link.method">
          <span class="link-icon"><component :is="link.icon" size="1.3x" /></span> {{ link.title }}
        </a>
      </div>
      <div class="sidebar--footer">
        <p>Разработал Rogi27, версия от <b>02.09.2021</b></p>
      </div>
    </nav>
  </div>
</template>

<script>
import {
  BookOpenIcon,
  ClockIcon,
  MenuIcon,
  MinusIcon,
  LoginIcon,
  LogoutIcon,
  PuzzleIcon,
  SpeakerphoneIcon,
  SwitchVerticalIcon,
  SwitchHorizontalIcon,
  CollectionIcon,
  BellIcon,
  LibraryIcon,
  InboxInIcon,
  ClipboardCheckIcon
} from "@vue-hero-icons/outline"

export default {
  components: {
    BookOpenIcon,
    ClockIcon,
    MenuIcon,
    MinusIcon,
    LoginIcon,
    LogoutIcon,
    PuzzleIcon,
    SpeakerphoneIcon,
    SwitchVerticalIcon,
    SwitchHorizontalIcon,
    CollectionIcon,
    BellIcon,
    LibraryIcon,
    InboxInIcon,
    ClipboardCheckIcon,
  },
  data() {
    return {
      mobileMenu: false,
      links: {
          base: [
          {
            icon: BookOpenIcon,
            title: "Сегодняшний день",
            to: "/"
          },
          {
            icon: ClockIcon,
            title: "Расписание уроков",
            to: "/schedules"
          },
          {
            icon: SwitchHorizontalIcon,
            title: "Замены в расписании",
            to: "/replacements"
          },
          {
            icon: LibraryIcon,
            title: "Предметы",
            to: "/subjects"
          },
          {
            icon: InboxInIcon,
            title: "Домашние задания",
            to: "/homeworks"
          },
        ],
        account: {
          base: [
            {
              icon: LoginIcon,
              title: "Войти в аккаунт",
              to: "/account/login",
              auth: false,
            },
            {
              icon: ClipboardCheckIcon,
              title: "Управление домашкой",
              to: "/management/homeworks",
              auth: true,
            },
            {
              icon: SwitchVerticalIcon,
              title: "Управление заменами",
              to: "/management/replacements",
              auth: true,
            },
            {
              icon: SpeakerphoneIcon,
              title: "Управление уроками",
              to: "/management/schedules",
              auth: true,
            },
            {
              icon: CollectionIcon,
              title: "Управление предметами",
              to: "/management/subjects",
              auth: true,
            },
            {
              icon: BellIcon,
              title: "Управление звонками",
              to: "/management/bells",
              auth: true,
            },
          ],
          special: [
            {
              icon: LogoutIcon,
              title: "Выйти из аккаунта",
              method: this.logout,
              auth: true,
            },
          ]
        }
      }
    }
  },
  computed: {
    baseAccountLinks() {
      return this.$data.links.account.base.filter(link => link.auth === this.$auth.loggedIn)
    },
    specialAccountLinks() {
      return this.$data.links.account.special.filter(link => link.auth === this.$auth.loggedIn)
    },
  },
  methods: {
    openPage() {
      return null;
    },
    logout() {
      return this.$auth.logout();
    },
    closeIfMobile() {
      if(this.$data.mobileMenu) this.$data.mobileMenu = false;
    }
  }
}
</script>

<style lang="scss" scoped>
.sidebar {
  @apply transition-all duration-100 ease-in transform-gpu -translate-x-full md:translate-x-0 flex w-full overflow-auto z-50 md:w-[20%] md:opacity-100 fixed md:flex flex-col h-full bg-mariner-light-100 rounded-r-2xl;
  &__open {
    @apply translate-x-0;
  }
  .sidebar--logo {
    @apply flex flex-col items-center justify-center p-6 mb-6 gap-4;
    svg {
      @apply h-14;
      .theme {
        @apply fill-current text-water-dark-700;
      }
    }
  }
  .sidebar--menu {
    @apply flex flex-col;
    &__account {
      @apply mt-auto;
    }
    .sidebar--link {
      @apply flex flex-row items-center font-semibold sm:text-sm md:text-base 2xl:text-lg mx-2 py-2 px-4 text-water-600 md:p-2 md:m-2 md:flex-col md:text-center md:justify-center xl:text-left xl:m-0 xl:p-0 xl:mx-2 xl:py-2 xl:px-4 xl:flex-row xl:justify-start rounded-2xl;
      span {
        @apply relative mr-2;
      }
      &:hover {
        @apply bg-mariner-light-600 bg-opacity-10;
      }
      &.nuxt-link-exact-active {
        @apply bg-mariner-light-600 bg-opacity-5;
      }
    }
  }
  .sidebar--footer {
    @apply text-center text-sm text-water-400 font-medium m-4;
  }
}

.floating-menu {
  @apply z-50 cursor-pointer bottom-0 right-0 fixed md:hidden bg-water-600 text-mariner-light-50 rounded-full m-4 p-4 text-3xl;
}

.dark .sidebar {
  @apply bg-mariner-dark-900;
  .sidebar--logo {
    svg {
      .theme {
        @apply text-water-50;
      }
    }
  }
  .sidebar--menu {
    .sidebar--link {
      @apply text-mariner-dark-50 text-opacity-50;
      &:hover {
        @apply bg-mariner-light-600 bg-opacity-10;
      }
    }
  }
}

.dark .floating-menu {
  @apply bg-mariner-light-800 text-mariner-light-50;
}
</style>
