<template>
  <div class="app">
    <div class="sidebar-container">
      <uiSidebar />
    </div>
    <div class="content-container">
      <Nuxt />
    </div>
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
    @apply flex-grow-0 flex-shrink-0 sm:w-[20%] w-0 relative;
  }
  .content-container {
    @apply relative overflow-hidden flex-grow-0 flex-shrink-0 sm:w-[80%] w-full px-6 py-10;
    h1 {
      @apply mb-2 text-4xl font-semibold;
    }
  }
}

.fade-enter-active, .fade-leave-active {
  @apply transition-all duration-100 ease-in;
}
.fade-enter, .fade-leave-to {
  @apply transform-gpu -translate-y-1 opacity-0;
}
</style>
