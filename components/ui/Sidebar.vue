<template>
  <div class="sidebar-wrapper">
    <div class="floating-menu" @click="mobileMenu = !mobileMenu">
      <MenuIcon v-if="!mobileMenu" size="1x" />
      <MinusIcon v-else size="1x" />
    </div>
    <nav class="sidebar" :class="{ 'sidebar__mobile': mobileMenu }" @click="closeIfMobile">
      <div class="sidebar--logo">
        <img src="/logo.svg" />
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
        <p>Разработал Rogi27, версия от <b>15.08.2021</b></p>
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
    LibraryIcon
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
              icon: PuzzleIcon,
              title: "Панель управления",
              to: "/management",
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
  @apply overflow-auto z-30 w-[20%] hidden fixed sm:flex flex-col h-full bg-opacity-5 bg-mariner-light-600 rounded-r-2xl;
  &__mobile {
    @apply flex fixed w-full bg-mariner-light-200;
  }
  .sidebar--logo {
    @apply flex justify-center p-6 mb-6;
    img {
      @apply w-32;
    }
  }
  .sidebar--menu {
    @apply flex flex-col;
    &__account {
      @apply mt-auto;
    }
    .sidebar--link {
      @apply flex flex-row items-center font-semibold text-lg mx-2 py-2 px-4 text-water-600 rounded-2xl;
      span {
        @apply relative mr-2;
      }
      &:hover {
        @apply bg-mariner-light-600 bg-opacity-10;
      }
    }
  }
  .sidebar--footer {
    @apply text-center text-sm text-water-400 font-medium m-4;
  }
}

.floating-menu {
  @apply z-50 cursor-pointer bottom-0 right-0 fixed sm:hidden bg-water-600 text-mariner-light-50 rounded-full m-4 p-4 text-3xl;
}
</style>
