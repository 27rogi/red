<template>
  <div>
    <transition name="fade" mode="out-in">
      <uiLoader v-if="$fetchState.pending" />
      <div v-else-if="$fetchState.error">
        <p>Такого звонка не существует!</p>
      </div>
      <div v-else class="deleting">
        <uiLoader v-if="isLoading" />
        <h1>Вы собираетесь удалить звонок #{{ $route.params.id }}</h1>
        <div v-if="problems.length > 0" class="deleting--problems">
          <p
            class="deleting--warning"
          >Обнаружены следующие проблемы, которые мешают удалению звонка:</p>
          <p v-for="problem in problems" :key="problem" class="deleting--problem">
            <span>
              <ExclamationIcon size="1.5x" />
            </span>
            {{ problem }}
          </p>
        </div>
        <button
          class="button button__w-full"
          v-if="problems.length === 0"
          @click="processDelete"
        >Подтвердить удаление</button>
      </div>
    </transition>
  </div>
</template>

<script>
import {
  ExclamationIcon
} from "@vue-hero-icons/outline"
export default {
  components: {
    ExclamationIcon,
  },
  data() {
    return {
      isLoading: false,
      schedules: null,
      problems: [],
    }
  },
  methods: {
    processDelete() {
      if (this.problems.length > 0) return;

      this.isLoading = true;
      this.$axios.$delete(`${process.env.baseUrl}/v1/diary/bells/${this.$route.params.id}`).then((res) => {
        this.$router.push({ path: '/management/bells' });
        this.$toasted.show(`Звонок #${this.$route.params.id} успешно удален`, { type: 'success' });
      }).catch((err) => {
        if (err.response && err.response.status === 400) {
          this.$toasted.show(`Ошибка в заполнении данных!`);
        } else {
          this.$toasted.show(`Внутренняя ошибка сервера!`);
        }
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
