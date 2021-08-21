<template>
  <div class="error">
    <div v-if="error.statusCode === 404">
      <h1>Страница не существует :(</h1>
      <p>Проверьте правильность написания адреса, возможно вы ошиблись.</p>
    </div>
    <div v-else>
      <h1>В системе возникла ошибка!</h1>
      <p>Сообщите об этой проблеме администратору, код ошибки:</p>
      <p><b>{{ error }}</b></p>
    </div>
    <div class="error--actions">
      <a v-if="historySize !== 0" href="javascript:void(0)" @click="$router.go(-1)">Вернуться назад</a>
      <NuxtLink to="/">Вернуться на главную</NuxtLink>
    </div>
  </div>
</template>

<script>
  export default {
    props: ['error'],
    data() {
      return {
        historySize: 0,
      }
    },
    mounted() {
      this.$data.historySize = window.history.length;
    }
  }
</script>

<style lang="scss">
.error {
  @apply min-h-full flex flex-col items-center justify-center;
  div {
    @apply flex flex-col items-center;
  }
  .error--actions {
    @apply flex gap-4 md:flex-row w-full md:w-1/2 mt-4;
    a {
      @apply w-full text-center bg-mariner-light-200 px-6 py-2 rounded-2xl;

      &:hover {
        @apply bg-mariner-200;
      }
    }
  }
}
</style>
