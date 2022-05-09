<template>
  <div>
    <transition name="fade" mode="out-in">
      <uiLoader v-if="$fetchState.pending" />
      <div v-else-if="$fetchState.error">
        <p>Такой замены не существует!</p>
      </div>
      <div v-else class="deleting">
        <uiLoader v-if="isLoading" />
        <h1>Вы собираетесь удалить замену #{{ $route.params.id }}</h1>
        <button class="button button__w-full" @click="processDelete">Подтвердить удаление</button>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isLoading: false,
      homework: null,
    }
  },
  async fetch() {
    this.$data.homework = (await this.$axios.$get(
      `${process.env.baseUrl}/v1/diary/homeworks/${this.$route.params.id}?extras=subject`
    ));
  },
  methods: {
    processDelete() {
      this.isLoading = true;
      this.$axios.$delete(`${process.env.baseUrl}/v1/diary/homeworks/${this.$route.params.id}`).then((res) => {
        this.$router.push({ path: '/management/homeworks' });
        this.$toasted.show(`Замена #${this.$route.params.id} успешно удалена`, { type: 'success' });
      }).finally(() => {
        this.isLoading = false;
      });
    }
  }
}

</script>

<style lang="scss">
.deleting {
  .deleting--message {
    @apply flex flex-col bg-primary-500 rounded-2xl text-white mb-4 p-6 gap-2;

    h6 {
      @apply font-semibold text-xl;
    }

    &__error {
      @apply bg-red-600 text-white;
    }
  }

  .deleting--problems {
    @apply flex flex-col gap-1;

    .deleting--warning {
      @apply font-medium mt-4 text-xl;
    }

    .deleting--problem {
      @apply flex flex-row font-medium text-lg text-red-600 gap-2 items-center;
    }
  }
}
</style>
