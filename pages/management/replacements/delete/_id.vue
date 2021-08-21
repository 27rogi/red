<template>
  <div>
    <transition name="fade" mode="out-in">
      <uiLoader v-if="$fetchState.pending" />
      <div v-else-if="$fetchState.error">
        <p>Такого расписания не существует!</p>
      </div>
      <div v-else class="deleting">
        <uiLoader v-if="isLoading" />
        <div v-if="success" class="deleting--message">
          <h6>Успешное удаление</h6>
          <p>Данное расписание было удалено из системы!</p>
          <p>Вы будете автоматически направлены на список расписаний через {{timeout}}...</p>
        </div>
        <h1>Вы собираетесь удалить расписание #{{$route.params.id}}</h1>
        <div v-if="problems.length > 0" class="deleting--problems">
          <p class="deleting--warning">Обнаружены следующие проблемы, которые мешают удалению расписания:</p>
          <p v-for="problem in problems" :key="problem" class="deleting--problem"><span>
              <ExclamationIcon size="1.5x" /></span> {{problem}}</p>
        </div>
        <button v-if="problems.length === 0 && !success" @click="processDelete">Подтвердить удаление</button>
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
        timeout: 3,
        success: null,
        schedule: null,
        problems: [],
      }
    },
    async fetch() {
      this.$data.schedule = (await this.$axios.$get(
        `http://localhost:3050/v1/diary/schedules/${this.$route.params.id}?extras=replacement`
      ));

      if (this.schedule.replacement) {
        this.problems.push(
          `Данное расписание используется в замене #${this.schedule.replacement.replacementId}, удалите замену для продолжения.`
        );
      }
    },
    methods: {
      processDelete() {
        this.isLoading = true;
        this.$axios.$delete(`http://localhost:3050/v1/diary/schedules/${this.$route.params.id}`).then((res) => {
          const self = this;
          this.success = true;
          setTimeout(function run() {
            if(self.timeout > 0) {
              self.timeout -= 1;
              setTimeout(run, 1000);
            } else {
              self.$router.push({ path: '/management/schedules' });
            }
          }, 1000);
        }).catch(() => {
          this.success = null;
          this.problems.push("Ошибка удаления, обратитесь к администратору!");
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

    button {
      @apply w-full text-center bg-mariner-light-200 px-6 py-2 rounded-2xl;

      &:hover {
        @apply bg-mariner-200;
      }
    }
  }

</style>
