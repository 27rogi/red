<template>
  <div class="app">
    <ColorScheme tag="span">
      <div class="background" :class="{ animated: !$device.isFirefox }" />
      <div class="content-wrapper">
        <div class="content">
          <uiNavbar class="mb-4" />
          <Nuxt />
        </div>
      </div>
    </ColorScheme>
  </div>
</template>

<script>
import 'epic-spinners/dist/lib/epic-spinners.min.css'

export default {
}
</script>

<style lang="scss">
html {
  @apply font-body h-full relative;
}

body {
  @apply h-full text-slate-200/90;
  &:not(.navbar-open) {
    .app .content-wrapper {
      @apply backdrop-filter backdrop-blur-[62px] backdrop-saturate-150;
    }
  }
}

.app {
  @apply flex flex-col text-slate-200/90 relative;
  .content-wrapper {
    @apply min-h-screen bg-background-800/80 z-20;
    .content {
      @apply mx-auto flex-grow-0 flex-shrink-0 w-full max-w-screen-2xl py-10 px-6 z-20 relative overflow-hidden;
      h1.page-title {
        @apply font-semibold text-xl px-4 md:text-2xl xl:text-3xl 2xl:text-4xl;
      }
    }
  }

  .background {
    &.animated {
      background-image: url("@/static/bg.svg");
      background-position-y: -8rem;
      background-position-x: -10rem;
      background-size: 150%;
      background-repeat: no-repeat;
    }
    @apply h-full bg-background-800 w-full z-10 absolute;
  }
}
</style>
