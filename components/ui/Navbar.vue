<template>
  <transition name="fade" mode="in-out">
    <div v-if="!mobileMenu" class="navbar-wrapper">
      <nav class="navbar">
        <div class="navbar__logo">
          <nuxt-link to="/">
            <img src="@/static/logo.svg" />
          </nuxt-link>
        </div>
        <div class="navbar__links navbar__right">
          <nuxt-link v-for="link of links.base" :key="link.title" :to="link.to" exact>
            <span>
              <v-icon :name="link.icon" />
            </span>
            {{ link.title }}
          </nuxt-link>
          <a
            v-if="$auth.loggedIn"
            href="javascript:void(0)"
            @click.prevent="switchSection('account')"
          >
            <span>
              <v-icon name="md-nearmedisabled-twotone" />
            </span>
            {{ $auth.user.name }}
          </a>
          <nuxt-link v-else to="/account/login">
            <span>
              <v-icon name="md-vpnkey-twotone" />
            </span>
          </nuxt-link>
          <a class="mobile" href="javascript:void(0)" @click.prevent="mobileMenu = true">
            <span>
              <v-icon name="md-menu-twotone" />
            </span>
          </a>
        </div>
      </nav>
      <transition name="fade" mode="out-in">
        <div v-if="section === 'account'" class="navbar-bottom">
          <div class="navbar-bottom__links">
            <nuxt-link v-for="link of accountLink" :key="link.title" :to="link.to" exact>
              <span>
                <v-icon :name="link.icon" />
              </span>
              {{ link.title }}
            </nuxt-link>
            <a
              v-if="$auth.loggedIn"
              href="javascript:void(0)"
              @click.prevent="$auth.logout()"
            >Выйти из аккаунта</a>
          </div>
        </div>
      </transition>
    </div>
    <nav v-else class="navbar-mobile" @click.prevent="mobileMenu = false">
      <div class="navbar__logo">
        <nuxt-link to="/">
          <img src="@/static/logo.svg" />
        </nuxt-link>
      </div>
      <div class="navbar__links navbar__right">
        <nuxt-link v-for="link of links.base" :key="link.title" :to="link.to" exact>
          <span>
            <v-icon scale="1.8" :name="link.icon" />
          </span>
          {{ link.title }}
        </nuxt-link>
        <a
          v-if="$auth.loggedIn"
          href="javascript:void(0)"
          @click.prevent="switchSection('account')"
        >
          <span>
            <v-icon scale="1.8" name="md-nearmedisabled-twotone" />
          </span>
          {{ $auth.user.name }}
        </a>
        <nuxt-link v-else to="/account/login">
          <span>
            <v-icon scale="1.8" name="md-vpnkey-twotone" />
          </span>
        </nuxt-link>
        <a class="mt-4 mobile" href="javascript:void(0)" @click.prevent="mobileMenu = false">
          <span>
            <v-icon scale="3" name="md-close-twotone" />
          </span>
        </a>
      </div>
    </nav>
  </transition>
</template>

<script>
export default {
  data() {
    return {
      mobileMenu: false,
      section: null,
      links: {
        base: [
          {
            icon: "md-calendartoday-twotone",
            title: "Сегодняшний день",
            to: "/"
          },
          {
            icon: "md-accesstime-twotone",
            title: "Расписание уроков",
            to: "/schedules"
          },
          {
            icon: "md-changecircle-twotone",
            title: "Замены в расписании",
            to: "/replacements"
          },
          {
            icon: "md-locallibrary-twotone",
            title: "Предметы",
            to: "/subjects"
          },
        ],
        account: [
          {
            icon: "md-vpnkey-twotone",
            title: "Управление расписанием",
            to: "/management/schedules",
            permission: "manageDiary"
          },
          {
            icon: "md-vpnkey-twotone",
            title: "Управление предметами",
            to: "/management/subjects",
            permission: "manageDiary"
          },
          {
            icon: "md-vpnkey-twotone",
            title: "Управление звонками",
            to: "/management/bells",
            permission: "manageDiary"
          },
        ],
      }
    }
  },
  computed: {
    accountLink() {
      return this.$data.links.account.filter(link => this.$auth.user.rights.includes(link.permission));
    }
  },
  watch: {
    mobileMenu(value) {
      if (value) document.body.classList.add('navbar-open')
      else document.body.classList.remove('navbar-open')
    }
  },
  methods: {
    switchSection(sectionName) {
      if (this.section === sectionName) {
        this.section = null;
        return;
      }
      this.section = sectionName;
    }
  }
}
</script>

<style lang="scss">
.navbar-wrapper {
  @apply flex flex-col relative;
  .navbar {
    @apply rounded-md flex flex-row bg-background-100/20 p-4 items-center;
    .navbar__right {
      @apply ml-auto;
    }
    .navbar__logo {
      @apply max-w-[9rem];
    }
    .navbar__links {
      @apply flex flex-row gap-4;
      > a {
        @apply rounded-md flex font-bold py-1 px-2 transition-colors ease-out text-primary-50 gap-2 duration-100 items-center;
        &:not(.mobile) {
          @apply hidden xl:flex;
        }
        &.mobile {
          @apply flex xl:hidden;
        }
        &:hover {
          @apply bg-background-100/20;
        }
        &.nuxt-link-active {
          @apply bg-background-100/30;
        }
      }
    }
  }
  .navbar-bottom {
    @apply rounded-md flex flex-row bg-background-50/5 p-4 items-center;
    .navbar-bottom__links {
      @apply flex flex-col gap-4 lg:flex-row;
      a {
        @apply rounded-md flex flex-row font-bold py-1 px-2 transition-colors ease-out text-primary-50 gap-2 duration-100 items-center;
        &:hover {
          @apply bg-background-100/20;
        }
        &.nuxt-link-active {
          @apply bg-background-100/30;
        }
      }
    }
  }
}

.navbar-mobile {
  @apply rounded-md flex flex-col h-screen bg-background-800/80 w-full p-4 top-0 right-0 left-0 z-50 gap-16 justify-center items-center backdrop-filter fixed overflow-visible backdrop-blur-2xl;
  .navbar__logo {
    @apply max-w-[12rem];
  }
  .navbar__links {
    @apply flex flex-col text-xl gap-2 overflow-visible;
    a {
      @apply rounded-md flex font-bold text-center w-full py-2 px-6 transition-colors ease-out text-primary-50 gap-2 duration-100 justify-center items-center;
      &:hover {
        @apply bg-background-100/20;
      }
      &.nuxt-link-active {
        @apply bg-background-100/30;
      }
    }
  }
}
</style>

