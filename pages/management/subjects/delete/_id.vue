<template>
  <div>
    <transition name="fade" mode="out-in">
      <uiLoader v-if="$fetchState.pending" />
      <div v-else-if="$fetchState.error">
        <p>Такого предмета не существует!</p>
      </div>
      <div v-else class="deleting">
        <uiLoader v-if="isLoading" />
        <h1>Вы собираетесь удалить предмет #{{$route.params.id}}</h1>
        <div v-if="problems.length > 0" class="deleting--problems">
          <p class="deleting--warning">Обнаружены следующие проблемы, которые мешают удалению предмета:</p>
          <p v-for="problem in problems" :key="problem" class="deleting--problem"><span>
              <ExclamationIcon size="1.5x" /></span> {{problem}}</p>
        </div>
        <button class="button button__w-full" v-if="problems.length === 0" @click="processDelete">Подтвердить удаление</button>
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
        schedules: null,
        replacements: null,
        problems: [],
      }
    },
    async fetch() {
      this.$data.schedules = (await this.$axios.$get(
        `http://localhost:3050/v1/diary/schedules?subjectId=${this.$route.params.id}&limit=99999&page=1`
      )).results;
      this.$data.replacements = (await this.$axios.$get(
        `http://localhost:3050/v1/diary/replacements?replacingSubject=${this.$route.params.id}&limit=99999&page=1`
      )).results;

      if (this.schedules.length > 0) {
        this.schedules.forEach((schedule) => {
          this.problems.push(
            `Данный предмет используется в уроке #${schedule.scheduleId}, удалите его для продолжения.`
          );
        });
      }
      if (this.$data.replacements.length > 0) {
        this.replacements.forEach((replacement) => {
          this.problems.push(
            `Данный предмет используется в замене #${replacement.replacementId}, удалите ее для продолжения.`
          );
        });
      }
    },
    methods: {
      processDelete() {
        if(this.problems.length > 0) return;

        this.isLoading = true;
        this.$axios.$delete(`http://localhost:3050/v1/diary/subjects/${this.$route.params.id}`).then((res) => {
          this.$router.push({ path: '/management/subjects' });
          this.$toasted.show(`Предмет #${this.$route.params.id} успешно удален`, {type: 'success'});
        }).catch((err) => {
          if(err.response && err.response.status === 400) {
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
