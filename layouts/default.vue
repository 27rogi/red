<template>
  <div class="app">
    <ColorScheme tag="span">
      <div class="sidebar-container">
        <uiSidebar />
      </div>
      <div class="content-container">
        <Nuxt />
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
  @apply font-body relative h-full;
}

body {
  @apply h-full text-water-600;
}

.app {
  @apply relative flex flex-row min-h-screen bg-mariner-light-100;
  .sidebar-container {
    @apply flex-grow-0 flex-shrink-0 md:w-[20%] w-0 relative;
  }
  .content-container {
    @apply relative overflow-hidden flex-grow-0 flex-shrink-0 md:w-[80%] w-full px-6 py-10;
    h1 {
      @apply mb-2 text-xl md:text-2xl xl:text-3xl 2xl:text-4xl font-semibold;
    }
  }
}

.dark .app {
  @apply bg-mariner-dark-900;
}

.dark body {
  @apply text-mariner-dark-200;
}
</style>
