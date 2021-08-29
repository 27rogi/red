<template>
  <div class="switch">
    <div v-if="isWhite" class="switch--inner" @click="$colorMode.preference = 'dark'">
      <SunIcon size="1x" />
      <p>Светлый режим</p>
    </div>
    <div v-if="!isWhite" class="switch--inner" @click="$colorMode.preference = 'light'">
      <MoonIcon size="1x" />
      <p>Темный режим</p>
    </div>
  </div>
</template>

<script>
  import {
    MoonIcon,
    SunIcon,
  } from "@vue-hero-icons/outline"

  export default {
    components: {
      MoonIcon,
      SunIcon,
    },
    computed: {
      isWhite() {
        if (this.$colorMode.value === 'light') {
          return true
        } else {
          return false
        }
      }
    },
  }

</script>

<style lang="scss">
  .switch {
    @apply cursor-pointer rounded-2xl px-4 py-1 bg-water-300 bg-opacity-70 text-sm font-medium;

    .switch--inner {
      @apply flex flex-row gap-2 items-center;
    }
  }

  .dark .switch {
    @apply bg-mariner-light-800 bg-opacity-10;
  }

</style>
