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
    @apply flex-grow-0 flex-shrink-0 md:w-[20%] w-0 relative;
  }
  .content-container {
    @apply relative overflow-hidden flex-grow-0 flex-shrink-0 md:w-[80%] w-full px-6 py-10;
    h1 {
      @apply mb-2 text-xl md:text-2xl xl:text-3xl 2xl:text-4xl font-semibold;
    }
  }
}

.toasted.toasted-primary {
  @apply py-2 px-4 font-medium shadow-none rounded-2xl bg-water-600 text-water-50 #{!important};
  &.success {
    @apply bg-green-500 #{!important};
  }
}

.mx-datepicker-main {
  @apply bg-water-100 border-none rounded-2xl #{!important};
  &.mx-datepicker-popup {
    @apply shadow-2xl #{!important};
  }
}

.multiselect__placeholder {
  @apply text-water-600;
}

.fade-enter-active, .fade-leave-active {
  @apply transition-all duration-100 ease-in;
}
.fade-enter, .fade-leave-to {
  @apply transform-gpu -translate-y-1 opacity-0;
}
</style>
