<template>
    <div class="loader">
    <div class="loader--item">
      <FulfillingSquareSpinner
        :animation-duration="4000"
        :size="80"
        color="#150029"
      />
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
  @apply z-40 flex flex-col justify-center items-center backdrop-filter backdrop-blur-sm bg-mariner-light-200 bg-opacity-20 absolute inset-0;
  .loader--item {
    @apply flex items-center flex-col z-50;
    p {
      color: #150029;
      @apply p-6 text-xl font-semibold;
    }
  }
}
</style>
