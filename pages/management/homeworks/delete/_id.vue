<template>
  <div>
    <transition name="fade" mode="out-in">
      <uiLoader v-if="$fetchState.pending" />
      <div v-else-if="$fetchState.error">
        <p>Такой замены не существует!</p>
      </div>
      <div v-else class="deleting">
        <uiLoader v-if="isLoading" />
        <h1>Вы собираетесь удалить замену #{{$route.params.id}}</h1>
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
        `http://localhost:3050/v1/diary/homeworks/${this.$route.params.id}?extras=subject`
      ));
    },
    methods: {
      processDelete() {
        this.isLoading = true;
        this.$axios.$delete(`http://localhost:3050/v1/diary/homeworks/${this.$route.params.id}`).then((res) => {
          this.$router.push({ path: '/management/homeworks' });
          this.$toasted.show(`Замена #${this.$route.params.id} успешно удалена`, {type: 'success'});
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
      @apply bg-mariner-500 text-white rounded-2xl flex flex-col gap-2 p-6 mb-4;

      h6 {
        @apply font-semibold text-xl;
      }

      &__error {
        @apply text-white bg-red-600;
      }
    }

    .deleting--problems {
      @apply flex flex-col gap-1;

      .deleting--warning {
        @apply mt-4 text-xl font-medium;
      }

      .deleting--problem {
        @apply flex text-red-600 flex-row text-lg font-medium items-center gap-2;
      }
    }
  }

</style>
