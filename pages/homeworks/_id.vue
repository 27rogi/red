<template>
  <uiLoader v-if="$fetchState.pending" />
  <div v-else-if="$fetchState.error">
    <p>Такого домашнего задания больше не существует!</p>
  </div>
  <div v-else class="homework--wrapper">
    <div class="homework--header">
      <h1>Просмотр домашнего задания №{{$route.params.id}}</h1>
      <nuxt-link class="button" :to="{ path: '/management/homeworks/' + homework.homeworkId, query: { 'diff': true }}">Исправить задание</nuxt-link>
    </div>
    <div class="homework">
      <p class="homework--subject">Задание по предмету "{{homework.subject.name}}"</p>
      <p class="homework--added">Добавлен: <span>{{$moment(homework.created).format('DD MMMM YYYY')}}</span></p>
      <p class="homework--mission">Цель задания:</p>
      <div>
        <p v-html="homework.mission.replace('\n', '<br/>')" />
      </div>
      <div v-if="homework.files && homework.files.length > 0" class="homework--files">
        <p class="files--title">Дополнительные материалы</p>
        <div class="files">
          <a v-for="file in homework.files" :key="file" :href="file"><img :src="file" :alt="file" /></a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      homework: null,
    }
  },
  async fetch() {
    this.$data.homework = (await this.$axios.$get(
      `https://api.ryzhenkov.space/v1/diary/homeworks/${this.$route.params.id}?extras=subject`
    ));
  },
}

</script>

<style lang="scss">
  .homework--wrapper {
    @apply flex flex-col gap-4;
    .homework--header {
      @apply flex flex-col sm:flex-row gap-4 items-center justify-center;
      .button {
        @apply w-full sm:w-auto ml-auto;
      }
    }
    .homework {
      @apply flex flex-col gap-4 bg-mariner-light-200 bg-opacity-50 p-6 rounded-2xl;
      .homework--subject {
        @apply font-semibold text-xl sm:text-2xl;
      }
      .homework--mission {
        @apply font-semibold text-xl;
      }
      .homework--added {
        @apply font-semibold text-xl;
        span {
          @apply font-medium text-water-900 text-opacity-60;
        }
      }
      .homework--files {
        .files--title {
          @apply font-semibold text-xl mb-4;
        }
        .files {
          @apply flex flex-col md:flex-row gap-4;
          img {
            @apply max-h-64;
          }
        }
      }
    }
  }
</style>
