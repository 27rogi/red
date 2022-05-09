<template>
  <div class="loader">
    <div class="loader--item">
      <FulfillingSquareSpinner :animation-duration="4000" :size="80" color="#fff" />
      <p>Идет загрузка информации</p>
    </div>
  </div>
</template>

<script>
import { FulfillingSquareSpinner } from 'epic-spinners/dist/lib/epic-spinners.min.js'

export default {
  components: {
    FulfillingSquareSpinner,
  }
}
</script>

<style lang="scss">
.loader {
  @apply rounded-md flex flex-col bg-background-100/10 py-6 inset-0 z-40 justify-center items-center relative;
  .loader--item {
    @apply flex flex-col z-50 items-center;
    p {
      @apply font-semibold mt-4 text-xl text-primary-50;
    }
  }
}
</style>
