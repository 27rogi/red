<template>
  <div>
    <transition name="fade" mode="out-in">
      <uiLoader v-if="$fetchState.pending" />
      <p v-else-if="$fetchState.error">{{ $fetchState.error }}</p>
      <div v-else class="homeworks">
        <div class="homeworks--header">
          <h1>Список домашнего задания</h1>
          <nuxt-link class="button" :to="{ path: '/management/homeworks/add', query: { 'diff': true }}">Добавить задание</nuxt-link>
        </div>
        <nuxt-link v-for="homework in homeworks" :key="homework.homeworkId" :to="{path: `/homeworks/${homework.homeworkId}`}">
        <div class="homework">
          <div class="homework--header">
            <h2 class="homework--name">{{homework.subject.name}} (до {{$moment(homework.date, 'DD/MM/YYYY').format('DD MMMM')}})</h2>
            <div class="homework--arrow"><ArrowNarrowRightIcon /></div>
          </div>
          <div class="homework--info">
            <p class="info--heading">Описание</p>
            <p v-html="homework.mission.replaceAll('\n', '<br>')" />
            <p v-if="homework.files && homework.files.length > 0" class="mt-6 info--heading">Дополнительный материал</p>
            <p v-if="homework.files && homework.files.length > 0">К заданию прикреплено {{homework.files.length}} файл(а)(ов)</p>
          </div>
        </div>
        </nuxt-link>
      </div>
    </transition>
  </div>
</template>

<script>
import { ArrowNarrowRightIcon } from "@vue-hero-icons/outline"
  export default {
    components: {
      ArrowNarrowRightIcon,
    },
    data() {
      return {
        homeworks: {},
      }
    },
    async fetch() {
      const homeworks = (await this.$axios.$get(
        `https://api.ryzhenkov.space/v1/diary/homeworks?sortBy=homeworkId%3Aasc&limit=9999&page=1&extras=subject`,
      )).results

      // sorting homeworks by deadline date
      homeworks.sort((currentHomework, nextHomework) => {
        const currentDate = this.$moment(currentHomework.date, 'DD/MM/YYYY');
        const nextDate = this.$moment(nextHomework.date, 'DD/MM/YYYY');

        if (!currentDate.isAfter(nextDate)) return -1;
        else if (currentDate.isAfter(nextDate)) return 1;
        else return 0;
      });

      this.homeworks = homeworks;
    },
  }

</script>

<style lang="scss" scoped>
  .homeworks {
    @apply flex flex-col gap-4;
    .homeworks--header {
      @apply flex flex-col sm:flex-row gap-4 items-center justify-center;
      .button {
        @apply w-full sm:w-auto ml-auto;
      }
    }

    .homework {
      @apply cursor-pointer flex flex-col gap-2 bg-mariner-300 bg-opacity-10 rounded-2xl;
      .homework--header {
        @apply w-full flex flex-row gap-2 p-4 bg-mariner-500 bg-opacity-10 rounded-2xl items-center;
        .homework--name {
          @apply px-2 py-2 font-semibold text-xl text-water-600;
        }
        .homework--arrow {
          @apply ml-auto px-2 py-2 rounded-full;
        }
      }
      .homework--info {
        @apply p-4 text-lg font-medium text-water-500;
        .info--heading {
          @apply text-water-800 font-semibold text-xl;
        }
      }
      &:hover {
        @apply opacity-80;
      }
    }
  }

  .dark .homework {
        @apply bg-water-dark-600 bg-opacity-30;

        .homework--header {
          @apply bg-water-dark-600 bg-opacity-50;

          .homework--name {
            @apply text-water-dark-50;
          }
        }

        .homework--info {
          @apply text-water-dark-200;

          .info--heading {
            @apply text-water-dark-50;
          }
        }
      }

</style>
